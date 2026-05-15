import type { SyncMessage, SyncResponse } from "@/shared/types";
import { uploadToGist, downloadFromGist, validateToken, getUserInfo } from "@/domains/github/api";
import { getAutoSyncEnabled, getAutoSyncInterval, getGithubToken } from "@/shared/storage";
import { smartSync } from "@/domains/sync/sync";

/**
 * Listener xử lý các tin nhắn từ Popup hoặc Content Script.
 * Các hàm API được gọi ở đây để tận dụng môi trường Background (tránh bị kill khi đóng popup).
 */
chrome.runtime.onMessage.addListener((message: SyncMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: SyncResponse) => void) => {
  console.debug("[Background] Received message:", message.type);

  if (message.type === "UPLOAD_TO_GIST") {
    uploadToGist(message.data).then(sendResponse);
    return true; // Giữ kênh message mở cho phản hồi async
  } else if (message.type === "DOWNLOAD_FROM_GIST") {
    downloadFromGist().then(sendResponse);
    return true;
  } else if (message.type === "VALIDATE_TOKEN") {
    validateToken(message.token).then(sendResponse);
    return true;
  } else if (message.type === "GET_USER_INFO") {
    getUserInfo().then(sendResponse);
    return true;
  } else if (message.type === "SETTINGS_UPDATED") {
    console.log("[Background] Settings updated, resetting alarm...");
    setupAlarm();
    return false;
  }
  return false;
});

// --- Logic Tự động đồng bộ (Auto Sync) ---

const ALARM_NAME = "auto-sync-alarm";

/**
 * Thiết lập hoặc xóa Alarm dựa trên cấu hình người dùng.
 */
async function setupAlarm() {
  const enabled = await getAutoSyncEnabled();
  const interval = await getAutoSyncInterval();
  const token = await getGithubToken();

  await chrome.alarms.clear(ALARM_NAME);

  if (enabled && interval > 0 && token) {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: interval,
      delayInMinutes: interval,
    });
    console.log(`[AutoSync] Alarm set: every ${interval} minutes.`);
  } else {
    console.log("[AutoSync] Alarm disabled (Disabled in settings or missing token).");
  }
}

/**
 * Lắng nghe sự kiện Alarm để thực hiện đồng bộ tự động.
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log("[AutoSync] Periodic alarm triggered at:", new Date().toLocaleTimeString());
    try {
      // Tự động đồng bộ và cho phép đẩy dữ liệu lên (allowPush = true)
      await smartSync(true);
      console.log("[AutoSync] Periodic sync completed.");
    } catch (e) {
      console.error("[AutoSync] Periodic sync failed:", e);
    }
  }
});

// Khởi tạo Alarm ngay khi Background Script load
setupAlarm();
