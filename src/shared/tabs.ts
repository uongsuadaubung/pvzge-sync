import { GAME_HOST } from "@/shared/constants.ts";

/**
 * Lấy danh sách các tab đang chạy game PVZGE (Official hoặc Localhost).
 */
export async function getGameTabs(): Promise<chrome.tabs.Tab[]> {
  const [tabs, localTabs] = await Promise.all([
    chrome.tabs.query({ url: `*://${GAME_HOST}/*` }),
    chrome.tabs.query({ url: "*://localhost/*" }),
  ]);
  return [...tabs, ...localTabs];
}

/**
 * Lấy tab đang hoạt động trong cửa sổ hiện tại.
 */
export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Kiểm tra xem URL có phải là URL của game PVZGE hay không.
 */
export function isGameUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes(GAME_HOST) || url.includes("localhost");
}
