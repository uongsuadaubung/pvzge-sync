<script lang="ts">
  import { t } from "@/shared/i18n.svelte";
  import { appStore } from "@/shared/store.svelte";
  import { View } from "@/shared/types";
  import Button from "@/components/Button.svelte";

  interface Props {
    title?: string;
    showBack?: boolean;
    showSettings?: boolean;
    showLogo?: boolean;
    showUser?: boolean;
    subtitle?: string;
  }

  let { 
    title = t("app_name"), 
    showBack = false, 
    showSettings = false, 
    showLogo = false,
    showUser = true,
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

  {#if appStore.githubUser && showLogo && showUser}
    <div class="header-user">
      <div class="user-pill" title={appStore.githubUser.login}>
        <img src={appStore.githubUser.avatar_url} alt={appStore.githubUser.login} />
        <span>{appStore.githubUser.login}</span>
      </div>
    </div>
  {/if}

  {#if showSettings}
    <div class="header-actions">
      <Button variant="settings" onclick={() => chrome.tabs.create({ url: chrome.runtime.getURL("guide.html") })} title={t("guide_title")}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </Button>
      <Button variant="settings" onclick={() => appStore.navigate(View.Settings)} title={t("settings_title")}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869L9.594 3.94z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Button>
    </div>
  {/if}
</header>

<style lang="scss">
  header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    position: relative;
    min-width: 0;

    @media (max-width: 480px) {
      gap: 6px;
      margin-bottom: 16px;
    }

    .logo-wrapper {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      padding: 6px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px var(--glow-primary);
      flex-shrink: 0;
      transition: all 0.2s ease;

      .logo {
        width: 26px;
        height: 26px;
        transition: all 0.2s ease;
      }

      @media (max-width: 480px) {
        padding: 5px;
        border-radius: 10px;

        .logo {
          width: 22px;
          height: 22px;
        }
      }
    }

    .header-text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;

      h1 {
        font-size: 1.15rem;
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.3px;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: font-size 0.2s ease;

        @media (max-width: 480px) {
          font-size: 1.02rem;
        }
      }
      small {
        color: var(--text-dim);
        font-size: 0.72rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 1px;
        opacity: 0.85;

        @media (max-width: 480px) {
          font-size: 0.68rem;
        }
      }
    }

    .header-user {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      .user-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--surface-light);
        padding: 4px 8px 4px 4px;
        border-radius: 20px;
        border: 1px solid var(--border);
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--text);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        img {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid var(--primary-dark);
          transition: all 0.25s ease;
        }

        span {
          transition: opacity 0.2s ease, max-width 0.2s ease;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          padding: 3px;
          border-radius: 50%;
          background: transparent;
          border-color: transparent;

          img {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          span {
            display: none;
          }

          &:hover {
            background: var(--surface-light);
            border-color: var(--primary-dark);

            img {
              border-color: var(--primary);
              box-shadow: 0 0 10px var(--glow-primary);
            }
          }
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;

      :global(.btn.settings) {
        background: transparent;
        padding: 6px;
        border-radius: 8px;
        color: var(--text-dim);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          color: var(--primary);
          background: var(--surface-light);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

          :global(svg) {
            transform: rotate(30deg);
          }
        }

        :global(svg) {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        @media (max-width: 480px) {
          width: 28px;
          height: 28px;
          padding: 5px;

          :global(svg) {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }
</style>
