<script lang="ts">
  import { onMount } from "svelte";
  import { t, SupportLanguage } from "@/shared/i18n.svelte";
  import { appStore } from "@/shared/store.svelte";
  import Header from "./Header.svelte";
  import Button from "./Button.svelte";
  import UserProfile from "./UserProfile.svelte";
  import { View } from "@/shared/types";
  import NumberInput from "./NumberInput.svelte";
  import Select from "./Select.svelte";
  import Checkbox from "./Checkbox.svelte";
  import Input from "./Input.svelte";
  import type { SyncResponse } from "@/shared/types";

  let tokenInput = $state("");
  let langInput = $state(SupportLanguage.En);
  let autoSyncEnabled = $state(false);
  let autoSyncInterval = $state(30);
  let saving = $state(false);
  let tokenError = $state("");

  const langOptions = [
    { value: "en", label: "English" },
    { value: "vi", label: "Tiếng Việt" }
  ];

  onMount(() => {
    tokenInput = appStore.githubToken;
    langInput = appStore.language;
    autoSyncEnabled = appStore.autoSyncEnabled;
    autoSyncInterval = appStore.autoSyncInterval;
  });

  async function save() {
    const token = tokenInput.trim();
    tokenError = "";

    // Chỉ validate nếu token thay đổi và không rỗng
    if (token && token !== appStore.githubToken) {
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

    await appStore.updateSettings(token, langInput, autoSyncEnabled, autoSyncInterval);
    appStore.navigate(View.Main);
  }
</script>

<div class="container">
  <Header 
    showBack 
    title={t("settings_title")} 
  />

  <main>
    <div class="input-group">
      <label for="select-lang">{t("lang_label")}</label>
      <Select 
        id="select-lang" 
        bind:value={langInput} 
        options={langOptions} 
      />
    </div>

    <div class="input-group">
      <Checkbox 
        id="check-autosync" 
        bind:checked={autoSyncEnabled} 
        label={t("auto_sync_label")} 
      />
    </div>

    {#if autoSyncEnabled}
      <div class="input-group">
        <label for="input-interval">{t("auto_sync_interval")}</label>
        <div class="flex-row">
          <NumberInput
            id="input-interval"
            bind:value={autoSyncInterval}
            min={5}
          />
          <span style="margin-left: 12px;">{t("auto_sync_mins")}</span>
        </div>
      </div>
    {/if}

    <div class="input-group">
      <label for="input-token">{t("token_label")}</label>
      {#if appStore.githubConnected}
        <UserProfile user={appStore.githubUser} showConnectedText />
        <Button
          variant="danger"
          fullWidth
          onclick={() => {
            appStore.logout();
            tokenInput = "";
          }}
        >
          {t("btn_logout")}
        </Button>
      {:else}
        <Input
          id="input-token"
          type="password"
          bind:value={tokenInput}
          placeholder="ghp_xxxxxxxxxxxx"
          error={!!tokenError}
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

    <div class="input-group">
      <Button 
        fullWidth 
        onclick={save} 
        disabled={saving}
      >
        {saving ? t("token_validating") : t("btn_save")}
      </Button>
    </div>
  </main>
</div>

<style lang="scss">
  .input-group {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 0.8rem;
      margin-bottom: 6px;
      color: var(--text-dim);
    }



    .flex-row {
      display: flex;
      align-items: center;
    }

    .token-error {
      color: var(--error);
      font-size: 0.78rem;
      margin: 5px 0 0;
    }
  }

  .help-box {
    margin-top: 10px;
    padding: 10px 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.78rem;
    color: var(--text-dim);
    line-height: 1.6;

    p { margin: 0 0 4px; }
    ul { margin: 4px 0 0; padding-left: 16px; }
    a {
      color: var(--primary);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  }
</style>
