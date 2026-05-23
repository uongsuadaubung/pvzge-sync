import { type Component } from "solid-js";
import { t } from "@/shared/i18n.ts";

export const PolicyTab: Component = () => {
  return (
    <section class="tab-panel fade-in">
      <div class="panel-header">
        <h2>🛡️ {t("policy_title")}</h2>
        <p>{t("policy_desc")}</p>
      </div>

      <div class="features-detailed-grid" style={{ "margin-top": "20px" }}>
        {/* Item 1: Không thu thập dữ liệu */}
        <div class="feature-detail-card">
          <div
            class="feature-icon-wrapper collect-icon-bg"
            style="background: rgba(255, 90, 90, 0.1); color: var(--error);"
          >
            🚫
          </div>
          <div class="feature-content">
            <h3 style={{ color: "var(--error)" }}>{t("policy_item1_title")}</h3>
            <p>{t("policy_item1_desc")}</p>
          </div>
        </div>

        {/* Item 2: Lưu trữ cục bộ */}
        <div class="feature-detail-card">
          <div
            class="feature-icon-wrapper sync-icon-bg"
            style="background: rgba(146, 230, 42, 0.1); color: var(--secondary);"
          >
            🔒
          </div>
          <div class="feature-content">
            <h3 style={{ color: "var(--secondary)" }}>
              {t("policy_item2_title")}
            </h3>
            <p>{t("policy_item2_desc")}</p>
          </div>
        </div>

        {/* Item 3: Kết nối trực tiếp */}
        <div class="feature-detail-card">
          <div
            class="feature-icon-wrapper offline-icon-bg"
            style="background: rgba(255, 212, 38, 0.1); color: var(--primary);"
          >
            🌐
          </div>
          <div class="feature-content">
            <h3 style={{ color: "var(--primary)" }}>
              {t("policy_item3_title")}
            </h3>
            <p>{t("policy_item3_desc")}</p>
          </div>
        </div>

        {/* Item 4: Mã nguồn mở */}
        <div class="feature-detail-card">
          <div
            class="feature-icon-wrapper offline-icon-bg"
            style="background: rgba(255, 140, 0, 0.15); color: var(--accent);"
          >
            🔬
          </div>
          <div class="feature-content">
            <h3 style={{ color: "var(--accent)" }}>
              {t("policy_item4_title")}
            </h3>
            <p>{t("policy_item4_desc")}</p>
          </div>
        </div>
      </div>

      <div
        class="tip-banner"
        style={{
          "display": "flex",
          "gap": "14px",
          "align-items": "center",
          "background": "rgba(var(--secondary-rgb), 0.08)",
          "border": "1px solid rgba(var(--secondary-rgb), 0.25)",
          "padding": "16px 20px",
          "border-radius": "12px",
          "margin-top": "30px",
          "color": "var(--text)",
        }}
      >
        <span class="tip-icon" style={{ "font-size": "1.5rem" }}>🌿</span>
        <p
          style={{
            "margin": "0",
            "font-size": "0.85rem",
            "line-height": "1.6",
            "color": "var(--text-dim)",
          }}
        >
          {t("policy_summary")}
        </p>
      </div>
    </section>
  );
};

export default PolicyTab;
