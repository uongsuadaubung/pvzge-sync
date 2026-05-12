import type { SyncMessage, SaveData } from './types';
import { validatePlayerProperties, validateSettings } from './schema';

const TARGET_KEYS = ['PvZ2_PlayerProperties', 'PvZ2_Settings'];

function getRawData(): SaveData | null {
  const data: SaveData = {};
  for (const key of TARGET_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return data;
}

function validateLocalData(): { valid: boolean; data?: SaveData; errors: string[] } {
  const raw = getRawData();
  if (!raw) return { valid: false, errors: ['Local data not found'] };

  const errors: string[] = [];
  const pp = raw.PvZ2_PlayerProperties;
  const settings = raw.PvZ2_Settings;

  if (pp) {
    const r = validatePlayerProperties(pp);
    if (!r.success) errors.push('PvZ2_PlayerProperties: ' + r.error.message);
  }
  if (settings) {
    const r = validateSettings(settings);
    if (!r.success) errors.push('PvZ2_Settings: ' + r.error.message);
  }

  return { valid: errors.length === 0, data: raw, errors };
}

chrome.runtime.onMessage.addListener((message: SyncMessage, _sender, sendResponse) => {
  if (message.type === 'GET_LOCAL_DATA') {
    const raw = getRawData();
    sendResponse({ data: raw });
  } else if (message.type === 'VALIDATE_LOCAL_DATA') {
    sendResponse(validateLocalData());
  } else if (message.type === 'APPLY_REMOTE_DATA') {
    const data = message.data as SaveData;
    const pp = data.PvZ2_PlayerProperties;
    const settings = data.PvZ2_Settings;
    if (!pp || !settings) {
      sendResponse({ success: false, error: 'Invalid data structure' });
      return;
    }
    Object.keys(data).forEach(key => {
      if (TARGET_KEYS.includes(key)) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });
    window.location.reload();
  }
});
