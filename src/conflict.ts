import { t, applyTranslations } from './i18n';
import { findConflicts, isPvzDate } from './utils';
import type { SaveData, Conflict, PvzDate } from './types';

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
    const p = (data.PvZ2_PlayerProperties as Record<string, unknown>[])?.[0] || {};
    const cp = (compareTo.PvZ2_PlayerProperties as Record<string, unknown>[])?.[0] || {};

    const stats = [
        { label: '💎 Gems', val: p.gem as number, cVal: cp.gem as number },
        { label: '🪙 Coins', val: p.coin as number, cVal: cp.coin as number },
        { label: '📅 Date', val: p.date as unknown as PvzDate, cVal: cp.date as unknown as PvzDate, isDate: true }
    ];

    container.innerHTML = stats.map(s => {
        let displayVal: unknown = s.val;
        let isBetter: boolean;

        if (s.isDate && s.val) {
            const d = s.val as PvzDate;
            displayVal = `${d.year}-${d.month}-${d.date}`;
            isBetter = pvzDateToTime(d) > pvzDateToTime(s.cVal as PvzDate);
        } else {
            isBetter = (s.val as number) > (s.cVal as number);
        }

        return `
            <div class="stat-row">
                <span class="stat-label">${s.label}</span>
                <span class="stat-val ${isBetter ? 'better' : ''}">${displayVal ?? 'N/A'}</span>
            </div>
        `;
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
            const d = val as unknown as PvzDate;
            return escapeHTML(`${d.year}-${String(d.month).padStart(2, '0')}-${String(d.date).padStart(2, '0')} ${String(d.hour || 0).padStart(2, '0')}:${String(d.minute || 0).padStart(2, '0')}:${String(d.second || 0).padStart(2, '0')}`);
        }
        try { return escapeHTML(JSON.stringify(val, null, 1)); } catch { return '[Obj]'; }
    }
    return escapeHTML(String(val));
}

function applySmartSelection() {
    conflicts.forEach(c => {
        const l = c.local as Record<string, unknown>;
        const r = c.remote as Record<string, unknown>;
        if (Array.isArray(l) && Array.isArray(r)) c.choice = l.length >= r.length ? 'local' : 'remote';
        else if (typeof l === 'number' && typeof r === 'number') c.choice = (l as number) > (r as number) ? 'local' : 'remote';
        else if (l != null && r == null) c.choice = 'local';
        else c.choice = 'remote';
    });
    renderConflicts();
}

function pvzDateToTime(obj: unknown): number { 
    if (!obj) return 0; 
    const d = obj as PvzDate;
    return new Date(d.year, d.month - 1, d.date, d.hour || 0, d.minute || 0, d.second || 0).getTime(); 
}

function setAllChoices(choice: 'local' | 'remote') { conflicts.forEach(c => c.choice = choice); renderConflicts(); }

function performMerge() {
    const result = JSON.parse(JSON.stringify(localData)) as SaveData;
    conflicts.forEach(c => { if (c.choice === 'remote') setValueByPath(result, c.path, c.remote); });
    
    // Auto-pick latest date for the final merged result
    const lDate = localData.date;
    const rDate = remoteData.date;
    if (isPvzDate(lDate) && isPvzDate(rDate)) {
        result.date = pvzDateToTime(lDate) > pvzDateToTime(rDate) ? lDate : rDate;
    }
    
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
