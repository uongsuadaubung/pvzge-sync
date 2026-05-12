import { t, applyTranslations } from './i18n';
import { findConflicts, isPvzDate } from './utils';
import type { Conflict } from './types';
import type { SaveData, PvzDate } from './schema';


let localData: SaveData, remoteData: SaveData;
let conflicts: Conflict[] = [];

async function initConflict() {
    await applyTranslations();
    const storage = await chrome.storage.local.get(['temp_local', 'temp_remote']);
    localData = storage.temp_local as SaveData;
    remoteData = storage.temp_remote as SaveData;

    if (!localData || !remoteData) {
        window.location.href = 'popup.html';
        return;
    }

    renderSimpleView();

    const initialConflicts = findConflicts(localData, remoteData);
    const advancedBtn = document.getElementById('btn-show-advanced') as HTMLElement;
    if (initialConflicts.length === 0) {
        const confirmBtn = document.getElementById('btn-confirm-simple') as HTMLButtonElement;
        confirmBtn.classList.add('disabled');
        confirmBtn.disabled = true;
        advancedBtn.style.display = 'none';
        const confirmMergeBtn = document.getElementById('btn-confirm-merge') as HTMLButtonElement;
        confirmMergeBtn.classList.add('disabled');
        confirmMergeBtn.disabled = true;
        const footer = document.querySelector('#simple-view footer') as HTMLElement;
        if (footer) {
            footer.insertAdjacentHTML('beforebegin', `<p style="text-align:center; color:#4caf50; margin: 8px 0;">${t('diff_none')}</p>`);
        }
    }

    // Event listeners
    (document.getElementById('btn-show-advanced') as HTMLElement).onclick = () => {
        (document.getElementById('simple-view') as HTMLElement).style.display = 'none';
        (document.getElementById('advanced-view') as HTMLElement).style.display = 'block';
        conflicts = findConflicts(localData, remoteData);
        renderConflicts();
    };

    (document.getElementById('btn-back-to-simple') as HTMLElement).onclick = () => {
        (document.getElementById('advanced-view') as HTMLElement).style.display = 'none';
        (document.getElementById('simple-view') as HTMLElement).style.display = 'block';
    };

    let selectedSimpleData: SaveData | null = null;

    (document.getElementById('card-local') as HTMLElement).onclick = () => {
        selectSimpleCard('local', localData);
    };

    (document.getElementById('card-remote') as HTMLElement).onclick = () => {
        selectSimpleCard('remote', remoteData);
    };

    (document.getElementById('btn-confirm-simple') as HTMLElement).onclick = () => {
        if (selectedSimpleData) finalizeMerge(selectedSimpleData);
    };

    async function selectSimpleCard(type: string, data: SaveData) {
        selectedSimpleData = data;
        
        // UI feedback
        (document.getElementById('card-local') as HTMLElement).classList.remove('selected');
        (document.getElementById('card-remote') as HTMLElement).classList.remove('selected');
        (document.getElementById(`card-${type}`) as HTMLElement).classList.add('selected');
        
        document.querySelectorAll('.selection-status').forEach(el => (el as HTMLElement).innerText = t('not_selected'));
        (document.querySelector(`#card-${type} .selection-status`) as HTMLElement).innerText = t('selected');
        
        const confirmBtn = document.getElementById('btn-confirm-simple') as HTMLButtonElement;
        confirmBtn.classList.remove('disabled');
        confirmBtn.disabled = false;
    }

    (document.getElementById('btn-cancel-simple') as HTMLElement).onclick = () => window.location.href = 'popup.html';

    (document.getElementById('btn-smart-select') as HTMLElement).onclick = applySmartSelection;
    (document.getElementById('btn-all-local') as HTMLElement).onclick = () => setAllChoices('local');
    (document.getElementById('btn-all-remote') as HTMLElement).onclick = () => setAllChoices('remote');
    
    (document.getElementById('btn-confirm-merge') as HTMLElement).onclick = () => {
        const merged = performMerge();
        finalizeMerge(merged);
    };
}

function renderSimpleView() {
    renderCardStats('simple-stats-local', localData, remoteData);
    renderCardStats('simple-stats-remote', remoteData, localData);
}

function renderCardStats(id: string, data: SaveData, compareTo: SaveData) {
    const container = document.getElementById(id) as HTMLElement;
    const p = data.PvZ2_PlayerProperties?.[0];
    const cp = compareTo.PvZ2_PlayerProperties?.[0];

    const stats = [
        { label: '💎 Gems', val: p?.gem, cVal: cp?.gem },
        { label: '🪙 Coins', val: p?.coin, cVal: cp?.coin },
        { label: '📅 Date', val: p?.date, cVal: cp?.date }
    ];

    container.innerHTML = stats.map(({ label, val, cVal }) => {
        const dateMatch = isPvzDate(val) && isPvzDate(cVal);
        const displayVal = dateMatch ? `${val.year}-${val.month}-${val.date}` : (val as number | undefined) ?? 'N/A';
        const isBetter = dateMatch
            ? pvzDateToTime(val) > pvzDateToTime(cVal)
            : ((val as number | undefined) ?? 0) > ((cVal as number | undefined) ?? 0);

        return `<div class="stat-row"><span class="stat-label">${label}</span><span class="stat-val ${isBetter ? 'better' : ''}">${displayVal}</span></div>`;
    }).join('');
}

async function finalizeMerge(data: SaveData) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: 'APPLY_REMOTE_DATA', data: data });
    chrome.runtime.sendMessage({ type: 'UPLOAD_TO_GIST', data: data });
    await chrome.storage.local.remove(['temp_local', 'temp_remote']);
    window.close();
}

function escapeHTML(str: unknown): string {
    if (typeof str !== 'string') return String(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


function renderConflicts() {
    const list = document.getElementById('conflict-list') as HTMLElement;
    if (conflicts.length === 0) {
        list.innerHTML = `<div style="padding: 20px; text-align: center;">${t('diff_none')}</div>`;
        return;
    }

    list.innerHTML = conflicts.map((c, index) => `
        <div class="conflict-item">
            <div class="prop-path" title="${c.path}">${c.path.length > 25 ? '...' + c.path.slice(-22) : c.path}</div>
            <div class="val-box local ${c.choice === 'local' ? 'selected' : ''}" data-index="${index}" data-choice="local">${formatValue(c.local)}</div>
            <div class="val-box remote ${c.choice === 'remote' ? 'selected' : ''}" data-index="${index}" data-choice="remote">${formatValue(c.remote)}</div>
        </div>
    `).join('');

    list.querySelectorAll('.val-box').forEach(box => {
        (box as HTMLElement).onclick = () => {
            const indexAttr = box.getAttribute('data-index');
            const choice = box.getAttribute('data-choice') as 'local' | 'remote' | null;
            if (indexAttr === null || choice === null) return;
            const index = parseInt(indexAttr);
            conflicts[index]!.choice = choice;
            renderConflicts();
        };
    });
}

function formatValue(val: unknown): string {
    if (val === undefined) return '<i style="color:#666">N/A</i>';
    if (val === null) return 'null';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'object') {
        if (isPvzDate(val)) {
            return escapeHTML(`${val.year}-${String(val.month).padStart(2, '0')}-${String(val.date).padStart(2, '0')} ${String(val.hour || 0).padStart(2, '0')}:${String(val.minute || 0).padStart(2, '0')}:${String(val.second || 0).padStart(2, '0')}`);
        }
        try { return escapeHTML(JSON.stringify(val, null, 1)); } catch { return '[Obj]'; }
    }
    return escapeHTML(String(val));
}

function applySmartSelection() {
    conflicts.forEach(c => {
        const l = c.local;
        const r = c.remote;
        if (Array.isArray(l) && Array.isArray(r)) c.choice = l.length >= r.length ? 'local' : 'remote';
        else if (typeof l === 'number' && typeof r === 'number') c.choice = l > r ? 'local' : 'remote';
        else if (l != null && r == null) c.choice = 'local';
        else c.choice = 'remote';
    });
    renderConflicts();
}

function pvzDateToTime(d: PvzDate): number { 
    
    return new Date(d.year, d.month - 1, d.date, d.hour || 0, d.minute || 0, d.second || 0).getTime(); 
}

function setAllChoices(choice: 'local' | 'remote') { conflicts.forEach(c => c.choice = choice); renderConflicts(); }

function performMerge() {
    const result = JSON.parse(JSON.stringify(localData)) as SaveData;
    conflicts.forEach(c => { if (c.choice === 'remote') setValueByPath(result, c.path, c.remote); });
    return result;
}

function setValueByPath(obj: SaveData, path: string, value: unknown) {
    const parts = path.split('.');
    let current = obj as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part === undefined) continue;
        if (!(part in current)) current[part] = {};
        current = current[part] as Record<string, unknown>;
    }
    const lastPart = parts[parts.length - 1];
    if (lastPart !== undefined) {
        current[lastPart] = value;
    }
}

initConflict();
