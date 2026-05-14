import type { SyncMessage } from "@/lib/types";
import type { SaveData } from "@/lib/schema";
import { validateSaveData } from "@/lib/schema";
import { SAVE_KEYS } from "@/lib/constants";

function getRawData(): { data: SaveData; errors: null } | { data: null; errors: string[] } {
  const obj: Record<string, unknown> = {};
  for (const key of SAVE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) return { data: null, errors: ["Local data not found"] };
    try {
      obj[key] = JSON.parse(raw);
    } catch {
      return { data: null, errors: ["Local data is corrupted (invalid JSON)"] };
    }
  }
  const result = validateSaveData(obj);
  if (!result.success) {
    return { data: null, errors: result.error.issues.map((e) => e.message) };
  }
  return { data: result.data, errors: null };
}

chrome.runtime.onMessage.addListener((message: SyncMessage, _sender, sendResponse) => {
  if (message.type === "GET_LOCAL_DATA") {
    const { data, errors } = getRawData();
    sendResponse({ data, error: errors?.join("; ") });
  } else if (message.type === "APPLY_REMOTE_DATA") {
    for (const key of SAVE_KEYS) {
      localStorage.setItem(key, JSON.stringify(message.data[key]));
    }
    window.location.reload();
  }
});
