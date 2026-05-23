import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { isTranslationKey, t } from "@/shared/i18n.ts";
import { type DialogConfig } from "@/shared/types.ts";
import Header from "@/components/Header.tsx";
import Button from "@/components/Button.tsx";
import Dialog from "@/components/Dialog.tsx";
import { fetchGistHistory, type HistoryItem } from "@/domains/github/api.ts";
import { restoreHistoryVersion } from "@/domains/sync/sync.ts";

export const History: Component = () => {
  const [loading, setLoading] = createSignal(true);
  const [restoring, setRestoring] = createSignal(false);
  const [historyItems, setHistoryItems] = createSignal<HistoryItem[]>([]);
  const [error, setError] = createSignal("");

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

  onMount(async () => {
    try {
      setLoading(true);
      setError("");
      const items = await fetchGistHistory();
      setHistoryItems(items);
    } catch (e: unknown) {
      console.error("[History] Failed to load history:", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  });

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

  async function handleRestore(item: HistoryItem) {
    if (!item.saveData) return;

    const confirm = await showConfirm(
      t("history_overwrite_confirm"),
      "warning",
    );
    if (!confirm) return;

    setRestoring(true);
    try {
      await restoreHistoryVersion(item.saveData);
      await showAlert(t("history_overwrite_success"), "success");
    } catch (e: unknown) {
      console.error("[History] Restore failed:", e);
      const errMsg = e instanceof Error ? e.message : String(e);
      const displayMsg = isTranslationKey(errMsg) ? t(errMsg) : errMsg;
      await showAlert(displayMsg, "error");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div class="container">
      <Header
        showBack
        title={t("history_title")}
      />

      <main style={{ "padding-bottom": "20px" }}>
        <Show
          when={!loading()}
          fallback={
            <div class="history-loading-container">
              <div class="spinner"></div>
              <p>{t("history_loading")}</p>
            </div>
          }
        >
          <Show when={error()}>
            <div class="history-empty-container">
              <span style={{ "font-size": "2rem" }}>⚠️</span>
              <p>{error()}</p>
            </div>
          </Show>

          <Show when={!error()}>
            <Show
              when={historyItems().length > 0}
              fallback={
                <div class="history-empty-container">
                  <span style={{ "font-size": "2rem" }}>📂</span>
                  <p>{t("history_empty")}</p>
                </div>
              }
            >
              <div class="history-list">
                <For each={historyItems()}>
                  {(item) => {
                    const profile = item.saveData?.PvZ2_PlayerProperties?.[0];
                    const profileName = profile?.name ?? "Unknown";
                    const coins = profile?.coin ?? 0;
                    const gems = profile?.gem ?? 0;
                    const sprouts = profile?.sprout ?? 0;
                    const plantCount = profile?.plantProps
                      ? Object.keys(profile.plantProps).length
                      : 0;

                    return (
                      <div class="history-card">
                        <div class="history-card-header">
                          <div class="history-time">
                            <span class="time-icon">🕒</span>
                            <span>
                              {new Date(item.committedAt).toLocaleString()}
                            </span>
                          </div>
                          <Show when={item.saveData}>
                            <span class="history-profile-name">
                              {profileName}
                            </span>
                          </Show>
                        </div>

                        <div class="history-card-body">
                          <Show
                            when={item.saveData}
                            fallback={
                              <div
                                style={{
                                  color: "var(--error)",
                                  "font-size": "0.75rem",
                                }}
                              >
                                {item.error || "Failed to load details"}
                              </div>
                            }
                          >
                            <div class="history-stats">
                              <div class="stat-pill">
                                <span class="pill-icon">🪙</span>
                                <span class="pill-label">
                                  {t("history_coins")}
                                </span>
                                <span>{coins.toLocaleString()}</span>
                              </div>
                              <div class="stat-pill">
                                <span class="pill-icon">💎</span>
                                <span class="pill-label">
                                  {t("history_gems")}
                                </span>
                                <span>{gems.toLocaleString()}</span>
                              </div>
                              <div class="stat-pill">
                                <span class="pill-icon">🌱</span>
                                <span class="pill-label">
                                  {t("history_sprouts")}
                                </span>
                                <span>{sprouts.toLocaleString()}</span>
                              </div>
                              <div class="stat-pill">
                                <span class="pill-icon">🌻</span>
                                <span class="pill-label">
                                  {t("history_plants")}
                                </span>
                                <span>{plantCount}</span>
                              </div>
                            </div>
                          </Show>
                        </div>

                        <Show when={item.saveData}>
                          <div class="history-card-actions">
                            <Button
                              class="restore-btn"
                              variant="primary"
                              disabled={restoring()}
                              onclick={() => handleRestore(item)}
                            >
                              {t("btn_confirm_simple")}
                            </Button>
                          </div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </Show>
      </main>

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

export default History;
