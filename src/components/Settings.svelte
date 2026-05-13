<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "@/lib/i18n.svelte";
  import { appStore } from "@/lib/store.svelte";

  let tokenInput = $state("");
  let langInput = $state("en");

  onMount(() => {
    tokenInput = appStore.githubToken;
    langInput = appStore.language;
  });

  async function save() {
    await appStore.updateSettings(tokenInput.trim(), langInput);
    appStore.navigate('main');
  }
</script>

<div class="container">
  <header>
    <button class="btn-back-icon" aria-label="Go back" onclick={() => appStore.navigate('main')}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
      </svg>
    </button>
    <div class="header-text">
      <h1>{t("settings_title")}</h1>
    </div>
  </header>

  <main>
    <div class="input-group">
      <label for="select-lang">{t("lang_label")}</label>
      <select
        id="select-lang"
        bind:value={langInput}
      >
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </div>

    <div class="input-group">
      <label for="input-token">GitHub Personal Access Token:</label>
      <input
        id="input-token"
        type="password"
        bind:value={tokenInput}
        placeholder="ghp_xxxxxxxxxxxx"
      />
    </div>

    <div style="margin-top: 24px;">
      <button class="btn primary full-width" onclick={save}
        >{t("btn_save")}</button
      >
    </div>
  </main>
</div>
