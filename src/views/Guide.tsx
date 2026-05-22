import { type Component, createSignal, onMount, Show } from "solid-js";
import { type SupportLanguage, t } from "@/shared/i18n.ts";
import { appStore, appStoreActions } from "@/shared/store.ts";
import Button from "@/components/Button.tsx";

export const Guide: Component = () => {
  // Assets
  const heroImage = chrome.runtime.getURL("images/guide_hero.png");
  const step1Image = chrome.runtime.getURL("images/1.select exprire time.png");
  const step2Image = chrome.runtime.getURL(
    "images/2.make sure selected gist.png",
  );
  const step3Image = chrome.runtime.getURL(
    "images/3.create generate button.png",
  );
  const step4Image = chrome.runtime.getURL("images/4.copy and save token.png");

  const GuideTab = {
    General: "general",
    Token: "token",
    Features: "features",
    Faq: "faq",
  } as const;

  type GuideTab = typeof GuideTab[keyof typeof GuideTab];

  const [activeTab, setActiveTab] = createSignal<GuideTab>(GuideTab.General);

  onMount(async () => {
    // Add native guide body class for layout
    document.body.classList.add("guide-body-native");
    await appStoreActions.init();
  });

  async function handleLangChange(e: Event) {
    const lang = (e.target as HTMLSelectElement).value as SupportLanguage;
    await appStoreActions.updateSettings(
      appStore.githubToken,
      lang,
      appStore.autoSyncEnabled,
      appStore.autoSyncInterval,
      appStore.autoCollectEnabled,
    );
  }

  return (
    <Show when={appStore.isLoaded}>
      <div class="guide-wrapper">
        {/* Top Navigation Bar */}
        <header class="guide-header">
          <div class="logo-area">
            <img src="icons/icon48.png" alt="PvZGE Sync Logo" class="logo" />
            <div class="brand">
              <h1>PVZGE Sync</h1>
              <span class="badge">v{chrome.runtime.getManifest().version}</span>
            </div>
          </div>

          <div class="header-controls">
            {/* Quick Language Switcher */}
            <div class="lang-selector">
              <span>🌐</span>
              <select value={appStore.language} onchange={handleLangChange}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <Button variant="outline" onclick={() => window.close()}>
              {t("guide_close_page")}
            </Button>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div class="guide-container">
          {/* Sidebar Navigation */}
          <aside class="guide-sidebar">
            <nav class="tabs-nav">
              <button
                class={`nav-tab ${
                  activeTab() === GuideTab.General ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.General)}
              >
                <span class="tab-icon">📖</span>
                <span class="tab-label">{t("guide_tab_general")}</span>
              </button>

              <button
                class={`nav-tab ${
                  activeTab() === GuideTab.Token ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.Token)}
              >
                <span class="tab-icon">🔑</span>
                <span class="tab-label">{t("guide_tab_token")}</span>
              </button>

              <button
                class={`nav-tab ${
                  activeTab() === GuideTab.Features ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.Features)}
              >
                <span class="tab-icon">⚡</span>
                <span class="tab-label">{t("guide_tab_features")}</span>
              </button>

              <button
                class={`nav-tab ${
                  activeTab() === GuideTab.Faq ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.Faq)}
              >
                <span class="tab-icon">💡</span>
                <span class="tab-label">{t("guide_tab_faq")}</span>
              </button>
            </nav>

            {/* Quick Action Card */}
            <div class="quick-action-card">
              <h3>PvZGE Web</h3>
              <p>{t("guide_quick_action_desc")}</p>
              <a
                href="https://play.pvzge.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="game-btn"
              >
                🎮 {t("guide_open_game_btn")}
              </a>
            </div>
          </aside>

          {/* Main Content Area */}
          <main class="guide-main-content">
            <Show when={activeTab() === GuideTab.General}>
              {/* GENERAL TAB */}
              <section class="tab-panel fade-in">
                <div class="hero-section">
                  <img src={heroImage} alt="Guide Hero" class="hero-img" />
                  <div class="hero-overlay">
                    <h2>{t("guide_welcome")}</h2>
                    <p>{t("guide_subtitle")}</p>
                  </div>
                </div>

                <div class="section-title">
                  <h2>
                    {appStore.language === "vi"
                      ? "3 Bước khởi đầu nhanh"
                      : "3 Quick Start Steps"}
                  </h2>
                  <div class="divider"></div>
                </div>

                <div class="steps-grid">
                  <section class="guide-step">
                    <div class="step-badge">
                      <span class="step-num">01</span>
                    </div>
                    <div class="step-text">
                      <h3>{t("guide_step1_title")}</h3>
                      <p>{t("guide_step1_desc")}</p>
                    </div>
                  </section>

                  <section class="guide-step">
                    <div class="step-badge">
                      <span class="step-num">02</span>
                    </div>
                    <div class="step-text">
                      <h3>{t("guide_step2_title")}</h3>
                      <p>{t("guide_step2_desc")}</p>
                    </div>
                  </section>

                  <section class="guide-step">
                    <div class="step-badge">
                      <span class="step-num">03</span>
                    </div>
                    <div class="step-text">
                      <h3>{t("guide_step3_title")}</h3>
                      <p>{t("guide_step3_desc")}</p>
                    </div>
                  </section>
                </div>
              </section>
            </Show>

            <Show when={activeTab() === GuideTab.Token}>
              {/* TOKEN TAB */}
              <section class="tab-panel fade-in">
                <div class="panel-header">
                  <h2>🔑 {t("guide_token_title")}</h2>
                  <p>{t("guide_token_desc")}</p>
                </div>

                <div class="steps-vertical">
                  {/* STEP 1 */}
                  <div class="vertical-step-card">
                    <div class="step-index">1</div>
                    <div class="step-content">
                      <h3>{t("guide_token_step1_title")}</h3>
                      <p>{t("guide_token_step1_desc")}</p>
                      <a
                        href="https://github.com/settings/tokens/new?description=PVZGE%20Sync&scopes=gist"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="action-link-btn"
                      >
                        🚀 {t("guide_token_step1_btn")}
                      </a>

                      <div class="tutorial-image-container">
                        <div class="image-wrapper">
                          <img
                            src={step1Image}
                            alt="Select Expiration"
                            class="tutorial-img"
                            onerror={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.src = heroImage;
                              img.style.opacity = "0.3";
                            }}
                          />
                          <div class="image-placeholder-info">
                            <span>💡 {t("guide_token_step1_img_info")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2 */}
                  <div class="vertical-step-card">
                    <div class="step-index">2</div>
                    <div class="step-content">
                      <h3>{t("guide_token_step2_title")}</h3>
                      <p>{t("guide_token_step2_desc")}</p>

                      <div class="tutorial-image-container">
                        <div class="image-wrapper">
                          <img
                            src={step2Image}
                            alt="Select Gist Scope"
                            class="tutorial-img"
                            onerror={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.src = heroImage;
                              img.style.opacity = "0.3";
                            }}
                          />
                          <div class="image-placeholder-info">
                            <span>💡 {t("guide_token_step2_img_info")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3 */}
                  <div class="vertical-step-card">
                    <div class="step-index">3</div>
                    <div class="step-content">
                      <h3>{t("guide_token_step3_title")}</h3>
                      <p>{t("guide_token_step3_desc")}</p>

                      <div class="tutorial-image-container">
                        <div class="image-wrapper">
                          <img
                            src={step3Image}
                            alt="Generate Token Button"
                            class="tutorial-img"
                            onerror={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.src = heroImage;
                              img.style.opacity = "0.3";
                            }}
                          />
                          <div class="image-placeholder-info">
                            <span>💡 {t("guide_token_step3_img_info")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 4 */}
                  <div class="vertical-step-card">
                    <div class="step-index">4</div>
                    <div class="step-content">
                      <h3>{t("guide_token_step4_title")}</h3>
                      <p>{t("guide_token_step4_desc")}</p>

                      <div class="tutorial-image-container">
                        <div class="image-wrapper">
                          <img
                            src={step4Image}
                            alt="Copy and Paste Token"
                            class="tutorial-img"
                            onerror={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.src = heroImage;
                              img.style.opacity = "0.3";
                            }}
                          />
                          <div class="image-placeholder-info">
                            <span>💡 {t("guide_token_step4_img_info")}</span>
                          </div>
                        </div>

                        <div class="tip-banner">
                          <span class="tip-icon">⚠️</span>
                          <p>
                            <strong>{t("guide_token_important_note")}</strong>
                            {t("guide_token_note_desc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </Show>

            <Show when={activeTab() === GuideTab.Features}>
              {/* FEATURES TAB */}
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
                          <strong>{t("guide_feature1_how_to")}</strong>
                          {t("guide_feature1_how_to_desc")}
                        </li>
                        <li>
                          <strong>{t("guide_feature1_smart")}</strong>
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
                          <strong>{t("guide_feature2_how_to")}</strong>
                          {t("guide_feature2_how_to_desc")}
                        </li>
                        <li>
                          <strong>{t("guide_feature2_secure")}</strong>
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
                          <strong>{t("guide_feature3_export")}</strong>
                          {t("guide_feature3_export_desc")}
                        </li>
                        <li>
                          <strong>{t("guide_feature3_import")}</strong>
                          {t("guide_feature3_import_desc")}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </Show>

            <Show when={activeTab() === GuideTab.Faq}>
              {/* FAQ TAB */}
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
                </div>
              </section>
            </Show>
          </main>
        </div>
      </div>
    </Show>
  );
};

export default Guide;
