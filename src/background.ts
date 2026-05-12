import type { Gist, SyncMessage, SyncResponse } from './types';
import type { SaveData } from './schema';
import { GITHUB_API_BASE, GIST_DESCRIPTION, GIST_FILE_NAME, GAME_URL_MATCH, ALARM_NAME, SYNC_INTERVAL_MINUTES } from './constants';

// GitHub Gist API Helpers
async function githubRequest(path: string, options: RequestInit = {}) {
    const { githubToken } = await chrome.storage.local.get('githubToken');
    if (!githubToken) throw new Error('Chưa cấu hình GitHub Token');

    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
        ...options,
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'GitHub API Error');
    }

    return response.json();
}

async function getGist(gistId: string) {
    return githubRequest(`/gists/${gistId}`);
}

async function updateGist(gistId: string, data: SaveData) {
    return githubRequest(`/gists/${gistId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            description: GIST_DESCRIPTION,
            files: {
                [GIST_FILE_NAME]: {
                    content: JSON.stringify(data, null, 2)
                }
            }
        })
    });
}

async function createGist(data: SaveData) {
    return githubRequest('/gists', {
        method: 'POST',
        body: JSON.stringify({
            description: GIST_DESCRIPTION,
            public: false,
            files: {
                [GIST_FILE_NAME]: {
                    content: JSON.stringify(data, null, 2)
                }
            }
        })
    });
}

async function findGistId() {
    const gists = await githubRequest('/gists') as Gist[];
    const target = gists.find((g) => g.description === GIST_DESCRIPTION);
    return target ? target.id : undefined;
}

async function getOrFindGistId() {
    const data = await chrome.storage.local.get('gistId');
    let gistId = data.gistId as string | undefined;
    if (!gistId) {
        gistId = await findGistId();
        if (gistId) {
            await chrome.storage.local.set({ gistId });
        }
    }
    return gistId;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: SyncMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: SyncResponse) => void) => {
    if (message.type === 'UPLOAD_TO_GIST') {
        (async () => {
            try {
                const gistId = await getOrFindGistId();
                if (gistId) {
                    await updateGist(gistId, message.data!);
                } else {
                    const gist = await createGist(message.data!) as Gist;
                    await chrome.storage.local.set({ gistId: gist.id });
                }
                sendResponse({ success: true });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                sendResponse({ success: false, error: message });
            }
        })();
        return true;
    } else if (message.type === 'DOWNLOAD_FROM_GIST') {
        (async () => {
            try {
                const gistId = await getOrFindGistId();
                if (!gistId) throw new Error('Không tìm thấy bản lưu trên Cloud. Hãy Upload trước.');

                const gist = await getGist(gistId) as Gist;
                const file = gist.files[GIST_FILE_NAME];
                if (!file) throw new Error('Không tìm thấy file lưu trong Gist.');
                const remoteData = JSON.parse(file.content) as SaveData;
                sendResponse({ success: true, data: remoteData });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                sendResponse({ success: false, error: message });
            }
        })();
        return true;
    } else if (message.type === 'CACHE_FOR_AUTOSYNC') {
        (async () => {
            const tabId = _sender.tab?.id;
            if (tabId && message.data) {
                await chrome.storage.local.set({ [`autoSync_${tabId}`]: message.data });
            }
            sendResponse({ success: true });
        })();
        return true;
    }
    return false;
});

// Auto-sync: upload cached data when a game tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    (async () => {
        const key = `autoSync_${tabId}`;
        const stored = await chrome.storage.local.get(key);
        if (!stored[key]) return;

        const data = stored[key] as SaveData;
        await chrome.storage.local.remove(key);

        const { githubToken } = await chrome.storage.local.get('githubToken');
        if (!githubToken) return;

        try {
            const gistId = await getOrFindGistId();
            if (gistId) {
                await updateGist(gistId, data);
            } else {
                const gist = await createGist(data) as Gist;
                await chrome.storage.local.set({ gistId: gist.id });
            }
            await chrome.storage.local.set({ lastSync: Date.now() });
        } catch {
            // Silent fail — auto-sync is best-effort
        }
    })();
});


async function periodicSync() {
    const { githubToken } = await chrome.storage.local.get('githubToken');
    if (!githubToken) return;

    const tabs = await chrome.tabs.query({ url: GAME_URL_MATCH });
    if (tabs.length === 0) return;

    for (const tab of tabs) {
        if (!tab.id) continue;
        try {
            const response = await new Promise<{ data: SaveData }>((resolve, reject) => {
                chrome.tabs.sendMessage(tab.id!, { type: 'GET_LOCAL_DATA' }, (res) => {
                    if (chrome.runtime.lastError || !res?.data) reject(new Error('no data'));
                    else resolve(res);
                });
            });

            const gistId = await getOrFindGistId();
            if (gistId) {
                await updateGist(gistId, response.data);
            } else {
                const gist = await createGist(response.data) as Gist;
                await chrome.storage.local.set({ gistId: gist.id });
            }
            await chrome.storage.local.set({ lastSync: Date.now() });
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
