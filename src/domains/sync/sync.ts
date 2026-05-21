import type { SaveData } from "@/domains/game/schema";
import type { SyncResponse } from "@/shared/types";
import { setLastSync, getLastSyncedHash, setLastSyncedHash } from "@/shared/storage";
import { GAME_HOST, IGNORED_KEYS } from "@/shared/constants";

import { uploadToGist, downloadFromGist } from "@/domains/github/api";

function stripIgnoredKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripIgnoredKeys);
  }
  if (typeof obj === "object") {
    const clean: Record<string, unknown> = {};
    const objRec = obj as Record<string, unknown>;
    for (const key of Object.keys(objRec)) {
      if (IGNORED_KEYS.includes(key)) continue;
      clean[key] = stripIgnoredKeys(objRec[key]);
    }
    return clean;
  }
  return obj;
}

async function computeHash(obj: unknown): Promise<string> {
  if (!obj) return "";
  const cleanObj = stripIgnoredKeys(obj);
  const str = JSON.stringify(cleanObj);
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Giữ nguyên thông tin thời gian cục bộ (date/time) khi áp dụng dữ liệu từ Cloud.
 * Điều này tránh gây xung đột logic thời gian trong game.
 */
function preserveLocalDate(remote: SaveData, local: SaveData): SaveData {
  return {
    ...remote,
    PvZ2_PlayerProperties: remote.PvZ2_PlayerProperties.map((profile) => {
      const localProfile = local.PvZ2_PlayerProperties.find((p) => p.name === profile.name);
      if (!localProfile) return profile;
      return { ...profile, date: localProfile.date, time: localProfile.time };
    }),
  };
}

/**
 * Tìm ID của tab đang chạy game PVZGE.
 * Ưu tiên tab đang active, nếu không tìm tab đầu tiên khớp URL.
 */
export async function getTargetTab(tabId?: number): Promise<number> {
  if (tabId) return tabId;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url?.includes(GAME_HOST) && tab.id) return tab.id;

  const tabs = await chrome.tabs.query({ url: `*://${GAME_HOST}/*` });
  if (tabs[0]?.id) return tabs[0].id;

  throw new Error("Game not open");
}

/**
 * Áp dụng dữ liệu Save Data vào trang game (thông qua Content Script).
 */
export async function applyRemoteToGame(data: SaveData): Promise<void> {
  const targetId = await getTargetTab();
  console.log("[Sync] Applying data to game tab:", targetId);

  await new Promise<void>((resolve, reject) => {
    chrome.tabs.sendMessage(targetId, { type: "APPLY_REMOTE_DATA", data }, (r: SyncResponse | undefined) => {
      if (chrome.runtime.lastError || !r?.success) {
        reject(new Error(chrome.runtime.lastError?.message ?? "Apply failed"));
        return;
      }
      resolve();
    });
  });
  await setLastSync();
  console.log("[Sync] Data applied and lastSync updated.");
}

/**
 * Lấy dữ liệu Save Data hiện tại từ trang game.
 */
export async function getLocalData(): Promise<SaveData> {
  const targetId = await getTargetTab();
  console.log("[Sync] Getting local data from game tab:", targetId);

  return new Promise<SaveData>((resolve, reject) => {
    chrome.tabs.sendMessage(targetId, { type: "GET_LOCAL_DATA" }, (r: SyncResponse | undefined) => {
      if (chrome.runtime.lastError || !r) { reject(new Error("Connection error")); return; }
      if (!r.success) { reject(new Error(r.error)); return; }
      if (!("data" in r)) { reject(new Error("Local data not found")); return; }
      resolve(r.data);
    });
  });
}

export type SmartSyncResult =
  | { type: "no_action" }
  | { type: "synced" }
  | { type: "conflict"; localData: SaveData; cloudData: SaveData };

/**
 * Smart Sync Logic (3-Way Hash-based):
 * 1. Lấy dữ liệu Local và Cloud.
 * 2. Tính toán mã băm SHA-256 cho cả 2 bên (đã loại bỏ trường thời gian game).
 * 3. So sánh 3 chiều giữa Local (H_local), Cloud (H_cloud) và snapshot đồng bộ gần nhất (H_base).
 * 4. Quyết định hành động an toàn tối ưu hoặc kích hoạt xung đột.
 */
export async function smartSync(): Promise<SmartSyncResult> {
  console.log("[SmartSync] Starting 3-way sync process...");

  const local = await getLocalData().catch(() => {
    console.warn("[SmartSync] Could not get local data (game not open?)");
    return null;
  });

  const r = await downloadFromGist();
  const cloud = (r.success && "data" in r) ? r.data : null;

  const H_local = await computeHash(local);
  const H_cloud = await computeHash(cloud);
  const H_base = await getLastSyncedHash();

  console.log("[SmartSync] Hash comparison: Local =", H_local, "Cloud =", H_cloud, "Base =", H_base);

  // Nếu cả 2 bên giống nhau y hệt
  if (H_local === H_cloud) {
    console.log("[SmartSync] Local and Cloud are already identical.");
    if (H_base !== H_local) {
      await setLastSyncedHash(H_local);
    }
    return { type: "no_action" };
  }

  // Trường hợp A: Cả hai bên đều không đổi so với snapshot
  if (H_local === H_base && H_cloud === H_base) {
    console.log("[SmartSync] Both Local and Cloud are unchanged.");
    return { type: "no_action" };
  }

  // Trường hợp B: Chỉ Local thay đổi -> Auto Upload lên Cloud
  if (H_local !== H_base && H_cloud === H_base) {
    if (!local) {
      console.log("[SmartSync] Local changes detected, but local is empty.");
      return { type: "no_action" };
    }
    console.log("[SmartSync] Only Local changed. Auto-uploading to Cloud...");
    const uploadR = await uploadToGist(local);
    if (uploadR.success) {
      await setLastSync();
      await setLastSyncedHash(H_local);
      console.log("[SmartSync] Auto-upload completed successfully.");
      return { type: "synced" };
    } else {
      console.error("[SmartSync] Upload failed:", uploadR.error);
      throw new Error(uploadR.error);
    }
  }

  // Trường hợp C: Chỉ Cloud thay đổi -> Auto Download về máy
  if (H_local === H_base && H_cloud !== H_base) {
    if (!cloud) {
      console.log("[SmartSync] Cloud changes detected, but cloud is empty.");
      return { type: "no_action" };
    }
    console.log("[SmartSync] Only Cloud changed. Auto-downloading from Cloud...");
    const dataToApply = local ? preserveLocalDate(cloud, local) : cloud;
    await applyRemoteToGame(dataToApply);
    await setLastSync();
    await setLastSyncedHash(H_cloud);
    console.log("[SmartSync] Auto-download completed successfully.");
    return { type: "synced" };
  }

  // Trường hợp D: Cả hai bên đều thay đổi và khác nhau -> XUNG ĐỘT!
  if (H_local !== H_base && H_cloud !== H_base && H_local !== H_cloud) {
    if (!local || !cloud) {
      console.warn("[SmartSync] Conflict detected but local or cloud is empty.", { local: !!local, cloud: !!cloud });
      return { type: "no_action" };
    }
    console.log("[SmartSync] Real conflict detected! Both Local and Cloud have changed independently.");
    return { type: "conflict", localData: local, cloudData: cloud };
  }

  return { type: "no_action" };
}

/**
 * Cưỡng bức tải dữ liệu local lên Cloud (Ghi đè Đám mây)
 */
export async function forceUploadToCloud(): Promise<void> {
  console.log("[Sync] Force uploading local data to cloud...");
  const local = await getLocalData();
  const uploadR = await uploadToGist(local);
  if (!uploadR.success) {
    throw new Error(uploadR.error || "Force upload failed");
  }
  const H_local = await computeHash(local);
  await setLastSync();
  await setLastSyncedHash(H_local);
  console.log("[Sync] Force upload completed successfully.");
}

/**
 * Cưỡng bức tải dữ liệu từ Cloud về (Ghi đè máy này)
 */
export async function forceDownloadFromCloud(): Promise<void> {
  console.log("[Sync] Force downloading remote data from cloud...");
  const local = await getLocalData().catch(() => null);
  const r = await downloadFromGist();
  if (!r.success) {
    throw new Error(r.error || "Force download failed");
  }
  if (!("data" in r)) {
    throw new Error("No data found in Gist response");
  }
  const dataToApply = local ? preserveLocalDate(r.data, local) : r.data;
  await applyRemoteToGame(dataToApply);
  const H_cloud = await computeHash(r.data);
  await setLastSync();
  await setLastSyncedHash(H_cloud);
  console.log("[Sync] Force download completed successfully.");
}
