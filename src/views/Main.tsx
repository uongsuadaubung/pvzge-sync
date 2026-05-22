import { type Component, createMemo, createSignal, Show } from "solid-js";
import { t, type TranslationKey } from "@/shared/i18n.ts";
import { appStore, appStoreActions, setAppStore } from "@/shared/store.ts";
import { setLastSync } from "@/shared/storage.ts";
import {
  applyRemoteToGame,
  forceDownloadFromCloud,
  forceUploadToCloud,
  getLocalData,
  smartSync,
} from "@/domains/sync/sync.ts";
import { SaveDataSchema } from "@/domains/game/schema.ts";

import Header from "@/components/Header.tsx";
import Button from "@/components/Button.tsx";
import SyncConflict from "@/components/SyncConflict.tsx";
import Dialog from "@/components/Dialog.tsx";

interface ProfileInfo {
  name: string;
  coin: number;
  gem: number;
  sprout: number;
}

export const Main: Component = () => {
  let fileInput!: HTMLInputElement;
  let downloadAnchor!: HTMLAnchorElement;

  const [loading, setLoading] = createSignal(false);
  const [showAdvanced, setShowAdvanced] = createSignal(false);
  const [showConflict, setShowConflict] = createSignal(false);

  const [dialogResolver, setDialogResolver] = createSignal<
    ((value: boolean) => void) | null
  >(null);
  const [dialogConfig, setDialogConfig] = createSignal({
    show: false,
    title: "",
    message: "",
    type: "alert" as "alert" | "confirm",
    severity: "info" as "info" | "success" | "warning" | "error",
  });

  const [localProfile, setLocalProfile] = createSignal<ProfileInfo | null>(
    null,
  );
  const [cloudProfile, setCloudProfile] = createSignal<ProfileInfo | null>(
    null,
  );

  function showAlert(
    message: string,
    severity: "info" | "success" | "warning" | "error" = "info",
    title?: string,
  ): Promise<void> {
    return new Promise((resolve) => {
      let defaultTitle = t("dialog_title_info");
      if (severity === "error") defaultTitle = t("dialog_title_error");
      if (severity === "success") defaultTitle = t("dialog_title_success");
      if (severity === "warning") defaultTitle = t("dialog_title_warning");

      setDialogConfig({
        show: true,
        title: title || defaultTitle,
        message,
        type: "alert",
        severity,
      });
      setDialogResolver(() => () => {
        setDialogConfig((prev) => ({ ...prev, show: false }));
        resolve();
      });
    });
  }

  function getLocalizedError(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e);
    return t(raw as TranslationKey);
  }

  function showConfirm(
    message: string,
    severity: "info" | "success" | "warning" | "error" = "warning",
    title?: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      setDialogConfig({
        show: true,
        title: title || t("dialog_title_warning"),
        message,
        type: "confirm",
        severity,
      });
      setDialogResolver(() => (result: boolean) => {
        setDialogConfig((prev) => ({ ...prev, show: false }));
        resolve(result);
      });
    });
  }

  async function handleForceUpload() {
    if (!await showConfirm(t("msg_force_upload_confirm"), "warning")) return;
    setLoading(true);
    try {
      await forceUploadToCloud();
      await setLastSync();
      setAppStore("lastSync", Date.now());
      await showAlert(t("msg_force_upload_success"), "success");
    } catch (e: unknown) {
      await showAlert(getLocalizedError(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleForceDownload() {
    if (!await showConfirm(t("msg_force_download_confirm"), "warning")) return;
    setLoading(true);
    try {
      await forceDownloadFromCloud();
      await setLastSync();
      setAppStore("lastSync", Date.now());
      await showAlert(t("msg_force_download_success"), "success");
    } catch (e: unknown) {
      await showAlert(getLocalizedError(e), "error");
    } finally {
      setLoading(false);
    }
  }

  const lastSyncMsg = createMemo(() =>
    appStore.lastSync
      ? t("last_sync") + new Date(appStore.lastSync).toLocaleString()
      : t("no_sync")
  );

  async function handleSync() {
    setLoading(true);
    try {
      const res = await smartSync();
      if (res.type === "conflict") {
        const local = res.localData;
        const cloud = res.cloudData;

        if (local && local.PvZ2_PlayerProperties?.[0]) {
          const lp = local.PvZ2_PlayerProperties[0];
          setLocalProfile({
            name: lp.name || "Unknown",
            coin: lp.coin || 0,
            gem: lp.gem || 0,
            sprout: lp.sprout || 0,
          });
        } else {
          setLocalProfile(null);
        }

        if (cloud && cloud.PvZ2_PlayerProperties?.[0]) {
          const cp = cloud.PvZ2_PlayerProperties[0];
          setCloudProfile({
            name: cp.name || "Unknown",
            coin: cp.coin || 0,
            gem: cp.gem || 0,
            sprout: cp.sprout || 0,
          });
        } else {
          setCloudProfile(null);
        }

        setShowConflict(true);
      } else if (res.type === "synced") {
        await setLastSync();
        setAppStore("lastSync", Date.now());
        if (res.detail === "upload") {
          await showAlert(t("msg_sync_success_upload"), "success");
        } else if (res.detail === "download") {
          await showAlert(t("msg_sync_success_download"), "success");
        }
      } else if (res.type === "no_action") {
        await showAlert(t("msg_sync_no_changes"), "info");
      }
    } catch (e: unknown) {
      await showAlert(getLocalizedError(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleChooseLocal() {
    if (!await showConfirm(t("msg_force_upload_confirm"), "warning")) return;
    setLoading(true);
    try {
      await forceUploadToCloud();
      await setLastSync();
      setAppStore("lastSync", Date.now());
      setShowConflict(false);
      await showAlert(t("msg_force_upload_success"), "success");
    } catch (e: unknown) {
      await showAlert(getLocalizedError(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleChooseCloud() {
    if (!await showConfirm(t("msg_force_download_confirm"), "warning")) return;
    setLoading(true);
    try {
      await forceDownloadFromCloud();
      await setLastSync();
      setAppStore("lastSync", Date.now());
      setShowConflict(false);
      await showAlert(t("msg_force_download_success"), "success");
    } catch (e: unknown) {
      await showAlert(getLocalizedError(e), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setLoading(true);
    try {
      const data = await getLocalData().catch(async (e: unknown) => {
        await showAlert(getLocalizedError(e), "error");
        return null;
      });
      if (!data) return;
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      downloadAnchor.href = url;
      downloadAnchor.download = "pvzge_save_" +
        new Date().toISOString().slice(0, 10) + ".json";
      downloadAnchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      await showAlert(t("msg_export_success"), "success");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text().catch(() => null);
      if (!text) {
        return;
      }
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        await showAlert(t("msg_invalid_json"), "error");
        return;
      }
      const parseResult = SaveDataSchema.safeParse(raw);
      if (!parseResult.success) {
        await showAlert(t("msg_invalid_json"), "error");
        return;
      }
      await applyRemoteToGame(parseResult.data);
      await setLastSync();
      setAppStore("lastSync", Date.now());
      await showAlert(t("msg_import_success"), "success");
      if (isTabMode()) {
        window.close();
      }
    } finally {
      setLoading(false);
    }
  }

  const isTabMode = createMemo(() =>
    new URLSearchParams(window.location.search).get("mode") === "tab"
  );

  const isFirefoxPopup = createMemo(() =>
    navigator.userAgent.toLowerCase().includes("firefox") && !isTabMode()
  );

  async function handleOpenBackupManager() {
    if (typeof chrome !== "undefined" && chrome.windows) {
      await chrome.windows.create({
        url: chrome.runtime.getURL("popup.html?mode=tab"),
        type: "popup",
        width: 480,
        height: 320,
      });
      window.close();
    }
  }

  return (
    <div class="container">
      <Header
        showLogo
        showSettings={!isTabMode()}
        showUser={!isTabMode()}
        subtitle={isTabMode() ? "" : (lastSyncMsg() || t("no_sync"))}
      />

      <Show
        when={showConflict()}
        fallback={
          <main>
            <Show when={!isTabMode()}>
              <div class="group-label">
                <span>{t("group_tools")}</span>
                <div class="line"></div>
              </div>

              <section class="action-section auto-collect">
                <div class="section-header">
                  <span class="section-icon">☀️</span>
                  <h3>{t("auto_collect")}</h3>
                </div>
                <div class="button-group">
                  <Button
                    variant={appStore.autoCollectEnabled ? "danger" : "primary"}
                    fullWidth
                    onclick={() => {
                      appStoreActions.updateSettings(
                        appStore.githubToken,
                        appStore.language,
                        appStore.autoSyncEnabled,
                        appStore.autoSyncInterval,
                        !appStore.autoCollectEnabled,
                      );
                    }}
                  >
                    {appStore.autoCollectEnabled
                      ? t("btn_auto_collect_off")
                      : t("btn_auto_collect_on")}
                  </Button>
                </div>
              </section>
            </Show>

            <Show when={!isTabMode()}>
              <div class="group-label">
                <span>{t("group_sync")}</span>
                <div class="line"></div>
              </div>

              <Show when={appStore.githubConnected}>
                <section class="action-section cloud">
                  <div class="section-header">
                    <span class="section-icon">☁️</span>
                    <h3>{t("cloud_sync")}</h3>
                  </div>
                  <div class="button-group">
                    <Button
                      fullWidth
                      onclick={handleSync}
                      disabled={loading()}
                    >
                      {t("btn_sync")}
                    </Button>
                  </div>

                  <div class="advanced-wrapper">
                    <button
                      type="button"
                      class="advanced-toggle"
                      onclick={() => setShowAdvanced(!showAdvanced())}
                      aria-expanded={showAdvanced()}
                    >
                      <span>{t("advanced_title")}</span>
                      <span
                        class={`arrow-icon ${showAdvanced() ? "open" : ""}`}
                      >
                        ▼
                      </span>
                    </button>

                    <Show when={showAdvanced()}>
                      <div class="advanced-content">
                        <Button
                          variant="outline"
                          fullWidth
                          onclick={handleForceUpload}
                          disabled={loading()}
                          class="force-btn force-upload"
                        >
                          {t("btn_force_upload")}
                        </Button>
                        <Button
                          variant="outline"
                          fullWidth
                          onclick={handleForceDownload}
                          disabled={loading()}
                          class="force-btn force-download"
                        >
                          {t("btn_force_download")}
                        </Button>
                      </div>
                    </Show>
                  </div>
                </section>
              </Show>
            </Show>

            <section class="action-section local">
              <div class="section-header">
                <span class="section-icon">💾</span>
                <h3>{t("offline_backup")}</h3>
              </div>
              <div class="button-grid">
                <Show
                  when={isFirefoxPopup()}
                  fallback={
                    <>
                      <Button
                        variant="outline"
                        onclick={handleExport}
                        disabled={loading()}
                      >
                        {t("btn_export")}
                      </Button>
                      <Button
                        variant="outline"
                        onclick={() => fileInput.click()}
                        disabled={loading()}
                      >
                        {t("btn_import")}
                      </Button>
                    </>
                  }
                >
                  <Button
                    variant="outline"
                    onclick={handleOpenBackupManager}
                    style="grid-column: span 2;"
                  >
                    📁 {t("btn_manage_backup")}
                  </Button>
                </Show>
              </div>
            </section>

            <input
              type="file"
              ref={fileInput}
              style="display:none"
              accept=".json"
              onchange={handleFile}
            />
            <a
              ref={downloadAnchor}
              href={undefined}
              aria-hidden="true"
              style="display:none"
              tabindex="-1"
            >
            </a>
          </main>
        }
      >
        <SyncConflict
          localProfile={localProfile()}
          cloudProfile={cloudProfile()}
          loading={loading()}
          onChooseLocal={handleChooseLocal}
          onChooseCloud={handleChooseCloud}
          onCancel={() => {
            setShowConflict(false);
          }}
        />
      </Show>

      <Dialog
        show={dialogConfig().show}
        title={dialogConfig().title}
        message={dialogConfig().message}
        type={dialogConfig().type}
        severity={dialogConfig().severity}
        onConfirm={(res) => {
          if (dialogResolver()) dialogResolver()!(res);
        }}
      />
    </div>
  );
};

export default Main;
