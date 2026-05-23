import { type Component } from "solid-js";
import { t } from "@/shared/i18n.ts";

export const FaqTab: Component = () => {
  return (
    <section class="tab-panel fade-in">
      <div class="panel-header">
        <h2>💡 {t("guide_faq_title")}</h2>
        <p>{t("guide_faq_desc")}</p>
      </div>

      <div class="faq-grid">
        <div class="faq-card">
          <h4>❓ {t("guide_faq1_q")}</h4>
          <p>{t("guide_faq1_a")}</p>
        </div>

        <div class="faq-card">
          <h4>❓ {t("guide_faq2_q")}</h4>
          <p>{t("guide_faq2_a")}</p>
        </div>

        <div class="faq-card">
          <h4>❓ {t("guide_faq3_q")}</h4>
          <p>{t("guide_faq3_a")}</p>
        </div>

        <div class="faq-card text-highlight">
          <h4>🌟 {t("guide_faq4_q")}</h4>
          <p>{t("guide_faq4_a")}</p>
        </div>

        <div class="faq-card">
          <h4>❓ {t("guide_faq5_q")}</h4>
          <p>{t("guide_faq5_a")}</p>
        </div>

        <div class="faq-card">
          <h4>❓ {t("guide_faq6_q")}</h4>
          <p>{t("guide_faq6_a")}</p>
        </div>
      </div>
    </section>
  );
};

export default FaqTab;
