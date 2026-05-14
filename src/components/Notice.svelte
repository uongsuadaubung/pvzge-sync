<script lang="ts">
  import { t } from "@/lib/i18n.svelte";

  interface NoticeProps {
    warnMsg?: string;
    errorMsg?: string;
  }

  let { warnMsg = "", errorMsg = "" }: NoticeProps = $props();
</script>

<div class="container">
  <header>
    <div class="logo-wrapper">
      <img src="icons/icon48.png" alt="Logo" class="logo" />
    </div>
    <div class="header-text">
      <h1>{t("app_name")}</h1>
    </div>
  </header>

  {#if warnMsg}
    <div class="warn-banner">
      <strong>🎮 {t("not_game_page_title")}</strong><br />{@html warnMsg}
    </div>
  {:else if errorMsg}
    <div class="error-banner">
      <strong>⚠️ {t("schema_error_title")}</strong><br />
      Local save data is incompatible. Please update the extension.<br />
      <small>{errorMsg}</small>
    </div>
  {/if}
</div>
