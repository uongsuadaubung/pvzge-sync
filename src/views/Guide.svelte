<script lang="ts">
  import { onMount } from "svelte";
  import { t, SupportLanguage } from "@/shared/i18n.svelte";
  import { appStore } from "@/shared/store.svelte";
  import Button from "@/components/Button.svelte";

  // Assets
  const heroImage = chrome.runtime.getURL("images/guide_hero.png");
  const step1Image = chrome.runtime.getURL("images/1.select exprire time.png");
  const step2Image = chrome.runtime.getURL("images/2.make sure selected gist.png");
  const step3Image = chrome.runtime.getURL("images/3.create generate button.png");
  const step4Image = chrome.runtime.getURL("images/4.copy and save token.png");

  const GuideTab = {
    General: "general",
    Token: "token",
    Features: "features",
    Faq: "faq",
  } as const;

  type GuideTab = typeof GuideTab[keyof typeof GuideTab];

  let activeTab = $state<GuideTab>(GuideTab.General);

  onMount(async () => {
    await appStore.init();
  });

  async function handleLangChange(e: Event) {
    const lang = (e.target as HTMLSelectElement).value as SupportLanguage;
    await appStore.updateSettings(
      appStore.githubToken,
      lang,
      appStore.autoSyncEnabled,
      appStore.autoSyncInterval,
      appStore.autoCollectEnabled,
    );
  }
</script>

{#if appStore.isLoaded}
  <div class="guide-wrapper">
    <!-- Top Navigation Bar -->
    <header class="guide-header">
      <div class="logo-area">
        <img src="icons/icon48.png" alt="PvZGE Sync Logo" class="logo" />
        <div class="brand">
          <h1>PVZGE Sync</h1>
          <span class="badge">v{chrome.runtime.getManifest().version}</span>
        </div>
      </div>

      <div class="header-controls">
        <!-- Quick Language Switcher -->
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

    <!-- Main Grid Layout -->
    <div class="guide-container">
      <!-- Sidebar Navigation -->
      <aside class="guide-sidebar">
        <nav class="tabs-nav">
          <button
            class="nav-tab {activeTab === GuideTab.General ? 'active' : ''}"
            onclick={() => (activeTab = GuideTab.General)}
          >
            <span class="tab-icon">📖</span>
            <span class="tab-label"
              >{t("guide_tab_general")}</span
            >
          </button>

          <button
            class="nav-tab {activeTab === GuideTab.Token ? 'active' : ''}"
            onclick={() => (activeTab = GuideTab.Token)}
          >
            <span class="tab-icon">🔑</span>
            <span class="tab-label"
              >{t("guide_tab_token")}</span
            >
          </button>

          <button
            class="nav-tab {activeTab === GuideTab.Features ? 'active' : ''}"
            onclick={() => (activeTab = GuideTab.Features)}
          >
            <span class="tab-icon">⚡</span>
            <span class="tab-label"
              >{t("guide_tab_features")}</span
            >
          </button>

          <button
            class="nav-tab {activeTab === GuideTab.Faq ? 'active' : ''}"
            onclick={() => (activeTab = GuideTab.Faq)}
          >
            <span class="tab-icon">💡</span>
            <span class="tab-label"
              >{t("guide_tab_faq")}</span
            >
          </button>
        </nav>

        <!-- Quick Action Card -->
        <div class="quick-action-card">
          <h3>PvZGE Web</h3>
          <p>
            {t("guide_quick_action_desc")}
          </p>
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

      <!-- Main Content Area -->
      <main class="guide-main-content">
        {#if activeTab === GuideTab.General}
          <!-- GENERAL TAB -->
          <section class="tab-panel fade-in">
            <div class="hero-section">
              <img src={heroImage} alt="Guide Hero" class="hero-img" />
              <div class="hero-overlay">
                <h2>
                  {t("guide_welcome")}
                </h2>
                <p>
                  {t("guide_subtitle")}
                </p>
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
                  <p>
                    {t("guide_step1_desc")}
                  </p>
                </div>
              </section>

              <section class="guide-step">
                <div class="step-badge">
                  <span class="step-num">02</span>
                </div>
                <div class="step-text">
                  <h3>{t("guide_step2_title")}</h3>
                  <p>
                    {t("guide_step2_desc")}
                  </p>
                </div>
              </section>

              <section class="guide-step">
                <div class="step-badge">
                  <span class="step-num">03</span>
                </div>
                <div class="step-text">
                  <h3>{t("guide_step3_title")}</h3>
                  <p>
                    {t("guide_step3_desc")}
                  </p>
                </div>
              </section>
            </div>
          </section>
        {:else if activeTab === GuideTab.Token}
          <!-- TOKEN TAB -->
          <section class="tab-panel fade-in">
            <div class="panel-header">
              <h2>
                🔑 {t("guide_token_title")}
              </h2>
              <p>
                {t("guide_token_desc")}
              </p>
            </div>

            <div class="steps-vertical">
              <!-- STEP 1 -->
              <div class="vertical-step-card">
                <div class="step-index">1</div>
                <div class="step-content">
                  <h3>
                    {t("guide_token_step1_title")}
                  </h3>
                  <p>
                    {t("guide_token_step1_desc")}
                  </p>
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
                        <span>
                          💡 {t("guide_token_step1_img_info")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 2 -->
              <div class="vertical-step-card">
                <div class="step-index">2</div>
                <div class="step-content">
                  <h3>
                    {t("guide_token_step2_title")}
                  </h3>
                  <p>
                    {t("guide_token_step2_desc")}
                  </p>

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
                        <span>
                          💡 {t("guide_token_step2_img_info")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 3 -->
              <div class="vertical-step-card">
                <div class="step-index">3</div>
                <div class="step-content">
                  <h3>
                    {t("guide_token_step3_title")}
                  </h3>
                  <p>
                    {t("guide_token_step3_desc")}
                  </p>

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
                        <span>
                          💡 {t("guide_token_step3_img_info")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 4 -->
              <div class="vertical-step-card">
                <div class="step-index">4</div>
                <div class="step-content">
                  <h3>
                    {t("guide_token_step4_title")}
                  </h3>
                  <p>
                    {t("guide_token_step4_desc")}
                  </p>

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
                        <span>
                          💡 {t("guide_token_step4_img_info")}
                        </span>
                      </div>
                    </div>

                    <div class="tip-banner">
                      <span class="tip-icon">⚠️</span>
                      <p>
                        <strong>
                          {t("guide_token_important_note")}
                        </strong>
                        {t("guide_token_note_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        {:else if activeTab === GuideTab.Features}
          <!-- FEATURES TAB -->
          <section class="tab-panel fade-in">
            <div class="panel-header">
              <h2>
                ⚡ {t("guide_features_title")}
              </h2>
              <p>
                {t("guide_features_desc")}
              </p>
            </div>

            <div class="features-detailed-grid">
              <!-- Feature 1: Tự động đồng bộ -->
              <div class="feature-detail-card">
                <div class="feature-icon-wrapper sync-icon-bg">🔄</div>
                <div class="feature-content">
                  <h3>
                    {t("guide_feature1_title")}
                  </h3>
                  <p>
                    {t("guide_feature1_desc")}
                  </p>
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

              <!-- Feature 2: Tự động nhặt -->
              <div class="feature-detail-card">
                <div class="feature-icon-wrapper collect-icon-bg">☀️</div>
                <div class="feature-content">
                  <h3>
                    {t("guide_feature2_title")}
                  </h3>
                  <p>
                    {t("guide_feature2_desc")}
                  </p>
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

              <!-- Feature 3: Nhập/Xuất JSON Offline -->
              <div class="feature-detail-card">
                <div class="feature-icon-wrapper offline-icon-bg">💾</div>
                <div class="feature-content">
                  <h3>
                    {t("guide_feature3_title")}
                  </h3>
                  <p>
                    {t("guide_feature3_desc")}
                  </p>
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
        {:else if activeTab === GuideTab.Faq}
          <!-- FAQ TAB -->
          <section class="tab-panel fade-in">
            <div class="panel-header">
              <h2>
                💡 {t("guide_faq_title")}
              </h2>
              <p>
                {t("guide_faq_desc")}
              </p>
            </div>

            <div class="faq-grid">
              <div class="faq-card">
                <h4>
                  ❓ {t("guide_faq1_q")}
                </h4>
                <p>
                  {t("guide_faq1_a")}
                </p>
              </div>

              <div class="faq-card">
                <h4>
                  ❓ {t("guide_faq2_q")}
                </h4>
                <p>
                  {t("guide_faq2_a")}
                </p>
              </div>

              <div class="faq-card">
                <h4>
                  ❓ {t("guide_faq3_q")}
                </h4>
                <p>
                  {t("guide_faq3_a")}
                </p>
              </div>

              <div class="faq-card text-highlight">
                <h4>
                  🌟 {t("guide_faq4_q")}
                </h4>
                <p>
                  {t("guide_faq4_a")}
                </p>
              </div>
            </div>
          </section>
        {/if}
      </main>
    </div>
  </div>
{/if}

<style lang="scss">
  /* Global page-wide reset and adjustments */
  :global(body) {
    min-width: unset !important;
    min-height: unset !important;
    max-width: unset !important;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    margin: 0;
  }

  .guide-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    color: var(--text);
    box-sizing: border-box;
  }

  /* ─── Header Styling ──────────────────────────────── */
  .guide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 32px;
    background: var(--surface);
    border-bottom: 2px solid var(--border);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    z-index: 10;

    .logo-area {
      display: flex;
      align-items: center;
      gap: 16px;

      .logo {
        width: 42px;
        height: 42px;
        filter: drop-shadow(0 2px 8px var(--glow-primary));
        transition: transform 0.3s;
        &:hover {
          transform: rotate(15deg) scale(1.05);
        }
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 8px;

        h1 {
          margin: 0;
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .badge {
          font-size: 0.72rem;
          padding: 2px 6px;
          background: var(--surface-light);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-dim);
          font-family: monospace;
        }
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 20px;

      .lang-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--surface-light);
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid var(--border);

        span {
          font-size: 0.9rem;
        }

        select {
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;

          option {
            background: var(--surface);
            color: var(--text);
          }
        }
      }
    }
  }

  /* ─── Grid Container Layout ────────────────────────── */
  .guide-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    flex: 1;
    overflow: hidden;
    background: var(--bg);
  }

  /* ─── Sidebar Styling ────────────────────────────── */
  .guide-sidebar {
    background: linear-gradient(
      180deg,
      var(--surface) 0%,
      rgba(26, 15, 5, 0.95) 100%
    );
    border-right: 2px solid var(--border);
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;

    .tabs-nav {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .nav-tab {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 12px;
        color: var(--text-dim);
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          color: var(--text);
          background: rgba(var(--primary-rgb), 0.05);
          border-color: rgba(var(--primary-rgb), 0.15);
          transform: translateX(4px);
        }

        &.active {
          color: var(--bg);
          background: linear-gradient(
            135deg,
            var(--primary),
            var(--primary-dark)
          );
          border-color: var(--primary-dark);
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
          transform: translateX(6px);

          .tab-icon {
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          }
        }

        .tab-icon {
          font-size: 1.25rem;
        }

        .tab-label {
          line-height: 1;
        }
      }
    }

    .quick-action-card {
      margin-top: 40px;
      background: var(--surface-light);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px;
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);

      h3 {
        margin: 0 0 8px;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--primary);
      }

      p {
        margin: 0 0 16px;
        font-size: 0.78rem;
        color: var(--text-dim);
        line-height: 1.5;
      }

      .game-btn {
        display: block;
        text-align: center;
        background: linear-gradient(
          135deg,
          var(--secondary),
          var(--secondary-dark)
        );
        color: var(--bg) !important;
        font-weight: 700;
        font-size: 0.85rem;
        padding: 10px;
        border-radius: 10px;
        text-decoration: none;
        box-shadow: 0 4px 10px rgba(var(--secondary-rgb), 0.2);
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(var(--secondary-rgb), 0.3);
        }
      }
    }
  }

  /* ─── Main Content Styling ───────────────────────── */
  .guide-main-content {
    padding: 32px 40px;
    overflow-y: auto;
    background-image: radial-gradient(
        circle at 80% 20%,
        rgba(var(--primary-rgb), 0.03) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 20% 80%,
        rgba(var(--secondary-rgb), 0.03) 0%,
        transparent 50%
      );
  }

  .tab-panel {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Fade-in Animation */
  .fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ─── Hero Section ────────────────────────────────── */
  .hero-section {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 21/9;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border);
    margin-bottom: 32px;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.005);
      border-color: rgba(var(--primary-rgb), 0.3);
    }

    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 30px 40px;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.9) 0%,
        rgba(0, 0, 0, 0.4) 60%,
        transparent 100%
      );
      color: white;

      h2 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 700;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        font-family: "Fredoka", sans-serif;
      }

      p {
        margin: 8px 0 0;
        font-size: 0.95rem;
        opacity: 0.9;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      }
    }
  }

  /* ─── Section Dividers ────────────────────────────── */
  .section-title {
    margin: 32px 0 24px;
    h2 {
      margin: 0 0 8px;
      font-size: 1.3rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--primary);
    }
    .divider {
      height: 3px;
      width: 60px;
      background: var(--primary);
      border-radius: 2px;
    }
  }

  /* ─── General Tabs Steps Grid ──────────────────────── */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 16px;
  }

  .guide-step {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 24px;
    display: flex;
    gap: 20px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
      box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.15);
    }

    .step-badge {
      display: flex;
      align-items: flex-start;
      margin-top: 2px;

      .step-num {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--primary);
        opacity: 0.8;
        font-family: "Fredoka", sans-serif;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }

    .step-text {
      h3 {
        margin: 0 0 8px;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
      }

      p {
        margin: 0;
        font-size: 0.88rem;
        color: var(--text-dim);
        line-height: 1.6;
      }
    }
  }

  /* ─── Token Setup Tab ──────────────────────────────── */
  .panel-header {
    margin-bottom: 32px;
    h2 {
      margin: 0 0 10px;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      font-family: "Fredoka", sans-serif;
    }
    p {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-dim);
      line-height: 1.6;
    }
  }

  .steps-vertical {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .vertical-step-card {
    display: flex;
    gap: 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    position: relative;

    .step-index {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 800;
      font-family: "Fredoka", sans-serif;
      box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.4);
      flex-shrink: 0;
    }

    .step-content {
      flex: 1;

      h3 {
        margin: 0 0 12px;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text);
      }

      p {
        margin: 0 0 16px;
        font-size: 0.9rem;
        color: var(--text-dim);
        line-height: 1.6;

        strong {
          color: var(--primary);
        }
      }

      .action-link-btn {
        display: inline-block;
        background: linear-gradient(
          135deg,
          var(--primary),
          var(--primary-dark)
        );
        color: var(--bg) !important;
        font-weight: 700;
        font-size: 0.9rem;
        padding: 10px 20px;
        border-radius: 10px;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.35);
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.5);
        }
      }
    }
  }

  /* Premium Image Wrapper for large tutorial screenshots */
  .tutorial-image-container {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .image-wrapper {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid var(--border);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      background: #0d0702;
      transition: border-color 0.3s;

      &:hover {
        border-color: var(--primary);
      }

      .tutorial-img {
        display: block;
        width: 100%;
        max-height: 500px;
        object-fit: contain;
        transition: transform 0.3s;
        margin: 0 auto;

        &:hover {
          transform: scale(1.02);
        }
      }

      .image-placeholder-info {
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.7);
        border-top: 1px solid var(--border);
        text-align: center;
        font-size: 0.75rem;
        color: var(--text-dim);
      }
    }

    .tip-banner {
      display: flex;
      gap: 14px;
      align-items: center;
      background: rgba(var(--error-rgb), 0.1);
      border: 1px solid rgba(var(--error-rgb), 0.3);
      padding: 16px 20px;
      border-radius: 12px;
      color: var(--text);

      .tip-icon {
        font-size: 1.5rem;
      }

      p {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.5;
        color: var(--text-dim);

        strong {
          color: var(--error);
        }
      }
    }
  }

  /* ─── Core Features Tab Styling ────────────────────── */
  .features-detailed-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 16px;
  }

  .feature-detail-card {
    display: flex;
    gap: 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary);
      box-shadow: 0 8px 30px rgba(var(--primary-rgb), 0.15);
      transform: translateY(-2px);
    }

    .feature-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

      &.sync-icon-bg {
        background: rgba(var(--primary-rgb), 0.15);
        border: 1px solid rgba(var(--primary-rgb), 0.3);
        color: var(--primary);
      }

      &.collect-icon-bg {
        background: rgba(var(--secondary-rgb), 0.15);
        border: 1px solid rgba(var(--secondary-rgb), 0.3);
        color: var(--secondary);
      }

      &.offline-icon-bg {
        background: rgba(255, 140, 0, 0.15); /* orange accent */
        border: 1px solid rgba(255, 140, 0, 0.3);
        color: var(--accent);
      }
    }

    .feature-content {
      flex: 1;

      h3 {
        margin: 0 0 12px;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text);
      }

      p {
        margin: 0 0 16px;
        font-size: 0.9rem;
        color: var(--text-dim);
        line-height: 1.6;
      }

      .feature-bullets {
        margin: 0;
        padding-left: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        li {
          font-size: 0.88rem;
          color: var(--text-dim);
          line-height: 1.5;

          strong {
            color: var(--primary);
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .feature-detail-card {
      flex-direction: column;
      gap: 16px;
      padding: 20px;

      .feature-icon-wrapper {
        width: 50px;
        height: 50px;
        font-size: 1.6rem;
      }
    }
  }

  /* ─── FAQ Tab Styling ──────────────────────────────── */
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 16px;
  }

  .faq-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(var(--secondary-rgb), 0.3);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }

    &.text-highlight {
      border-color: rgba(var(--primary-rgb), 0.4);
      background: linear-gradient(
        135deg,
        var(--surface) 0%,
        rgba(var(--primary-rgb), 0.03) 100%
      );

      h4 {
        color: var(--primary);
      }
    }

    h4 {
      margin: 0 0 10px;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text);
    }

    p {
      margin: 0;
      font-size: 0.88rem;
      color: var(--text-dim);
      line-height: 1.6;
    }
  }

  /* ─── Responsive Adjustments ──────────────────────── */
  @media (max-width: 900px) {
    .guide-container {
      grid-template-columns: 1fr;
    }

    .guide-sidebar {
      border-right: none;
      border-bottom: 2px solid var(--border);
      padding: 16px;
      flex-direction: row;
      justify-content: flex-start;
      gap: 12px;
      overflow-x: auto;
      white-space: nowrap;

      .tabs-nav {
        flex-direction: row;
        gap: 8px;

        .nav-tab {
          padding: 10px 14px;
          font-size: 0.85rem;
          &.active {
            transform: translateY(0);
          }
        }
      }

      .quick-action-card {
        display: none;
      }
    }

    .guide-main-content {
      padding: 24px 20px;
    }

    .hero-section .hero-overlay {
      padding: 20px;
      h2 {
        font-size: 1.4rem;
      }
      p {
        font-size: 0.85rem;
      }
    }
  }
</style>
