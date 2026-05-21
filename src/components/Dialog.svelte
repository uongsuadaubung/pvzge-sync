<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { t } from "@/shared/i18n.svelte";
  import Button from "./Button.svelte";

  interface Props {
    show: boolean;
    title: string;
    message: string;
    type?: "alert" | "confirm";
    severity?: "info" | "success" | "warning" | "error";
    onConfirm: (result: boolean) => void;
  }

  let {
    show,
    title,
    message,
    type = "alert",
    severity = "info",
    onConfirm,
  }: Props = $props();

  function getSeverityIcon(sev: typeof severity) {
    switch (sev) {
      case "success": return "☀️"; // Sunflower Sun
      case "error": return "🧟"; // Zombie
      case "warning": return "⚠️"; // Alert Sign
      case "info":
      default:
        return "ℹ️"; // Info Sign
    }
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="dialog-overlay" 
    transition:fade={{ duration: 150 }}
    onclick={() => { if (type === "alert") onConfirm(true); }}
  >
    <div 
      class="dialog-box {severity}" 
      transition:scale={{ duration: 180, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="dialog-header">
        <span class="dialog-icon">{getSeverityIcon(severity)}</span>
        <h3>{title}</h3>
      </div>
      
      <div class="dialog-body">
        <p>{message}</p>
      </div>

      <div class="dialog-footer">
        {#if type === "confirm"}
          <Button 
            variant="outline" 
            onclick={() => onConfirm(false)}
          >
            {t("btn_cancel")}
          </Button>
          <Button 
            variant={severity === "error" || severity === "warning" ? "danger" : "primary"} 
            onclick={() => onConfirm(true)}
          >
            {t("dialog_btn_ok")}
          </Button>
        {:else}
          <Button 
            variant="primary" 
            onclick={() => onConfirm(true)}
            fullWidth
          >
            {t("dialog_btn_ok")}
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--dialog-overlay-bg);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 24px;
    box-sizing: border-box;
  }

  .dialog-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 320px;
    box-shadow: 0 12px 36px var(--shadow-dark);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: glowEffect 4s infinite alternate;
    box-sizing: border-box;

    &.success {
      border-color: var(--dialog-border-success);
      --dialog-glow: var(--dialog-glow-success);
    }
    &.error {
      border-color: var(--dialog-border-error);
      --dialog-glow: var(--dialog-glow-error);
    }
    &.warning {
      border-color: var(--dialog-border-warning);
      --dialog-glow: var(--dialog-glow-warning);
    }
    &.info {
      border-color: var(--border);
      --dialog-glow: var(--dialog-glow-info);
    }
  }

  @keyframes glowEffect {
    from {
      box-shadow: 0 12px 36px var(--shadow-dark), 0 0 12px transparent;
    }
    to {
      box-shadow: 0 12px 36px var(--shadow-dark), 0 0 16px var(--dialog-glow, transparent);
    }
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 20px 10px;
    
    .dialog-icon {
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 4px var(--dialog-icon-shadow));
    }

    h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .dialog-body {
    padding: 0 20px 18px;
    font-size: 0.82rem;
    color: var(--text-dim);
    line-height: 1.5;
    
    p {
      margin: 0;
      word-break: break-word;
      white-space: pre-wrap;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px 16px;
    background: var(--dialog-footer-bg);
    border-top: 1px solid var(--border);
    box-sizing: border-box;

    :global(button) {
      min-width: 80px;
      padding: 10px 14px !important;
      font-size: 0.8rem !important;
      height: auto !important;
    }
  }
</style>
