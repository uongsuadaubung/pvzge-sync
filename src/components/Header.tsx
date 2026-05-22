import { t } from "@/shared/i18n.ts";
import { appStore, appStoreActions } from "@/shared/store.ts";
import { View } from "@/shared/types.ts";
import Button from "@/components/Button.tsx";

interface Props {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  showLogo?: boolean;
  showUser?: boolean;
  subtitle?: string;
}

export default function Header(props: Props) {
  const getTitle = () =>
    props.title !== undefined ? props.title : t("app_name");
  const getShowUser = () =>
    props.showUser !== undefined ? props.showUser : true;

  return (
    <header>
      {props.showBack && (
        <Button
          variant="back"
          onclick={() => appStoreActions.navigate(View.Main)}
          aria-label={t("btn_go_back")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fill-rule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clip-rule="evenodd"
            />
          </svg>
        </Button>
      )}

      {props.showLogo && (
        <div class="logo-wrapper">
          <img src="icons/icon48.png" alt="Logo" class="logo" />
        </div>
      )}

      <div class="header-text">
        <h1>{getTitle()}</h1>
        {props.subtitle && <small>{props.subtitle}</small>}
      </div>

      {appStore.githubUser && props.showLogo && getShowUser() && (
        <div class="header-user">
          <div class="user-pill" title={appStore.githubUser.login}>
            <img
              src={appStore.githubUser.avatar_url}
              alt={appStore.githubUser.login}
            />
            <span>{appStore.githubUser.login}</span>
          </div>
        </div>
      )}

      {props.showSettings && (
        <div class="header-actions">
          <Button
            variant="settings"
            onclick={() =>
              chrome.tabs.create({ url: chrome.runtime.getURL("guide.html") })}
            title={t("guide_title")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </Button>
          <Button
            variant="settings"
            onclick={() => appStoreActions.navigate(View.Settings)}
            title={t("settings_title")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869L9.594 3.94z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>
        </div>
      )}
    </header>
  );
}
