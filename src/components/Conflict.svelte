<script lang="ts">
  import { t } from '@/lib/i18n.svelte';
  import { appStore } from '@/lib/store.svelte';
  import { isPvzDate } from '@/lib/utils';
  import type { SaveData, PvzDate } from '@/lib/schema';

  let localData = appStore.localData!;
  let remoteData = appStore.remoteData!;

  let selectedData = $state<SaveData | null>(null);

  function pvzDateToTime(d: PvzDate) {
    return new Date(d.year, d.month - 1, d.date, d.hour || 0, d.minute || 0, d.second || 0).getTime();
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

  async function finalizeMerge(data: SaveData) {
    // Deep-clone to strip Svelte 5 Proxy wrappers — chrome.sendMessage uses
    // the structured clone algorithm which cannot serialize Proxy objects.
    const plain = JSON.parse(JSON.stringify(data)) as SaveData;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'APPLY_REMOTE_DATA', data: plain });
    chrome.runtime.sendMessage({ type: 'UPLOAD_TO_GIST', data: plain });
    await appStore.markSynced();
    appStore.navigate('main');
  }
</script>

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
    <button class="btn-link gray" onclick={() => appStore.navigate('main')}>{t('btn_cancel')}</button>
  </footer>
</div>
