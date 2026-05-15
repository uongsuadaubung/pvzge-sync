import type { SaveData } from "@/domains/game/schema";
import type { SyncResponse } from "@/shared/types";
import { getLastSync, setLastSync } from "@/shared/storage";
import { GAME_HOST, IGNORED_KEYS } from "@/shared/constants";

import { uploadToGist, downloadFromGist } from "@/domains/github/api";

/**
 * So sánh sâu hai đối tượng dữ liệu, bỏ qua các trường không cần thiết (như date/time).
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  if (a === null || b === null || typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj).filter((k) => !(IGNORED_KEYS as readonly string[]).includes(k));
    const bKeys = Object.keys(bObj).filter((k) => !(IGNORED_KEYS as readonly string[]).includes(k));
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((k) => Object.prototype.hasOwnProperty.call(bObj, k) && deepEqual(aObj[k], bObj[k]));
  }

  return false;
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

/**
 * Smart Sync Logic:
 * 1. Tải bản lưu từ Cloud (Gist).
 * 2. Nếu Cloud mới hơn (dựa trên updated_at vs lastSync) -> Tải về máy.
 * 3. Nếu local có thay đổi (so với Cloud) và được phép Push -> Đẩy lên Cloud.
 *
 * @param allowPush - Có cho phép ghi đè dữ liệu lên Cloud hay không.
 */
export async function smartSync(allowPush = false): Promise<boolean> {
  console.log("[SmartSync] Starting sync process... (allowPush:", allowPush, ")");

  const local = await getLocalData().catch(() => {
    console.warn("[SmartSync] Could not get local data (game not open?)");
    return null;
  });

  const r = await downloadFromGist();
  const lastSync = (await getLastSync()) ?? 0;

  // Trường hợp 1: Dữ liệu trên Cloud mới hơn thời điểm đồng bộ cuối cùng
  if (r.success && "gistUpdatedAt" in r && r.gistUpdatedAt > lastSync) {
    console.log("[SmartSync] Cloud data is newer. Pulling...");
    await applyRemoteToGame(local ? preserveLocalDate(r.data, local) : r.data);
    return true;
  }

  // Nếu không cho phép Push hoặc không có dữ liệu local thì dừng ở đây
  if (!allowPush || !local) {
    console.log("[SmartSync] No pull needed and push not allowed/possible.");
    return false;
  }

  // Trường hợp 2: Kiểm tra xem Local có gì mới so với Cloud không
  if (r.success && "data" in r && deepEqual(local, r.data)) {
    console.log("[SmartSync] Local and Cloud are identical. No action needed.");
    return false;
  }

  // Trường hợp 3: Local mới hơn hoặc Cloud chưa có dữ liệu -> Push lên
  console.log("[SmartSync] Local changes detected. Uploading to Cloud...");
  const uploadR = await uploadToGist(local);
  if (uploadR.success) {
    await setLastSync();
    console.log("[SmartSync] Sync completed successfully.");
    return true;
  } else {
    console.error("[SmartSync] Upload failed:", uploadR.error);
    throw new Error(uploadR.error);
  }
}
