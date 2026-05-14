import type { SaveData } from "./schema";
import type { SyncResponse } from "./types";
import { appStore } from "./store.svelte";
import { GAME_HOST, IGNORED_KEYS } from "./constants";

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
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

function preserveLocalDate(remote: SaveData, local: SaveData): SaveData {
  return {
    ...remote,
    PvZ2_PlayerProperties: remote.PvZ2_PlayerProperties.map((profile, i) => {
      const localProfile = local.PvZ2_PlayerProperties[i];
      if (!localProfile) return profile;
      return { ...profile, date: localProfile.date, time: localProfile.time };
    }),
  };
}

export async function applyRemoteToGame(data: SaveData): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url?.includes(GAME_HOST) && tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "APPLY_REMOTE_DATA", data });
    await appStore.markSynced();
  }
}

/** Lấy save data từ localStorage của game tab hiện tại. */
export async function getLocalData(): Promise<SaveData> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes(GAME_HOST) || !tab.id) throw new Error("Game not open");
  const tabId = tab.id;
  return new Promise<SaveData>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: "GET_LOCAL_DATA" }, (r: SyncResponse | undefined) => {
      if (chrome.runtime.lastError || !r) { reject(new Error("Connection error")); return; }
      if (!r.data) { reject(new Error(r.error ?? "Local data not found")); return; }
      resolve(r.data);
    });
  });
}

/**
 * Smart sync — dùng chung cho auto-sync (Popup) và manual sync (Main):
 * - Remote mới hơn lastSync → pull về (apply remote)
 * - allowPush=true và local mới hơn → push lên Gist
 */
export async function smartSync(allowPush = false): Promise<void> {
  const local = await getLocalData().catch(() => null);

  const r: SyncResponse = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "DOWNLOAD_FROM_GIST" }, resolve),
  );

  // Remote mới hơn → pull (giữ date/time của local)
  if (r?.success && r.data && r.gistUpdatedAt && r.gistUpdatedAt > appStore.lastSync) {
    await applyRemoteToGame(local ? preserveLocalDate(r.data, local) : r.data);
    return;
  }

  // Pull-only mode hoặc không có local → bỏ qua
  if (!allowPush || !local) return;

  // Nội dung giống nhau → không cần push
  if (r?.success && r.data && deepEqual(local, r.data)) return;

  // Push local lên
  const uploadR: SyncResponse = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "UPLOAD_TO_GIST", data: local }, resolve),
  );
  if (uploadR.success) {
    await appStore.markSynced();
  } else {
    throw new Error(uploadR.error ?? "Upload failed");
  }
}
