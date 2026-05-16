<script lang="ts">
  import { t } from "@/shared/i18n.svelte";

  interface NoticeProps {
    warnMsg?: string;
    errorMsg?: string;
  }

  import Header from "./Header.svelte";
  let { warnMsg = "", errorMsg = "" }: NoticeProps = $props();
</script>

<div class="container">
  <Header showLogo />

  {#if warnMsg}
    <div class="warn-banner">
      <strong>🎮 {t("not_game_page_title")}</strong><br />{@html warnMsg}
    </div>
  {:else if errorMsg}
    <div class="error-banner">
      <strong>⚠️ {t("schema_error_title")}</strong><br />
      {t("schema_error_body")}<br />
      <small>{errorMsg}</small>
    </div>
  {/if}
</div>

<style lang="scss">
  .error-banner {
    background: var(--notice-error-bg);
    border: 1px solid var(--notice-error-border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    color: var(--notice-error-text);
    font-size: 0.85rem;
    line-height: 1.5;

    strong { color: var(--error); }
  }

  .warn-banner {
    background: var(--notice-warn-bg);
    border: 1px solid var(--notice-warn-border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    color: var(--notice-warn-text);
    font-size: 0.85rem;
    line-height: 1.5;

    strong { color: var(--secondary); }
  }
</style>
