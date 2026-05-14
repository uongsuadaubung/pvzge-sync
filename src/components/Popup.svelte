<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "@/lib/i18n.svelte";
  import { GAME_HOST } from "@/lib/constants";
  import { smartSync } from "@/lib/sync";
  import Main from "@/components/Main.svelte";
  import Settings from "@/components/Settings.svelte";
  import Notice from "@/components/Notice.svelte";
  import { appStore } from "@/lib/store.svelte";
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
      await smartSync().catch((e: unknown) => {
        errorMsg = e instanceof Error ? e.message : String(e);
      });
    }

    ready = true;
  });
</script>

{#if ready}
  {#if appStore.view === "settings"}
    <Settings />
  {:else if warnMsg || errorMsg}
    <Notice {warnMsg} {errorMsg} />
  {:else}
    <Main />
  {/if}
{/if}
