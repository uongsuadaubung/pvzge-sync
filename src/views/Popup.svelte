<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "@/shared/i18n.svelte";
  import { GAME_HOST } from "@/shared/constants";
  import { smartSync } from "@/domains/sync/sync";
  import Main from "@/views/Main.svelte";
  import Settings from "@/views/Settings.svelte";
  import Notice from "@/views/Notice.svelte";
  import { appStore } from "@/shared/store.svelte";
  import { View } from "@/shared/types";
  let ready = $state(false);
  let warnMsg = $state("");
  let errorMsg = $state("");

  async function getGameTab(): Promise<chrome.tabs.Tab | null> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab?.url?.includes(GAME_HOST) ? tab : null;
  }


  onMount(async () => {
    await appStore.init();

    const tab = await getGameTab();
    if (!tab) {
      warnMsg = t("not_game_page_body");
      ready = true;
      return;
    }

    // Auto-sync nếu đã cấu hình GitHub
    if (appStore.githubConnected) {
      const synced = await smartSync().catch((e: unknown) => {
        errorMsg = e instanceof Error ? e.message : String(e);
        return false;
      });
      if (synced) appStore.lastSync = Date.now();
    }

    ready = true;
  });
</script>

{#if ready}
  {#if appStore.view === View.Settings}
    <Settings />
  {:else if warnMsg || errorMsg}
    <Notice {warnMsg} {errorMsg} />
  {:else}
    <Main />
  {/if}
{/if}
