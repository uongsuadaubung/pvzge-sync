import type { SaveData } from "@/domains/game/schema.ts";
import { hasProgress } from "@/domains/game/progress.ts";
import type { SyncResponse } from "@/shared/types.ts";
import {
  getLastSyncedHash,
  getSessionGistCache,
  setAutoSyncStatus,
  setLastSync,
  setLastSyncedHash,
  setSessionGistCache,
} from "@/shared/storage.ts";
import { IGNORED_KEYS } from "@/shared/constants.ts";
import { getActiveTab, getGameTabs, isGameUrl } from "@/shared/tabs.ts";

import { downloadFromGist, uploadToGist } from "@/domains/github/api.ts";

function stripIgnoredKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripIgnoredKeys);
  }
  if (typeof obj === "object" && obj !== null) {
    const clean: Record<string, unknown> = {};
    // Sắp xếp các khóa của object theo thứ tự bảng chữ cái để đảm bảo thứ tự các khóa luôn đồng nhất (canonical JSON)
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      if (IGNORED_KEYS.includes(key)) continue;
      const val = Reflect.get(obj, key);
      clean[key] = stripIgnoredKeys(val);
    }
    return clean;
  }
  return obj;
}

export async function computeHash(obj: unknown): Promise<string> {
  if (!obj) return "";
  const cleanObj = stripIgnoredKeys(obj);
  const str = JSON.stringify(cleanObj);
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return hashHex;
}

/**
 * Giữ nguyên thông tin thời gian cục bộ (date/time) khi áp dụng dữ liệu từ Cloud.
 * Điều này tránh gây xung đột logic thời gian trong game.
 */
export function preserveLocalDate(remote: SaveData, local: SaveData): SaveData {
  return {
    ...remote,
    PvZ2_PlayerProperties: remote.PvZ2_PlayerProperties.map((profile) => {
      const localProfile = local.PvZ2_PlayerProperties.find((p) =>
        p.name === profile.name
      );
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
  const tab = await getActiveTab();
  if (tab?.url && isGameUrl(tab.url) && tab.id) return tab.id;

  const tabs = await getGameTabs();
  if (tabs[0]?.id) return tabs[0].id;

  throw new Error("msg_game_not_open");
}

/**
 * Áp dụng dữ liệu Save Data vào trang game (thông qua Content Script).
 */
export async function applyRemoteToGame(data: SaveData): Promise<void> {
  const targetId = await getTargetTab();
  console.log("[Sync] Applying data to game tab:", targetId);

  await new Promise<void>((resolve, reject) => {
    chrome.tabs.sendMessage(
      targetId,
      { type: "APPLY_REMOTE_DATA", data },
      (r: SyncResponse | undefined) => {
        if (chrome.runtime.lastError || !r?.success) {
          reject(
            new Error(chrome.runtime.lastError?.message ?? "Apply failed"),
          );
          return;
        }
        resolve();
      },
    );
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
    chrome.tabs.sendMessage(
      targetId,
      { type: "GET_LOCAL_DATA" },
      (r: SyncResponse | undefined) => {
        if (chrome.runtime.lastError || !r) {
          reject(new Error("Connection error"));
          return;
        }
        if (!r.success) {
          reject(new Error(r.error));
          return;
        }
        if (!("data" in r)) {
          reject(new Error("Local data not found"));
          return;
        }
        resolve(r.data);
      },
    );
  });
}

export type SmartSyncResult =
  | { type: "no_action" }
  | { type: "synced"; detail: "upload" | "download" }
  | { type: "conflict"; localData: SaveData; cloudData: SaveData }
  | { type: "download_blocked" };

/**
 * Smart Sync Logic (3-Way Hash-based):
 * 1. Lấy dữ liệu Local và Cloud.
 * 2. Tính toán mã băm SHA-256 cho cả 2 bên (đã loại bỏ trường thời gian game).
 * 3. So sánh 3 chiều giữa Local (H_local), Cloud (H_cloud) và snapshot đồng bộ gần nhất (H_base).
 * 4. Quyết định hành động an toàn tối ưu hoặc kích hoạt xung đột.
 */
export async function smartSync(isAuto = false): Promise<SmartSyncResult> {
  console.log("[SmartSync] Starting 3-way sync process...");

  const local = await getLocalData().catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg === "msg_game_not_open" ||
      msg === "Connection error" ||
      msg.includes("not found")
    ) {
      console.warn("[SmartSync] Could not get local data (not ready or empty):", msg);
      return null;
    }
    throw err;
  });

  // Đọc dữ liệu từ Session Cache
  let cloud: SaveData | null = await getSessionGistCache();

  if (cloud) {
    console.log("[SmartSync] Using cached Cloud data from RAM session.");
  } else {
    console.log("[SmartSync] Cache is empty. Fetching fresh from Gist...");
    const r = await downloadFromGist();
    cloud = (r.success && "data" in r) ? r.data : null;
    if (cloud) {
      await setSessionGistCache(cloud);
    }
  }

  const H_local = await computeHash(local);
  const H_cloud = await computeHash(cloud);
  const H_base = await getLastSyncedHash();

  console.log(
    "[SmartSync] Hash comparison: Local =",
    H_local,
    "Cloud =",
    H_cloud,
    "Base =",
    H_base,
  );

  // Nếu cả 2 bên giống nhau y hệt
  if (H_local === H_cloud) {
    console.log("[SmartSync] Local and Cloud are already identical.");
    if (H_base !== H_local) {
      await setLastSyncedHash(H_local);
    }
    if (isAuto) {
      await setAutoSyncStatus("status_auto_sync_identical", "success");
    }
    return { type: "no_action" };
  }

  // Trường hợp A: Cả hai bên đều không đổi so với snapshot
  if (H_local === H_base && H_cloud === H_base) {
    console.log("[SmartSync] Both Local and Cloud are unchanged.");
    if (isAuto) {
      await setAutoSyncStatus("status_auto_sync_no_changes", "info");
    }
    return { type: "no_action" };
  }

  // Trường hợp B: Chỉ Local thay đổi -> Auto Upload lên Cloud
  if (H_local !== H_base && H_cloud === H_base) {
    if (!local) {
      console.log("[SmartSync] Local changes detected, but local is empty.");
      if (isAuto) {
        await setAutoSyncStatus("status_auto_sync_empty_local", "warning");
      }
      return { type: "no_action" };
    }

    // Nếu dữ liệu local là "New Game" (không có tiến trình) trong khi cloud đã có tiến trình chơi thực tế,
    // ta không được auto-upload ghi đè lên cloud mà phải kích hoạt trạng thái xung đột (conflict).
    if (!hasProgress(local) && hasProgress(cloud)) {
      console.warn(
        "[SmartSync] Local has no progress (new game) but Cloud has progress. Triggering conflict to prevent cloud save overwrite.",
      );
      if (isAuto) {
        await setAutoSyncStatus("status_auto_sync_conflict", "warning");
      }
      return { type: "conflict", localData: local, cloudData: cloud };
    }

    console.log("[SmartSync] Only Local changed. Auto-uploading to Cloud...");
    const uploadR = await uploadToGist(local);
    if (uploadR.success) {
      await setSessionGistCache(local); // Đồng bộ cache local vừa upload thành cloud cache
      await setLastSync();
      await setLastSyncedHash(H_local);
      console.log("[SmartSync] Auto-upload completed successfully.");
      if (isAuto) {
        await setAutoSyncStatus("status_auto_sync_success_upload", "success");
      }
      return { type: "synced", detail: "upload" };
    } else {
      console.error("[SmartSync] Upload failed:", uploadR.error);
      if (isAuto) {
        await setAutoSyncStatus(uploadR.error || "Upload failed", "error");
      }
      throw new Error(uploadR.error);
    }
  }

  // Trường hợp C: Chỉ Cloud thay đổi -> Auto Download về máy
  if (H_local === H_base && H_cloud !== H_base) {
    if (!cloud) {
      console.log("[SmartSync] Cloud changes detected, but cloud is empty.");
      if (isAuto) {
        await setAutoSyncStatus("status_auto_sync_no_changes", "info");
      }
      return { type: "no_action" };
    }
    if (isAuto) {
      console.log(
        "[SmartSync] Cloud changed, but auto-sync is enabled. Download is blocked.",
      );
      await setAutoSyncStatus("status_auto_sync_download_blocked", "warning");
      return { type: "download_blocked" };
    }
    console.log(
      "[SmartSync] Only Cloud changed. Auto-downloading from Cloud...",
    );
    const dataToApply = local ? preserveLocalDate(cloud, local) : cloud;
    await applyRemoteToGame(dataToApply);
    await setLastSync();
    await setLastSyncedHash(H_cloud);
    console.log("[SmartSync] Auto-download completed successfully.");
    return { type: "synced", detail: "download" };
  }

  // Trường hợp D: Cả hai bên đều thay đổi và khác nhau -> XUNG ĐỘT!
  if (H_local !== H_base && H_cloud !== H_base && H_local !== H_cloud) {
    if (!local || !cloud) {
      console.warn(
        "[SmartSync] Conflict detected but local or cloud is empty.",
        { local: !!local, cloud: !!cloud },
      );
      if (isAuto) {
        await setAutoSyncStatus("status_auto_sync_no_changes", "info");
      }
      return { type: "no_action" };
    }
    console.log(
      "[SmartSync] Real conflict detected! Both Local and Cloud have changed independently.",
    );
    if (isAuto) {
      await setAutoSyncStatus("status_auto_sync_conflict", "warning");
    }
    return { type: "conflict", localData: local, cloudData: cloud };
  }

  if (isAuto) {
    await setAutoSyncStatus("status_auto_sync_no_changes", "info");
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
  await setSessionGistCache(local); // Cập nhật cache
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
  const local = await getLocalData().catch((err) => {
    console.warn(
      "[Sync] Could not get local data for force download (game not open?):",
      err,
    );
    return null;
  });
  const r = await downloadFromGist();
  if (!r.success) {
    throw new Error(r.error || "Force download failed");
  }
  if (!("data" in r)) {
    throw new Error("No data found in Gist response");
  }
  await setSessionGistCache(r.data); // Ghi lại cache mới
  const dataToApply = local ? preserveLocalDate(r.data, local) : r.data;
  await applyRemoteToGame(dataToApply);
  const H_cloud = await computeHash(r.data);
  await setLastSync();
  await setLastSyncedHash(H_cloud);
  console.log("[Sync] Force download completed successfully.");
}

/**
 * Khôi phục phiên bản Save Data từ lịch sử.
 */
export async function restoreHistoryVersion(data: SaveData): Promise<void> {
  console.log("[Sync] Restoring save data from historical commit...");
  await setSessionGistCache(data); // Cập nhật cache của lịch sử làm cache đám mây hiện hành
  const local = await getLocalData().catch((err) => {
    console.warn(
      "[Sync] Could not get local data for restore (game not open?):",
      err,
    );
    return null;
  });
  const dataToApply = local ? preserveLocalDate(data, local) : data;
  await applyRemoteToGame(dataToApply);
  const H_cloud = await computeHash(data);
  await setLastSync();
  await setLastSyncedHash(H_cloud);
  console.log("[Sync] Historical save data restored successfully.");
}

/**
 * Xóa sạch tiến trình game cục bộ trên trang game (thông qua Content Script).
 */
export async function clearLocalGameData(): Promise<void> {
  const targetId = await getTargetTab();
  console.log("[Sync] Clearing local game data on tab:", targetId);

  await new Promise<void>((resolve, reject) => {
    chrome.tabs.sendMessage(
      targetId,
      { type: "CLEAR_LOCAL_DATA" },
      (r: SyncResponse | undefined) => {
        if (chrome.runtime.lastError || !r?.success) {
          reject(
            new Error(chrome.runtime.lastError?.message ?? "Clear failed"),
          );
          return;
        }
        resolve();
      },
    );
  });
}
