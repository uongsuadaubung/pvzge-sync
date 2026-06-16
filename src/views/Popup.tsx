import { type Component, createSignal, Match, onMount, Switch } from "solid-js";
import { t } from "@/shared/i18n.ts";
import { getActiveTab, getGameTabs, isGameUrl } from "@/shared/tabs.ts";
import { pingLocalGame } from "@/shared/localhost.ts";
import Main from "@/views/Main.tsx";
import Settings from "@/views/Settings.tsx";
import Notice from "@/views/Notice.tsx";
import History from "@/views/History.tsx";
import { appStore, appStoreActions } from "@/shared/store.ts";
import { View } from "@/shared/types.ts";

export const Popup: Component = () => {
  const [ready, setReady] = createSignal(false);
  const [warnMsg, setWarnMsg] = createSignal("");
  const [errorMsg] = createSignal("");
  const [localUrl, setLocalUrl] = createSignal("");

  const checkLocalPort = async () => {
    const port = appStore.localhostPort || "8080";
    const url = await pingLocalGame(port);
    if (url) {
      setLocalUrl(url);
    }
  };

  onMount(async () => {
    await appStoreActions.init();

    const isTabMode =
      new URLSearchParams(window.location.search).get("mode") === "tab";
    if (isTabMode) {
      document.body.classList.add("tab-mode");
      const tabs = await getGameTabs();
      if (tabs.length === 0) {
        setWarnMsg(t("not_game_page_body"));
        checkLocalPort(); // Gọi ngầm không chặn UI
      }
      setReady(true);
      return;
    }

    const activeTab = await getActiveTab();
    const port = appStore.localhostPort || "8080";
    if (!activeTab?.url || !isGameUrl(activeTab.url, port)) {
      setWarnMsg(t("not_game_page_body"));
      checkLocalPort(); // Gọi ngầm không chặn UI
      setReady(true);
      return;
    }

    setReady(true);
  });

  return (
    <Switch>
      <Match when={!ready()}>
        {/* Empty or loading spinner during initialization */}
        <div style="display: flex; align-items: center; justify-content: center; min-height: 200px; color: var(--text-dim);">
          Loading...
        </div>
      </Match>
      <Match when={appStore.view === View.Settings}>
        <Settings />
      </Match>
      <Match when={appStore.view === View.History}>
        <History />
      </Match>
      <Match when={warnMsg() || errorMsg()}>
        <Notice
          warnMsg={warnMsg()}
          errorMsg={errorMsg()}
          localUrl={localUrl()}
        />
      </Match>
      <Match when={true}>
        <Main />
      </Match>
    </Switch>
  );
};

export default Popup;
