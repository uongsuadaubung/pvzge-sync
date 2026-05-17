<script lang="ts">
  import { t } from "@/shared/i18n.svelte";
  import { appStore } from "@/shared/store.svelte";
  import { View } from "@/shared/types";
  import Button from "./Button.svelte";

  interface Props {
    title?: string;
    showBack?: boolean;
    showSettings?: boolean;
    showLogo?: boolean;
    subtitle?: string;
  }

  let { 
    title = t("app_name"), 
    showBack = false, 
    showSettings = false, 
    showLogo = false,
    subtitle = ""
  }: Props = $props();
</script>

<header>
  {#if showBack}
    <Button variant="back" onclick={() => appStore.navigate(View.Main)} aria-label={t("btn_go_back")}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
        <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
      </svg>
    </Button>
  {/if}

  {#if showLogo}
    <div class="logo-wrapper">
      <img src="icons/icon48.png" alt="Logo" class="logo" />
    </div>
  {/if}

  <div class="header-text">
    <h1>{title}</h1>
    {#if subtitle}
      <small>{subtitle}</small>
    {/if}
  </div>

  {#if appStore.githubUser && showLogo}
    <div class="header-user">
      <div class="user-pill">
        <img src={appStore.githubUser.avatar_url} alt="User Avatar" />
        <span>{appStore.githubUser.login}</span>
      </div>
    </div>
  {/if}

  {#if showSettings}
    <div class="header-actions">
      <Button variant="settings" onclick={() => chrome.tabs.create({ url: chrome.runtime.getURL("guide.html") })} title={t("guide_title")}>
        ❓
      </Button>
      <Button variant="settings" onclick={() => appStore.navigate(View.Settings)} title={t("settings_title")}>
        ⚙️
      </Button>
    </div>
  {/if}
</header>

<style lang="scss">
  .header-actions {
    display: flex;
    gap: 8px;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    position: relative;

    .logo-wrapper {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      padding: 6px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px var(--glow-primary);

      .logo {
        width: 28px;
        height: 28px;
      }
    }

    .header-text {
      flex: 1;
      h1 {
        font-size: 1.15rem;
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.3px;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      small {
        color: var(--text-dim);
        font-size: 0.75rem;
      }
    }

    .header-user {
      display: flex;
      align-items: center;
      margin-left: auto;

      .user-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--surface-light);
        padding: 4px 10px 4px 4px;
        border-radius: 20px;
        border: 1px solid var(--border);
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text);

        img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid var(--primary-dark);
        }
      }
    }
  }
</style>
