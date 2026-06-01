import {
  type Component,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { formatDateTime, isTranslationKey, t } from "@/shared/i18n.ts";
import { appStore, appStoreActions } from "@/shared/store.ts";
import {
  applyRemoteToGame,
  forceDownloadFromCloud,
  forceUploadToCloud,
  getLocalData,
  smartSync,
} from "@/domains/sync/sync.ts";
import { type SaveData, SaveDataSchema } from "@/domains/game/schema.ts";
import {
  type DialogConfig,
  type SyncStatusType,
  View,
} from "@/shared/types.ts";

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

  const [countdownText, setCountdownText] = createSignal("00:00");
  const [progressPercent, setProgressPercent] = createSignal(0);

  let timerId: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    async function updateTimer() {
      if (!appStore.autoSyncEnabled || appStore.autoSyncInterval <= 0) {
        return;
      }

      if (typeof chrome === "undefined" || !chrome.alarms) {
        const lastSync = appStore.lastSync || Date.now();
        const totalIntervalMs = appStore.autoSyncInterval * 60 * 1000;
        const elapsed = (Date.now() - lastSync) % totalIntervalMs;
        const remaining = Math.max(0, totalIntervalMs - elapsed);

        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setCountdownText(
          `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        );
        setProgressPercent((elapsed / totalIntervalMs) * 100);
        return;
      }

      try {
        const alarm = await chrome.alarms.get("auto-sync-alarm");
        if (alarm) {
          const now = Date.now();
          const scheduled = alarm.scheduledTime;
          const remaining = Math.max(0, scheduled - now);
          const totalIntervalMs = appStore.autoSyncInterval * 60 * 1000;

          const safeRemaining = Math.min(remaining, totalIntervalMs);
          const elapsed = totalIntervalMs - safeRemaining;

          const m = Math.floor(safeRemaining / 60000);
          const s = Math.floor((safeRemaining % 60000) / 1000);
          setCountdownText(
            `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
          );
          setProgressPercent((elapsed / totalIntervalMs) * 100);
        } else {
          setCountdownText("00:00");
          setProgressPercent(0);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin alarm:", err);
      }
    }

    updateTimer();
    timerId = setInterval(updateTimer, 1000);
  });

  onCleanup(() => {
    if (timerId) clearInterval(timerId);
  });

  const [dialogResolver, setDialogResolver] = createSignal<
    ((value: boolean) => void) | null
  >(null);
  const [dialogConfig, setDialogConfig] = createSignal<DialogConfig>({
    show: false,
    title: "",
    message: "",
    type: "alert",
    severity: "info",
  });

  const [localProfile, setLocalProfile] = createSignal<ProfileInfo | null>(
    null,
  );
  const [cloudProfile, setCloudProfile] = createSignal<ProfileInfo | null>(
    null,
  );

  function showAlert(
    message: string,
    severity: SyncStatusType = "info",
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
    return isTranslationKey(raw) ? t(raw) : raw;
  }

  function showConfirm(
    message: string,
    severity: SyncStatusType = "warning",
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
      await showAlert(t("msg_force_download_success"), "success");
    } catch (e: unknown) {
      await showAlert(getLocalizedError(e), "error");
    } finally {
      setLoading(false);
    }
  }

  const lastSyncMsg = createMemo(() =>
    appStore.lastSync
      ? t("last_sync") + formatDateTime(appStore.lastSync)
      : t("no_sync")
  );

  const localizedAutoSyncStatus = createMemo(() => {
    const status = appStore.autoSyncStatus;
    if (!status) return "";
    return isTranslationKey(status) ? t(status) : status;
  });

  function getProfileInfo(
    data: SaveData | null | undefined,
  ): ProfileInfo | null {
    const profile = data?.PvZ2_PlayerProperties?.[0];
    if (!profile) return null;
    return {
      name: profile.name || "Unknown",
      coin: profile.coin || 0,
      gem: profile.gem || 0,
      sprout: profile.sprout || 0,
    };
  }

  async function handleSync() {
    setLoading(true);
    try {
      const res = await smartSync();
      switch (res.type) {
        case "conflict": {
          setLocalProfile(getProfileInfo(res.localData));
          setCloudProfile(getProfileInfo(res.cloudData));
          setShowConflict(true);
          break;
        }
        case "synced": {
          const msgKey = res.detail === "upload"
            ? "msg_sync_success_upload"
            : "msg_sync_success_download";
          await showAlert(t(msgKey), "success");
          break;
        }
        case "no_action":
          await showAlert(t("msg_sync_no_changes"), "info");
          break;
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
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const file = target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text().catch((err) => {
        console.error("[Main] Failed to read imported file:", err);
        return null;
      });
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
                      appStoreActions.updateSettings({
                        autoCollectEnabled: !appStore.autoCollectEnabled,
                      });
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

                  <Show when={appStore.autoSyncEnabled}>
                    <div class="auto-sync-status">
                      <div class="auto-sync-info">
                        <span class="auto-sync-label">
                          ⏰ {t("next_sync_in")}
                        </span>
                        <span class="countdown-timer">{countdownText()}</span>
                      </div>
                      <div class="progress-bar-container">
                        <div
                          class="progress-bar-fill"
                          style={{ width: `${progressPercent()}%` }}
                        >
                        </div>
                      </div>
                      <Show when={localizedAutoSyncStatus()}>
                        <div
                          class={`auto-sync-status-msg ${
                            appStore.autoSyncStatusType || "info"
                          }`}
                        >
                          {localizedAutoSyncStatus()}
                        </div>
                      </Show>
                    </div>
                  </Show>

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
                        <Button
                          variant="outline"
                          fullWidth
                          onclick={() => appStoreActions.navigate(View.History)}
                          disabled={loading()}
                          class="force-btn"
                        >
                          {t("btn_history")}
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
