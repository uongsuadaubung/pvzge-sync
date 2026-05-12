import { t, applyTranslations } from './i18n';
import { findConflicts, hasConflicts } from './utils';
import { mergeValidPart } from './merge';
import { SaveDataSchema } from './schema';
import { GAME_HOST } from './constants';
import type { SaveData, SyncResponse } from './types';

const statusText = document.getElementById('status-text') as HTMLElement;
const lastSyncText = document.getElementById('last-sync') as HTMLElement;
const errorBanner = document.getElementById('error-banner') as HTMLElement;

let localData: SaveData | null = null;

async function updateStatus() {
  const data = await chrome.storage.local.get(['githubToken', 'lastSync']);
  const githubToken = data.githubToken as string | undefined;
  const lastSync = data.lastSync as number | undefined;
  const cloudSection = document.querySelector('.action-section.cloud') as HTMLElement;
  const statusDot = document.getElementById('status-dot') as HTMLElement;

  if (!githubToken) {
    statusText.innerText = t('status_no_github');
    statusText.style.color = '#ff9800';
    statusDot.className = 'dot';
    statusDot.style.background = '#ff9800';
    if (cloudSection) cloudSection.style.display = 'none';
  } else {
    statusText.innerText = t('status_connected');
    statusText.style.color = '#4caf50';
    statusDot.className = 'dot active';
    statusDot.style.background = '#4caf50';
    if (cloudSection) cloudSection.style.display = 'block';
  }

  if (lastSync) {
    lastSyncText.innerText = t('last_sync') + new Date(lastSync as number).toLocaleString();
  } else {
    lastSyncText.innerText = t('no_sync');
  }
}

async function getGameTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes(GAME_HOST)) return null;
  return tab;
}

async function getLocalData(): Promise<SaveData> {
  const tab = await getGameTab();
  if (!tab) throw new Error(t('msg_game_not_open'));

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id!, { type: 'GET_LOCAL_DATA' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error('Connection error. Please reload the game page.'));
      } else {
        resolve(response.data);
      }
    });
  });
}

async function validateLocalData(): Promise<{ valid: boolean; errors: string[] }> {
  const tab = await getGameTab();
  if (!tab) return { valid: false, errors: [t('msg_game_not_open')] };

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id!, { type: 'VALIDATE_LOCAL_DATA' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        resolve({ valid: false, errors: ['Connection error'] });
      } else {
        resolve(response as { valid: boolean; errors: string[] });
      }
    });
  });
}

async function finalizeSyncDirect(data: SaveData) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'APPLY_REMOTE_DATA', data });
  }
  await chrome.storage.local.remove(['temp_local', 'temp_remote']);
  await chrome.storage.local.set({ lastSync: Date.now() });
  statusText.innerText = '✅ Synced!';
  updateStatus();
}

(document.getElementById('btn-upload') as HTMLElement).onclick = async () => {
  try {
    statusText.innerText = '⏳ ...';
    const data = await getLocalData();
    chrome.runtime.sendMessage({ type: 'UPLOAD_TO_GIST', data }, (response: SyncResponse) => {
      if (response.success) {
        chrome.storage.local.set({ lastSync: Date.now() });
        updateStatus();
      } else {
        alert('Error: ' + response.error);
        updateStatus();
      }
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    alert(message);
    updateStatus();
  }
};

(document.getElementById('btn-download') as HTMLElement).onclick = async () => {
  try {
    statusText.innerText = '⏳ ...';
    chrome.runtime.sendMessage({ type: 'DOWNLOAD_FROM_GIST' }, async (response: SyncResponse) => {
      if (response.success) {
        let remoteData = response.data as SaveData;

        const remoteValid = SaveDataSchema.safeParse(remoteData);
        if (!remoteValid.success) {
          remoteData = mergeValidPart(remoteData, localData!);
          const mergedValid = SaveDataSchema.safeParse(remoteData);
          if (!mergedValid.success) {
            alert('Cannot fix remote data with local. Please update the extension.');
            updateStatus();
            return;
          }
          alert('Remote data was partially incompatible. Merged with local data.');
        }

        await chrome.storage.local.set({ temp_remote: remoteData, temp_local: localData });

        // Use same findConflicts logic for both checks — no inconsistency possible
        const conflicts = findConflicts(localData!, remoteData);
        if (conflicts.length === 0) {
          await chrome.storage.local.set({ lastSync: Date.now() });
          statusText.innerText = '\u2705 Already up to date!';
          updateStatus();
          return;
        }
        window.location.href = 'conflict.html';
      } else {
        alert('Error: ' + response.error);
        updateStatus();
      }
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    alert(message);
    updateStatus();
  }
};

(document.getElementById('btn-export') as HTMLElement).onclick = async () => {
  try {
    const data = await getLocalData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pvzge_save_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    alert(message);
  }
};

(document.getElementById('btn-import') as HTMLElement).onclick = () => {
  (document.getElementById('file-input') as HTMLElement).click();
};

(document.getElementById('file-input') as HTMLInputElement).onchange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event: ProgressEvent<FileReader>) => {
    try {
      const importedData = JSON.parse(event.target?.result as string) as SaveData;

      const remoteValid = SaveDataSchema.safeParse(importedData);
      if (!remoteValid.success) {
        const merged = mergeValidPart(importedData, localData!);
        const mergedValid = SaveDataSchema.safeParse(merged);
        if (!mergedValid.success) {
          alert('Cannot fix this file with local data. Please update the extension.');
          return;
        }
        alert('File was partially incompatible. Merged with local data.');
      }

      await chrome.storage.local.set({ temp_remote: importedData, temp_local: localData });
      if (!hasConflicts(localData!, importedData)) {
        await finalizeSyncDirect(importedData);
      } else {
        window.location.href = 'conflict.html';
      }
    } catch {
      alert(t('msg_invalid_json'));
    }
  };
  reader.readAsText(file);
};

// Settings modal
const modal = document.getElementById('settings-modal') as HTMLElement;
(document.getElementById('btn-settings') as HTMLElement).onclick = async () => {
  const data = await chrome.storage.local.get(['githubToken', 'language']);
  (document.getElementById('input-token') as HTMLInputElement).value = (data.githubToken as string) || '';
  (document.getElementById('select-lang') as HTMLSelectElement).value = (data.language as string) || 'en';
  modal.style.display = 'block';
};

(document.getElementById('btn-close-settings') as HTMLElement).onclick = () => modal.style.display = 'none';
window.onclick = (e: MouseEvent) => { if (e.target == modal) modal.style.display = 'none'; };

(document.getElementById('btn-save-settings') as HTMLElement).onclick = async () => {
  const token = (document.getElementById('input-token') as HTMLInputElement).value.trim();
  const lang = (document.getElementById('select-lang') as HTMLSelectElement).value;

  await chrome.storage.local.set({
    githubToken: token,
    language: lang
  });

  modal.style.display = 'none';
  await applyTranslations();
  updateStatus();
};

async function initPopup() {
  await applyTranslations();

  const warnBanner = document.getElementById('warn-banner') as HTMLElement;

  // Step 1: check if we're on the game page
  const onGamePage = !!(await getGameTab());
  if (!onGamePage) {
    warnBanner.style.display = 'block';
    warnBanner.innerHTML = `<strong>🎮 ${t('not_game_page_title')}</strong><br>${t('not_game_page_body')}`;

    // Disable only cloud sync — import/export + settings still work
    const cloudSection = document.querySelector('.action-section.cloud') as HTMLElement;
    if (cloudSection) {
      cloudSection.style.opacity = '0.4';
      cloudSection.style.pointerEvents = 'none';
    }
    document.querySelectorAll('.action-section.cloud button').forEach(b => {
      (b as HTMLButtonElement).disabled = true;
    });

    statusText.innerText = '🎮 ' + t('not_game_page_title');
    statusText.style.color = '#ff9800';
    await updateStatus();
    return;
  }

  // Step 2: validate local data schema
  const validation = await validateLocalData();
  if (!validation.valid) {
    document.querySelector('main')?.classList.add('disabled');
    document.querySelectorAll('button:not(#btn-settings)').forEach(b => {
      (b as HTMLButtonElement).disabled = true;
    });
    if (errorBanner) {
      errorBanner.style.display = 'block';
      errorBanner.innerHTML = `<strong>⚠️ ${t('schema_error_title')}</strong><br>Local save data is incompatible. Please update the extension.<br><small>${validation.errors.join('; ')}</small>`;
    }
    statusText.innerText = '⚠️ Incompatible data';
    statusText.style.color = '#f44336';
    return;
  }

  localData = await getLocalData();
  updateStatus();
}

initPopup();
