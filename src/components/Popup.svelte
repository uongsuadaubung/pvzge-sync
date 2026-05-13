<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "@/lib/i18n.svelte";
  import { GAME_HOST } from "@/lib/constants";
  import type { SaveData } from "@/lib/schema";
  import { appStore } from "@/lib/store.svelte";
  import Main from "@/components/Main.svelte";
  import Settings from "@/components/Settings.svelte";
  import Conflict from "@/components/Conflict.svelte";
  import Notice from "@/components/Notice.svelte";

  let ready = $state(false);
  let warnMsg = $state("");
  let errorMsg = $state("");

  async function getGameTab(): Promise<chrome.tabs.Tab | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab?.url?.includes(GAME_HOST) ? tab : null;
  }

  async function getLocalData(): Promise<SaveData> {
    const tab = await getGameTab();
    if (!tab) throw new Error(t("msg_game_not_open"));
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id!, { type: "GET_LOCAL_DATA" }, (r) => {
        chrome.runtime.lastError
          ? reject(new Error("Connection error."))
          : resolve(r.data);
      });
    });
  }

  async function validateLocalData(): Promise<{ valid: boolean; errors: string[] }> {
    const tab = await getGameTab();
    if (!tab) return { valid: false, errors: [t("msg_game_not_open")] };
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id!, { type: "VALIDATE_LOCAL_DATA" }, (r) => {
        if (chrome.runtime.lastError || !r)
          resolve({ valid: false, errors: ["Connection error"] });
        else resolve(r as { valid: boolean; errors: string[] });
      });
    });
  }

  onMount(async () => {
    await appStore.init();

    const tab = await getGameTab();
    if (!tab) {
      warnMsg = t("not_game_page_body");
      ready = true;
      return;
    }

    const validation = await validateLocalData();
    if (!validation.valid) {
      errorMsg = validation.errors.join("; ");
      ready = true;
      return;
    }

    appStore.localData = await getLocalData();
    ready = true;
  });
</script>

{#if ready}
  {#if appStore.view === "conflict"}
    <Conflict />
  {:else if appStore.view === "settings"}
    <Settings />
  {:else if warnMsg || errorMsg}
    <Notice {warnMsg} {errorMsg} />
  {:else}
    <Main />
  {/if}
{/if}
