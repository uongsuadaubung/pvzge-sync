import { SyncMessageSchema, type SyncResponse } from "@/shared/types.ts";
import {
  downloadFromGist,
  getUserInfo,
  uploadToGist,
  validateToken,
} from "@/domains/github/api.ts";
import {
  getAutoSyncEnabled,
  getAutoSyncInterval,
  getGithubToken,
  setAutoSyncStatus,
} from "@/shared/storage.ts";
import { smartSync } from "@/domains/sync/sync.ts";

/**
 * Xử lý khi trang game được tải/tải lại.
 * Xóa cache phiên và thực hiện tự động kiểm tra đồng bộ nếu có GitHub Token.
 */
async function handleGamePageLoaded() {

  const token = await getGithubToken();
  if (token) {
    console.log("[Background] Game page loaded. Running auto sync...");
    try {
      const res = await smartSync();
      if (res.type === "conflict") {
        await setAutoSyncStatus("status_auto_sync_conflict", "warning");
      } else if (res.type === "synced" && res.detail === "upload") {
        await setAutoSyncStatus("status_auto_sync_success_upload", "success");
      } else if (res.type === "no_action") {
        await setAutoSyncStatus("msg_sync_no_changes", "info");
      }
    } catch (err) {
      console.error("[Background] Auto sync on page load failed:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      await setAutoSyncStatus(errorMsg, "error");
    }
  }
}

/**
 * Listener xử lý các tin nhắn từ Popup hoặc Content Script.
 * Các hàm API được gọi ở đây để tận dụng môi trường Background (tránh bị kill khi đóng popup).
 */
chrome.runtime.onMessage.addListener(
  (
    rawMessage: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: SyncResponse) => void,
  ) => {
    const result = SyncMessageSchema.safeParse(rawMessage);

    if (!result.success) {
      console.error(
        "[Background] Invalid message received:",
        result.error,
      );
      return false;
    }

    const message = result.data;
    console.debug("[Background] Received message:", message.type);

    switch (message.type) {
      case "UPLOAD_TO_GIST":
        uploadToGist(message.data).then(sendResponse);
        return true; // Giữ kênh message mở cho phản hồi async
      case "DOWNLOAD_FROM_GIST":
        downloadFromGist().then(sendResponse);
        return true;
      case "VALIDATE_TOKEN":
        validateToken(message.token).then(sendResponse);
        return true;
      case "GET_USER_INFO":
        getUserInfo().then(sendResponse);
        return true;
      case "GAME_PAGE_LOADED":
        handleGamePageLoaded();
        return false;
      case "SETTINGS_UPDATED": {
        console.log(
          "[Background] Settings updated, resetting alarm and notifying tabs...",
        );
        setupAlarm();

        // Phát tín hiệu cho các content script ở các tab đang mở
        chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
          tabs.forEach((tab: chrome.tabs.Tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: "SETTINGS_UPDATED" })
                .catch(
                  (err) => {
                    // Ghi nhận debug lỗi gửi tin nhắn (ví dụ: tab không có content script chạy - được phép bỏ qua)
                    console.debug(
                      `[Background] Failed to send SETTINGS_UPDATED to tab ${tab.id}:`,
                      err,
                    );
                  },
                );
            }
          });
        });
        return false;
      }
      default:
        return false;
    }
  },
);

// --- Logic Tự động đồng bộ (Auto Sync) ---

const ALARM_NAME = "auto-sync-alarm";

let lastAlarmEnabled: boolean | null = null;
let lastAlarmInterval: number | null = null;
let lastAlarmToken: string | null = null;

/**
 * Thiết lập hoặc xóa Alarm dựa trên cấu hình người dùng.
 */
async function setupAlarm() {
  const enabled = await getAutoSyncEnabled();
  const interval = await getAutoSyncInterval();
  const token = (await getGithubToken()) ?? "";

  // Tránh reset timer của Alarm nếu các cấu hình liên quan đến Alarm không đổi
  if (
    lastAlarmEnabled === enabled &&
    lastAlarmInterval === interval &&
    lastAlarmToken === token
  ) {
    console.debug(
      "[AutoSync] Alarm configuration unchanged. Keeping current alarm timer.",
    );
    return;
  }

  // Cập nhật trạng thái cấu hình hiện tại
  lastAlarmEnabled = enabled;
  lastAlarmInterval = interval;
  lastAlarmToken = token;

  await chrome.alarms.clear(ALARM_NAME);

  if (enabled && interval > 0 && token) {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: interval,
      delayInMinutes: interval,
    });
    console.log(`[AutoSync] Alarm set: every ${interval} minutes.`);
  } else {
    console.log(
      "[AutoSync] Alarm disabled (Disabled in settings or missing token).",
    );
  }
}

/**
 * Lắng nghe sự kiện Alarm để thực hiện đồng bộ tự động.
 */
chrome.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log(
      "[AutoSync] Periodic alarm triggered at:",
      new Date().toLocaleTimeString(),
    );
    try {
      // Tự động đồng bộ, chặn tự động tải xuống
      await smartSync({ blockDownload: true });
      console.log("[AutoSync] Periodic sync completed.");
    } catch (e) {
      console.error("[AutoSync] Periodic sync failed:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      await setAutoSyncStatus(errorMsg, "error");
    }
  }
});

// Khởi tạo Alarm ngay khi Background Script load
setupAlarm();
