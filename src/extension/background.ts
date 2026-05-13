import type { SyncMessage, SyncResponse } from "@/lib/types";
import { GistSchema, GistArraySchema } from "@/lib/schema";
import type { SaveData } from "@/lib/schema";
import { GITHUB_API_BASE, GIST_DESCRIPTION, GIST_FILE_NAME, GAME_URL_MATCH, ALARM_NAME, SYNC_INTERVAL_MINUTES } from "@/lib/constants";
import { getGithubToken, getGistId, setGistId, setLastSync, getAutoSyncData, setAutoSyncData, removeAutoSyncData } from "@/lib/storage";

// GitHub Gist API Helpers
async function githubRequest(path: string, options: RequestInit = {}) {
  const githubToken = await getGithubToken();
  if (!githubToken) throw new Error("Chưa cấu hình GitHub Token");

  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `token ${githubToken}`,
      "Accept": "application/vnd.github.v3+json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "GitHub API Error");
  }

  return response.json();
}

async function getGist(gistId: string) {
  return githubRequest(`/gists/${gistId}`);
}

async function updateGist(gistId: string, data: SaveData) {
  return githubRequest(`/gists/${gistId}`, {
    method: "PATCH",
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      files: {
        [GIST_FILE_NAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });
}

async function createGist(data: SaveData) {
  return githubRequest("/gists", {
    method: "POST",
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILE_NAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });
}

async function findGistId() {
  const raw = await githubRequest("/gists");
  const gists = GistArraySchema.parse(raw);
  const target = gists.find((g) => g.description === GIST_DESCRIPTION);
  return target ? target.id : undefined;
}

async function getOrFindGistId() {
  let gistId = await getGistId();
  if (!gistId) {
    gistId = await findGistId();
    if (gistId) await setGistId(gistId);
  }
  return gistId;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: SyncMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: SyncResponse) => void) => {
  if (message.type === "UPLOAD_TO_GIST") {
    (async () => {
      try {
        const gistId = await getOrFindGistId();
        if (gistId) {
          await updateGist(gistId, message.data);
        } else {
          const raw = await createGist(message.data);
          const gist = GistSchema.parse(raw);
          await setGistId(gist.id);
        }
        sendResponse({ success: true });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        sendResponse({ success: false, error: message });
      }
    })();
    return true;
  } else if (message.type === "DOWNLOAD_FROM_GIST") {
    (async () => {
      try {
        const gistId = await getOrFindGistId();
        if (!gistId) throw new Error("Không tìm thấy bản lưu trên Cloud. Hãy Upload trước.");

        const raw = await getGist(gistId);
        const gist = GistSchema.parse(raw);
        const file = gist.files[GIST_FILE_NAME];
        if (!file) throw new Error("Không tìm thấy file lưu trong Gist.");
        const remoteData = JSON.parse(file.content) as SaveData;
        sendResponse({ success: true, data: remoteData });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        sendResponse({ success: false, error: message });
      }
    })();
    return true;
  } else if (message.type === "CACHE_FOR_AUTOSYNC") {
    (async () => {
      const tabId = _sender.tab?.id;
      if (tabId) await setAutoSyncData(tabId, message.data);
      sendResponse({ success: true });
    })();
    return true;
  }
  return false;
});

// Auto-sync: upload cached data when a game tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  (async () => {
    const data = await getAutoSyncData(tabId);
    if (!data) return;

    await removeAutoSyncData(tabId);

    const githubToken = await getGithubToken();
    if (!githubToken) return;

    try {
      const gistId = await getOrFindGistId();
      if (gistId) {
        await updateGist(gistId, data);
      } else {
        const raw = await createGist(data);
        const gist = GistSchema.parse(raw);
        await setGistId(gist.id);
      }
      await setLastSync();
    } catch {
      // Silent fail — auto-sync is best-effort
    }
  })();
});


async function periodicSync() {
  const githubToken = await getGithubToken();
  if (!githubToken) return;

  const tabs = await chrome.tabs.query({ url: GAME_URL_MATCH });
  if (tabs.length === 0) return;

  for (const tab of tabs) {
    if (!tab.id) continue;
    try {
      const tabId = tab.id;
      const response = await new Promise<{ data: SaveData }>((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { type: "GET_LOCAL_DATA" }, (res) => {
          if (chrome.runtime.lastError || !res?.data) reject(new Error("no data"));
          else resolve(res);
        });
      });

      const gistId = await getOrFindGistId();
      if (gistId) {
        await updateGist(gistId, response.data);
      } else {
        const raw = await createGist(response.data);
        const gist = GistSchema.parse(raw);
        await setGistId(gist.id);
      }
      await setLastSync();
    } catch {
      // Silent fail — periodic sync is best-effort
    }
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) periodicSync();
});

// Register alarm on install and startup (survives browser restarts)
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: SYNC_INTERVAL_MINUTES });
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: SYNC_INTERVAL_MINUTES });
});
