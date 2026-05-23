import { type Component } from "solid-js";
import { t } from "@/shared/i18n.ts";

export const FeaturesTab: Component = () => {
  return (
    <section class="tab-panel fade-in">
      <div class="panel-header">
        <h2>⚡ {t("guide_features_title")}</h2>
        <p>{t("guide_features_desc")}</p>
      </div>

      <div class="features-detailed-grid">
        {/* Feature 1: Tự động đồng bộ */}
        <div class="feature-detail-card">
          <div class="feature-icon-wrapper sync-icon-bg">🔄</div>
          <div class="feature-content">
            <h3>{t("guide_feature1_title")}</h3>
            <p>{t("guide_feature1_desc")}</p>
            <ul class="feature-bullets">
              <li>
                <strong>{t("guide_feature1_how_to")}</strong>{" "}
                {t("guide_feature1_how_to_desc")}
              </li>
              <li>
                <strong>{t("guide_feature1_smart")}</strong>{" "}
                {t("guide_feature1_smart_desc")}
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 2: Tự động nhặt */}
        <div class="feature-detail-card">
          <div class="feature-icon-wrapper collect-icon-bg">☀️</div>
          <div class="feature-content">
            <h3>{t("guide_feature2_title")}</h3>
            <p>{t("guide_feature2_desc")}</p>
            <ul class="feature-bullets">
              <li>
                <strong>{t("guide_feature2_how_to")}</strong>{" "}
                {t("guide_feature2_how_to_desc")}
              </li>
              <li>
                <strong>{t("guide_feature2_secure")}</strong>{" "}
                {t("guide_feature2_secure_desc")}
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Nhập/Xuất JSON Offline */}
        <div class="feature-detail-card">
          <div class="feature-icon-wrapper offline-icon-bg">💾</div>
          <div class="feature-content">
            <h3>{t("guide_feature3_title")}</h3>
            <p>{t("guide_feature3_desc")}</p>
            <ul class="feature-bullets">
              <li>
                <strong>{t("guide_feature3_export")}</strong>{" "}
                {t("guide_feature3_export_desc")}
              </li>
              <li>
                <strong>{t("guide_feature3_import")}</strong>{" "}
                {t("guide_feature3_import_desc")}
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 4: Lịch sử sao lưu Gist */}
        <div class="feature-detail-card">
          <div
            class="feature-icon-wrapper sync-icon-bg"
            style="background: rgba(146, 230, 42, 0.1); color: var(--secondary);"
          >
            🕒
          </div>
          <div class="feature-content">
            <h3>{t("guide_feature4_title")}</h3>
            <p>{t("guide_feature4_desc")}</p>
            <ul class="feature-bullets">
              <li>
                <strong>{t("guide_feature4_how_to")}</strong>{" "}
                {t("guide_feature4_how_to_desc")}
              </li>
              <li>
                <strong>{t("guide_feature4_limit")}</strong>{" "}
                {t("guide_feature4_limit_desc")}
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 5: Ép đồng bộ một chiều */}
        <div class="feature-detail-card">
          <div
            class="feature-icon-wrapper sync-icon-bg"
            style="background: rgba(255, 90, 90, 0.1); color: var(--error);"
          >
            ⚡
          </div>
          <div class="feature-content">
            <h3>{t("guide_feature5_title")}</h3>
            <p>{t("guide_feature5_desc")}</p>
            <ul class="feature-bullets">
              <li>
                <strong>{t("guide_feature5_upload")}</strong>{" "}
                {t("guide_feature5_upload_desc")}
              </li>
              <li>
                <strong>{t("guide_feature5_download")}</strong>{" "}
                {t("guide_feature5_download_desc")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesTab;
