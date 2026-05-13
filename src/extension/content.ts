import type { SyncMessage } from "@/lib/types";
import type { SaveData } from "@/lib/schema";
import { validateSaveData } from "@/lib/schema";
import { SAVE_KEYS } from "@/lib/constants";

function getRawData(): SaveData | null {
  const data: Record<string, unknown> = {};
  for (const key of SAVE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return data as SaveData;
}

function validateLocalData(): { valid: boolean; errors: string[] } {
  const raw = getRawData();
  if (!raw) return { valid: false, errors: ["Local data not found"] };

  const result = validateSaveData(raw);
  if (!result.success) {
    return { valid: false, errors: [result.error.message] };
  }
  return { valid: true, errors: [] };
}

chrome.runtime.onMessage.addListener((message: SyncMessage, _sender, sendResponse) => {
  if (message.type === "GET_LOCAL_DATA") {
    const raw = getRawData();
    sendResponse({ data: raw });
  } else if (message.type === "VALIDATE_LOCAL_DATA") {
    sendResponse(validateLocalData());
  } else if (message.type === "APPLY_REMOTE_DATA") {
    for (const key of SAVE_KEYS) {
      localStorage.setItem(key, JSON.stringify(message.data[key]));
    }
    window.location.reload();
  }
});

// Auto-sync: when tab is hidden/closed, cache data in background for upload
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) return;
  const data = getRawData();
  if (data) {
    chrome.runtime.sendMessage({ type: "CACHE_FOR_AUTOSYNC", data });
  }
});
