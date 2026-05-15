<script lang="ts">
  import { onMount } from "svelte";
  import { t, SupportLanguage } from "@/shared/i18n.svelte";
  import { appStore } from "@/shared/store.svelte";
  import UserProfile from "./UserProfile.svelte";
  import { View } from "@/shared/types";
  import type { SyncResponse } from "@/shared/types";

  let tokenInput = $state("");
  let langInput = $state(SupportLanguage.En);
  let saving = $state(false);
  let tokenError = $state("");

  onMount(() => {
    tokenInput = appStore.githubToken;
    langInput = appStore.language;
  });

  async function save() {
    const token = tokenInput.trim();
    tokenError = "";

    if (token) {
      saving = true;
      const r: SyncResponse = await new Promise((resolve) =>
        chrome.runtime.sendMessage({ type: "VALIDATE_TOKEN", token }, resolve),
      );
      saving = false;
      if (!r.success) {
        tokenError = r.error ?? t("token_invalid");
        return;
      }
      appStore.githubUser = "githubUser" in r ? r.githubUser : null;
    }

    await appStore.updateSettings(token, langInput);
    appStore.navigate(View.Main);
  }
</script>

<div class="container">
  <header>
    <button
      class="btn-back-icon"
      aria-label={t("btn_go_back")}
      onclick={() => appStore.navigate(View.Main)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <div class="header-text">
      <h1>{t("settings_title")}</h1>
    </div>
  </header>

  <main>
    <div class="input-group">
      <label for="select-lang">{t("lang_label")}</label>
      <select id="select-lang" bind:value={langInput}>
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </div>

    <div class="input-group">
      <label for="input-token">{t("token_label")}</label>
      {#if appStore.githubConnected}
        <UserProfile user={appStore.githubUser} showConnectedText />
        <button
          class="btn secondary full-width"
          onclick={() => {
            appStore.logout();
            tokenInput = "";
          }}
        >
          {t("btn_logout")}
        </button>
      {:else}
        <input
          id="input-token"
          type="password"
          bind:value={tokenInput}
          placeholder="ghp_xxxxxxxxxxxx"
          oninput={() => (tokenError = "")}
        />
        {#if tokenError}
          <p class="token-error">{tokenError}</p>
        {/if}
        <div class="help-box">
          <p>
            {t("help_no_token")}
            <a
              href="https://github.com/settings/tokens/new?description=PVZGE%20Sync&scopes=gist"
              target="_blank"
              rel="noopener noreferrer">{t("help_click_here")}</a
            >
          </p>
          <ul>
            <li>{@html t("help_step1")}</li>
            <li>{t("help_step2")}</li>
          </ul>
        </div>
      {/if}
    </div>

    {#if !appStore.githubConnected}
      <div style="margin-top: 24px;">
        <button class="btn primary full-width" onclick={save} disabled={saving}
          >{saving ? t("token_validating") : t("btn_save")}</button
        >
      </div>
    {/if}
  </main>
</div>
