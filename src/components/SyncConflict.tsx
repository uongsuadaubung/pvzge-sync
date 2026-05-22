import { t } from "@/shared/i18n.ts";
import Button from "@/components/Button.tsx";

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

export default function SyncConflict(props: Props) {
  return (
    <main class="conflict-wrapper">
      <div class="conflict-card">
        <div class="conflict-icon">⚖️</div>
        <h2>{t("conflict_title")}</h2>
        <p class="conflict-desc">
          {t("conflict_desc")}
        </p>

        <div class="conflict-options">
          <button
            type="button"
            class="conflict-option-card local"
            onClick={props.onChooseLocal}
            disabled={props.loading}
          >
            <div class="option-header">
              <span class="option-icon">💾</span>
              <h4>{t("conflict_use_local")}</h4>
            </div>
            <p class="option-desc">{t("conflict_use_local_desc")}</p>
            {props.localProfile && (
              <div class="option-stats">
                <div class="stat-row name">
                  <span class="stat-icon">👤</span>
                  <span class="stat-val">{props.localProfile.name}</span>
                </div>
                <div class="stat-grid">
                  <div class="stat-col">
                    <span class="stat-icon">🪙</span>
                    <span class="stat-val">{props.localProfile.coin}</span>
                  </div>
                  <div class="stat-col">
                    <span class="stat-icon">💎</span>
                    <span class="stat-val">{props.localProfile.gem}</span>
                  </div>
                  <div class="stat-col">
                    <span class="stat-icon">🌱</span>
                    <span class="stat-val">{props.localProfile.sprout}</span>
                  </div>
                </div>
              </div>
            )}
          </button>

          <button
            type="button"
            class="conflict-option-card cloud"
            onClick={props.onChooseCloud}
            disabled={props.loading}
          >
            <div class="option-header">
              <span class="option-icon">☁️</span>
              <h4>{t("conflict_use_cloud")}</h4>
            </div>
            <p class="option-desc">{t("conflict_use_cloud_desc")}</p>
            {props.cloudProfile && (
              <div class="option-stats">
                <div class="stat-row name">
                  <span class="stat-icon">👤</span>
                  <span class="stat-val">{props.cloudProfile.name}</span>
                </div>
                <div class="stat-grid">
                  <div class="stat-col">
                    <span class="stat-icon">🪙</span>
                    <span class="stat-val">{props.cloudProfile.coin}</span>
                  </div>
                  <div class="stat-col">
                    <span class="stat-icon">💎</span>
                    <span class="stat-val">{props.cloudProfile.gem}</span>
                  </div>
                  <div class="stat-col">
                    <span class="stat-icon">🌱</span>
                    <span class="stat-val">{props.cloudProfile.sprout}</span>
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>

        <div class="conflict-actions">
          <Button
            variant="outline"
            onClick={props.onCancel}
            disabled={props.loading}
          >
            {t("btn_cancel")}
          </Button>
        </div>
      </div>
    </main>
  );
}
