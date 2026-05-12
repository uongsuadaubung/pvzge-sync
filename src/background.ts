import type { SaveData, Gist, SyncMessage, SyncResponse } from './types';

// GitHub Gist API Helpers
async function githubRequest(path: string, options: RequestInit = {}) {
    const { githubToken } = await chrome.storage.local.get('githubToken');
    if (!githubToken) throw new Error('Chưa cấu hình GitHub Token');

    const response = await fetch(`https://api.github.com${path}`, {
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
            description: 'PVZGE Save Data Sync',
            files: {
                'pvzge_save.json': {
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
            description: 'PVZGE Save Data Sync',
            public: false,
            files: {
                'pvzge_save.json': {
                    content: JSON.stringify(data, null, 2)
                }
            }
        })
    });
}

async function findGistId() {
    const gists = await githubRequest('/gists') as Gist[];
    const target = gists.find((g) => g.description === 'PVZGE Save Data Sync');
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
                const file = gist.files['pvzge_save.json'];
                if (!file) throw new Error('Không tìm thấy file lưu trong Gist.');
                const remoteData = JSON.parse(file.content) as SaveData;
                sendResponse({ success: true, data: remoteData });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                sendResponse({ success: false, error: message });
            }
        })();
        return true;
    }
    return false;
});

// Only show extension on the game page (Chrome only; Firefox doesn't support declarativeContent)
chrome.runtime.onInstalled.addListener(() => {
    if (typeof chrome.action?.disable !== 'function') return;
    chrome.action.disable();
    if (!chrome.declarativeContent) return;
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'play.pvzge.com' },
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()]
        }]);
    });
});
