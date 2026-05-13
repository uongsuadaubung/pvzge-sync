<script lang="ts">
  import { untrack } from 'svelte';
  import { t } from '@/lib/i18n.svelte';
  import { appStore } from '@/lib/store.svelte';
  import { findConflicts, isPvzDate } from '@/lib/utils';
  import type { Conflict } from '@/lib/types';
  import type { SaveData, PvzDate } from '@/lib/schema';

  let localData = appStore.localData!;
  let remoteData = appStore.remoteData!;

  const initialConflicts = untrack(() => findConflicts(localData, remoteData));
  let conflicts = $state<Conflict[]>(initialConflicts);
  let view = $state<'simple' | 'advanced'>('simple');
  let selectedData = $state<SaveData | null>(null);

  function pvzDateToTime(d: PvzDate) {
    return new Date(d.year, d.month - 1, d.date, d.hour || 0, d.minute || 0, d.second || 0).getTime();
  }

  function escapeHTML(str: unknown): string {
    if (typeof str !== 'string') return String(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getStatDisplay(val: unknown, cVal: unknown) {
    if (isPvzDate(val) && isPvzDate(cVal)) {
      return {
        displayVal: `${val.year}-${val.month}-${val.date}`,
        isBetter: pvzDateToTime(val) > pvzDateToTime(cVal),
      };
    }
    const v = (val as number | undefined) ?? 0;
    const c = (cVal as number | undefined) ?? 0;
    return { displayVal: v === 0 ? 'N/A' : String(v), isBetter: v > c };
  }

  function formatValue(val: unknown): string {
    if (val === undefined) return '<i style="color:#666">N/A</i>';
    if (val === null) return 'null';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'object') {
      if (isPvzDate(val)) return escapeHTML(`${val.year}-${String(val.month).padStart(2,'0')}-${String(val.date).padStart(2,'0')} ${String(val.hour||0).padStart(2,'0')}:${String(val.minute||0).padStart(2,'0')}:${String(val.second||0).padStart(2,'0')}`);
      try { return escapeHTML(JSON.stringify(val, null, 1)); } catch { return '[Obj]'; }
    }
    return escapeHTML(String(val));
  }

  function applySmartSelection() {
    conflicts = conflicts.map(c => {
      const l = c.local, r = c.remote;
      let choice: 'local' | 'remote' = 'remote';
      if (Array.isArray(l) && Array.isArray(r)) choice = l.length >= r.length ? 'local' : 'remote';
      else if (typeof l === 'number' && typeof r === 'number') choice = l > r ? 'local' : 'remote';
      else if (l != null && r == null) choice = 'local';
      return { ...c, choice };
    });
  }

  function setAllChoices(choice: 'local' | 'remote') {
    conflicts = conflicts.map(c => ({ ...c, choice }));
  }

  function setChoice(index: number, choice: 'local' | 'remote') {
    conflicts = conflicts.map((c, i) => i === index ? { ...c, choice } : c);
  }

  function performMerge(): SaveData {
    const result = JSON.parse(JSON.stringify(localData)) as SaveData;
    const rec = result as Record<string, unknown>;
    conflicts.forEach(c => {
      if (c.choice === 'remote') {
        const parts = c.path.split('.');
        let cur = rec;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i]!;
          if (!(p in cur)) cur[p] = {};
          cur = cur[p] as Record<string, unknown>;
        }
        cur[parts[parts.length - 1]!] = c.remote;
      }
    });
    return result;
  }

  async function finalizeMerge(data: SaveData) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'APPLY_REMOTE_DATA', data });
    chrome.runtime.sendMessage({ type: 'UPLOAD_TO_GIST', data });
    await appStore.markSynced();
    appStore.navigate('main');
  }
</script>

{#if view === 'simple'}
<div class="conflict-container">
  <header>
    <h2>{t('detect_changes')}</h2>
    <p>{t('choose_version')}</p>
  </header>

  <div class="simple-grid">
    {#each [{ type: 'local' as const, data: localData, label: t('card_local') },
            { type: 'remote' as const, data: remoteData, label: t('card_remote') }] as card}
    {@const p = card.data.PvZ2_PlayerProperties?.[0]}
    {@const other = card.type === 'local' ? remoteData : localData}
    {@const op = other.PvZ2_PlayerProperties?.[0]}
    <button class="simple-card {selectedData === card.data ? 'selected' : ''}" onclick={() => selectedData = card.data}>
      <div class="card-tag {card.type}">{card.label}</div>
      <div class="card-stats">
        {#each [{ label: '💎 Gems', val: p?.gem, cVal: op?.gem }, { label: '🪙 Coins', val: p?.coin, cVal: op?.coin }, { label: '📅 Date', val: p?.date, cVal: op?.date }] as stat}
          {@const s = getStatDisplay(stat.val, stat.cVal)}
          <div class="stat-row">
            <span class="stat-label">{stat.label}</span>
            <span class="stat-val {s.isBetter ? 'better' : ''}">{s.displayVal}</span>
          </div>
        {/each}
      </div>
      <div class="selection-status">{selectedData === card.data ? t('selected') : t('not_selected')}</div>
    </button>
    {/each}
  </div>

  <div class="simple-actions">
    <button class="btn primary {!selectedData ? 'disabled' : ''}" disabled={!selectedData}
      onclick={() => selectedData && finalizeMerge(selectedData)}>
      {t('btn_confirm_simple')}
    </button>
  </div>

  <footer>
    {#if conflicts.length > 0}
    <button class="btn-link" onclick={() => { view = 'advanced'; }}>{t('btn_advanced')} »</button>
    <br><br>
    {/if}
    <button class="btn-link gray" onclick={() => appStore.navigate('main')}>{t('btn_cancel')}</button>
  </footer>
</div>

{:else}
<div class="conflict-container large">
  <header>
    <h2>{t('advanced_title')}</h2>
    <p>{t('advanced_desc')}</p>
  </header>

  <div class="bulk-actions">
    <button class="btn-link" style="color:#4caf50;font-weight:bold" onclick={applySmartSelection}>🪄 {t('btn_smart_select')}</button>
    <button class="btn-link" onclick={() => setAllChoices('local')}>{t('btn_all_local')}</button>
    <button class="btn-link" onclick={() => setAllChoices('remote')}>{t('btn_all_remote')}</button>
  </div>

  <div class="conflict-list">
    {#if conflicts.length === 0}
      <div style="padding:20px;text-align:center">{t('diff_none')}</div>
    {:else}
      {#each conflicts as c, i}
      <div class="conflict-item">
        <div class="prop-path" title={c.path}>{c.path.length > 25 ? '...' + c.path.slice(-22) : c.path}</div>
        <button class="val-box local {c.choice === 'local' ? 'selected' : ''}" onclick={() => setChoice(i, 'local')}>
          {@html formatValue(c.local)}
        </button>
        <button class="val-box remote {c.choice === 'remote' ? 'selected' : ''}" onclick={() => setChoice(i, 'remote')}>
          {@html formatValue(c.remote)}
        </button>
      </div>
      {/each}
    {/if}
  </div>

  <div class="merge-footer">
    <button class="btn secondary" onclick={() => view = 'simple'}>{t('btn_back')}</button>
    <button class="btn primary" onclick={() => finalizeMerge(performMerge())}>{t('btn_confirm_advanced')}</button>
  </div>
</div>
{/if}
