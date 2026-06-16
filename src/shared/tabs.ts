import { GAME_HOST } from "@/shared/constants.ts";
import { getLocalhostPort } from "@/shared/storage.ts";

/**
 * Kiểm tra xem cổng của URL có khớp với cổng mục tiêu hay không.
 * Hỗ trợ các cổng mặc định 80 (HTTP) và 443 (HTTPS) khi URL không hiển thị rõ cổng.
 */
function matchesPort(urlPort: string, targetPort: string): boolean {
  return (
    urlPort === targetPort ||
    (targetPort === "80" && urlPort === "") ||
    (targetPort === "443" && urlPort === "")
  );
}

/**
 * Lấy danh sách các tab đang chạy game PVZGE (Official hoặc Localhost).
 */
export async function getGameTabs(): Promise<chrome.tabs.Tab[]> {
  const [tabs, localTabs] = await Promise.all([
    chrome.tabs.query({ url: `*://${GAME_HOST}/*` }),
    chrome.tabs.query({ url: "*://localhost/*" }),
  ]);

  let port = "8080";
  try {
    port = await getLocalhostPort();
  } catch (err) {
    console.warn(
      "[Tabs] Failed to read localhostPort from storage, fallback to 8080:",
      err,
    );
  }

  const filteredLocal = localTabs.filter((tab) => {
    if (!tab.url) return false;
    try {
      const u = new URL(tab.url);
      return matchesPort(u.port, port);
    } catch {
      return false;
    }
  });

  return [...tabs, ...filteredLocal];
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
export function isGameUrl(url?: string, customPort?: string): boolean {
  if (!url) return false;
  if (url.includes(GAME_HOST)) return true;

  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      if (customPort) {
        return matchesPort(u.port, customPort);
      }
      return true;
    }
  } catch {
    return url.includes("localhost");
  }
  return false;
}
