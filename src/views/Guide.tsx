import { type Component, createSignal, onMount, Show } from "solid-js";
import { SupportLanguage, t } from "@/shared/i18n.ts";
import { appStore, appStoreActions } from "@/shared/store.ts";
import Button from "@/components/Button.tsx";
import Select from "@/components/Select.tsx";
import GeneralTab from "@/components/guide/GeneralTab.tsx";
import TokenTab from "@/components/guide/TokenTab.tsx";
import FeaturesTab from "@/components/guide/FeaturesTab.tsx";
import FaqTab from "@/components/guide/FaqTab.tsx";
import PolicyTab from "@/components/guide/PolicyTab.tsx";
import DockerTab from "@/components/guide/DockerTab.tsx";

export const Guide: Component = () => {
  const GuideTab = {
    General: "general",
    Token: "token",
    Features: "features",
    Faq: "faq",
    Docker: "docker",
    Policy: "policy",
  } as const;

  type GuideTab = typeof GuideTab[keyof typeof GuideTab];

  const [activeTab, setActiveTab] = createSignal<GuideTab>(GuideTab.General);

  const langOptions = [
    { value: "en", label: "English" },
    { value: "vi", label: "Tiếng Việt" },
  ];

  onMount(async () => {
    // Add native guide body class for layout
    document.body.classList.add("guide-body-native");
    await appStoreActions.init();
  });

  function isSupportLanguage(val: string): val is SupportLanguage {
    return val === SupportLanguage.En || val === SupportLanguage.Vi;
  }

  async function handleLangChange(val: string) {
    if (isSupportLanguage(val)) {
      await appStoreActions.updateSettings({
        language: val,
      });
    }
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
              <Select
                value={appStore.language}
                options={langOptions}
                onchange={handleLangChange}
              />
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

              <button
                class={`nav-tab ${
                  activeTab() === GuideTab.Docker ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.Docker)}
              >
                <span class="tab-icon">🐳</span>
                <span class="tab-label">{t("guide_tab_docker")}</span>
              </button>

              <button
                class={`nav-tab ${
                  activeTab() === GuideTab.Policy ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.Policy)}
              >
                <span class="tab-icon">🛡️</span>
                <span class="tab-label">{t("guide_tab_policy")}</span>
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
              <GeneralTab />
            </Show>

            <Show when={activeTab() === GuideTab.Token}>
              <TokenTab />
            </Show>

            <Show when={activeTab() === GuideTab.Features}>
              <FeaturesTab />
            </Show>

            <Show when={activeTab() === GuideTab.Faq}>
              <FaqTab />
            </Show>

            <Show when={activeTab() === GuideTab.Docker}>
              <DockerTab />
            </Show>

            <Show when={activeTab() === GuideTab.Policy}>
              <PolicyTab />
            </Show>
          </main>
        </div>
      </div>
    </Show>
  );
};

export default Guide;
