<script lang="ts">
  import { t } from "@/shared/i18n.svelte";
  import Button from "./Button.svelte";

  interface ProfileInfo {
    name: string;
    coin: number;
    gem: number;
    sprout: number;
  }

  interface Props {
    localProfile: ProfileInfo | null;
    cloudProfile: ProfileInfo | null;
    loading: boolean;
    onChooseLocal: () => void;
    onChooseCloud: () => void;
    onCancel: () => void;
  }

  let {
    localProfile,
    cloudProfile,
    loading,
    onChooseLocal,
    onChooseCloud,
    onCancel,
  }: Props = $props();
</script>

<main class="conflict-wrapper">
  <div class="conflict-card">
    <div class="conflict-icon">⚖️</div>
    <h2>{t("conflict_title")}</h2>
    <p class="conflict-desc">
      {t("conflict_desc")}
    </p>

    <div class="conflict-options">
      <button type="button" class="conflict-option-card local" onclick={onChooseLocal} disabled={loading}>
        <div class="option-header">
          <span class="option-icon">💾</span>
          <h4>{t("conflict_use_local")}</h4>
        </div>
        <p class="option-desc">{t("conflict_use_local_desc")}</p>
        {#if localProfile}
          <div class="option-stats">
            <div class="stat-row name">
              <span class="stat-icon">👤</span>
              <span class="stat-val">{localProfile.name}</span>
            </div>
            <div class="stat-grid">
              <div class="stat-col">
                <span class="stat-icon">🪙</span>
                <span class="stat-val">{localProfile.coin}</span>
              </div>
              <div class="stat-col">
                <span class="stat-icon">💎</span>
                <span class="stat-val">{localProfile.gem}</span>
              </div>
              <div class="stat-col">
                <span class="stat-icon">🌱</span>
                <span class="stat-val">{localProfile.sprout}</span>
              </div>
            </div>
          </div>
        {/if}
      </button>

      <button type="button" class="conflict-option-card cloud" onclick={onChooseCloud} disabled={loading}>
        <div class="option-header">
          <span class="option-icon">☁️</span>
          <h4>{t("conflict_use_cloud")}</h4>
        </div>
        <p class="option-desc">{t("conflict_use_cloud_desc")}</p>
        {#if cloudProfile}
          <div class="option-stats">
            <div class="stat-row name">
              <span class="stat-icon">👤</span>
              <span class="stat-val">{cloudProfile.name}</span>
            </div>
            <div class="stat-grid">
              <div class="stat-col">
                <span class="stat-icon">🪙</span>
                <span class="stat-val">{cloudProfile.coin}</span>
              </div>
              <div class="stat-col">
                <span class="stat-icon">💎</span>
                <span class="stat-val">{cloudProfile.gem}</span>
              </div>
              <div class="stat-col">
                <span class="stat-icon">🌱</span>
                <span class="stat-val">{cloudProfile.sprout}</span>
              </div>
            </div>
          </div>
        {/if}
      </button>
    </div>

    <div class="conflict-actions">
      <Button variant="outline" onclick={onCancel} disabled={loading}>
        {t("btn_cancel")}
      </Button>
    </div>
  </div>
</main>

<style lang="scss">
  .conflict-wrapper {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .conflict-card {
    background: var(--surface);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid var(--border);
    box-shadow: 0 8px 32px var(--shadow-dark);
    text-align: center;

    .conflict-icon {
      font-size: 2.2rem;
      margin-bottom: 12px;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
    }

    h2 {
      margin: 0 0 10px;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary);
    }

    .conflict-desc {
      font-size: 0.8rem;
      color: var(--text-dim);
      line-height: 1.5;
      margin: 0 0 20px;
      padding: 0 6px;
    }
  }

  .conflict-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .conflict-option-card {
    background: var(--surface-light);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    color: inherit;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    &.local:hover:not(:disabled) {
      border-color: var(--secondary);
      box-shadow: 0 4px 12px rgba(var(--secondary-rgb), 0.15);
    }

    &.cloud:hover:not(:disabled) {
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.15);
    }

    .option-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      .option-icon {
        font-size: 1.1rem;
      }

      h4 {
        margin: 0;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text);
      }
    }

    .option-desc {
      margin: 0;
      font-size: 0.72rem;
      color: var(--text-dim);
      line-height: 1.4;
    }

    .option-stats {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed var(--border);
      display: flex;
      flex-direction: column;
      gap: 6px;

      .stat-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        
        &.name {
          font-weight: 600;
          color: var(--primary);
        }

        .stat-icon {
          font-size: 0.85rem;
        }

        .stat-val {
          color: var(--text);
        }
      }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      .stat-col {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        background: var(--surface);
        padding: 4px 6px;
        border-radius: 6px;
        border: 1px solid var(--border);

        .stat-icon {
          font-size: 0.85rem;
        }

        .stat-val {
          font-weight: 700;
          color: var(--text);
        }
      }
    }
  }

  .conflict-actions {
    display: flex;
    justify-content: center;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
