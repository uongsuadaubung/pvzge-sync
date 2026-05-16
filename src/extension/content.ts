import { SyncMessageSchema, type SyncResponse } from "@/shared/types";
import { getAutoCollectEnabled } from "@/shared/storage";
import { getGameSaveData, getGameCollectKey, setGameSaveData } from "@/domains/game/storage";

/**
 * Chuyển đổi định dạng phím của game (ví dụ: "KEY_A", "DIGIT_1", "SPACE")
 * thành các thuộc tính chuẩn của KeyboardEvent.
 */
function mapGameKeyToEvent(gameKey: string): KeyboardEventInit | null {
  if (!gameKey) return null;
  const key = gameKey.toUpperCase();
  if (key.startsWith("KEY_")) {
    const char = key.replace("KEY_", "").toLowerCase();
    return { key: char, code: `Key${char.toUpperCase()}`, keyCode: char.toUpperCase().charCodeAt(0), which: char.toUpperCase().charCodeAt(0) };
  }
  if (key.startsWith("DIGIT_")) {
    const num = key.replace("DIGIT_", "");
    return { key: num, code: `Digit${num}`, keyCode: num.charCodeAt(0), which: num.charCodeAt(0) };
  }
  const specialMap: Record<string, KeyboardEventInit> = {
    "SPACE": { key: " ", code: "Space", keyCode: 32, which: 32 },
    "ENTER": { key: "Enter", code: "Enter", keyCode: 13, which: 13 },
    "BACK_QUOTE": { key: "`", code: "Backquote", keyCode: 192, which: 192 },
    "TAB": { key: "Tab", code: "Tab", keyCode: 9, which: 9 },
  };
  if (specialMap[key]) return specialMap[key];
  return { key: gameKey, code: gameKey, keyCode: gameKey.length === 1 ? gameKey.toUpperCase().charCodeAt(0) : 0 };
}

let collectInterval: number | undefined;

async function syncAutoCollect() {
  const enabled = await getAutoCollectEnabled();

  const rawGameKey = getGameCollectKey();
  const gameKeyOptions = rawGameKey ? mapGameKeyToEvent(rawGameKey) : null;

  let keyOptions: KeyboardEventInit;

  if (gameKeyOptions) {
    keyOptions = gameKeyOptions;
    console.log(`[PVZGE-Sync] AutoCollect using Game Key: ${keyOptions.key}`);
  } else {
    // Fallback mặc định là 'a' (phím chuẩn của game)
    const key = "a";
    const charCode = 65; // 'A'
    keyOptions = { key, code: "KeyA", keyCode: charCode, which: charCode };
    console.log("[PVZGE-Sync] AutoCollect using Default Key: 'a'");
  }

  if (collectInterval) {
    clearInterval(collectInterval);
    collectInterval = undefined;
  }

  if (enabled) {
    console.log("[PVZGE-Sync] AutoCollect started.");
    collectInterval = window.setInterval(() => {
      const canvas = document.getElementById("GameCanvas");
      if (canvas) {
        const finalOptions = { ...keyOptions, bubbles: true, cancelable: true };
        canvas.dispatchEvent(new KeyboardEvent("keydown", finalOptions));
        canvas.dispatchEvent(new KeyboardEvent("keyup", finalOptions));
      }
    }, 500);
  } else {
    console.log("[PVZGE-Sync] AutoCollect disabled.");
  }
}

// Khởi chạy lần đầu
syncAutoCollect();

chrome.runtime.onMessage.addListener((rawMessage: unknown, _sender, sendResponse: (r: SyncResponse) => void) => {
  const result = SyncMessageSchema.safeParse(rawMessage);
  if (!result.success) {
    console.error("[Content] Invalid message received:", result.error.format());
    return;
  }

  const message = result.data;
  if (message.type === "GET_LOCAL_DATA") {
    const { data, errors } = getGameSaveData();
    sendResponse(data ? { success: true, data } : { success: false, error: errors?.join("; ") || "Unknown error" });
  } else if (message.type === "APPLY_REMOTE_DATA") {
    setGameSaveData(message.data);
    sendResponse({ success: true });
    window.location.reload();
  } else if (message.type === "SETTINGS_UPDATED") {
    syncAutoCollect();
    sendResponse({ success: true });
  }
});
