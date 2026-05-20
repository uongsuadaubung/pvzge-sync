<script lang="ts">
  import { t } from "@/shared/i18n.svelte";

  import { smartSync, getLocalData, applyRemoteToGame, forceUploadToCloud, forceDownloadFromCloud } from "@/domains/sync/sync";
  import { SaveDataSchema } from "@/domains/game/schema";

  import { appStore } from "@/shared/store.svelte";
  import Header from "@/components/Header.svelte";
  import Button from "@/components/Button.svelte";

  let fileInput = $state<HTMLInputElement>(null!);
  let downloadAnchor = $state<HTMLAnchorElement>(null!);
  let loading = $state(false);
  let syncCooldown = $state(false);
  let showAdvanced = $state(false);

  async function handleForceUpload() {
    if (!confirm(t("msg_force_upload_confirm"))) return;
    loading = true;
    try {
      await forceUploadToCloud();
      appStore.lastSync = Date.now();
      alert(t("msg_force_upload_success"));
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      loading = false;
    }
  }

  async function handleForceDownload() {
    if (!confirm(t("msg_force_download_confirm"))) return;
    loading = true;
    try {
      await forceDownloadFromCloud();
      appStore.lastSync = Date.now();
      alert(t("msg_force_download_success"));
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      loading = false;
    }
  }

  // Derived từ store — tự cập nhật khi token thay đổi
  let lastSyncMsg = $derived(
    appStore.lastSync
      ? t("last_sync") + new Date(appStore.lastSync).toLocaleString()
      : t("no_sync"),
  );



  async function handleSync() {
    loading = true;
    syncCooldown = true;
    setTimeout(() => { syncCooldown = false; }, 10_000);
    try {
      const synced = await smartSync(true);
      if (synced) appStore.lastSync = Date.now();
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      loading = false;
    }
  }

  async function handleExport() {
    loading = true;
    try {
      const data = await getLocalData().catch((e: unknown) => {
        alert(e instanceof Error ? e.message : String(e));
        return null;
      });
      if (!data) return;
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      downloadAnchor.href = url;
      downloadAnchor.download =
        "pvzge_save_" + new Date().toISOString().slice(0, 10) + ".json";
      downloadAnchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      loading = false;
    }
  }

  async function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    loading = true;
    try {
      const text = await file.text().catch(() => null);
      if (!text) { alert(t("msg_invalid_json")); return; }
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        alert(t("msg_invalid_json"));
        return;
      }
      const parseResult = SaveDataSchema.safeParse(raw);
      if (!parseResult.success) {
        alert(t("msg_invalid_json"));
        return;
      }
      await applyRemoteToGame(parseResult.data);
      appStore.lastSync = Date.now();
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <Header 
    showLogo 
    showSettings 
    subtitle={lastSyncMsg || t("no_sync")} 
  />

  <main>
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
            appStore.updateSettings(
              appStore.githubToken,
              appStore.language,
              appStore.autoSyncEnabled,
              appStore.autoSyncInterval,
              !appStore.autoCollectEnabled
            );
          }}
        >
          {appStore.autoCollectEnabled ? t("btn_auto_collect_off") : t("btn_auto_collect_on")}
        </Button>
      </div>
    </section>

    <div class="group-label">
      <span>{t("group_sync")}</span>
      <div class="line"></div>
    </div>

    {#if appStore.githubConnected}
      <section class="action-section cloud">
        <div class="section-header">
          <span class="section-icon">☁️</span>
          <h3>{t("cloud_sync")}</h3>
        </div>
        <div class="button-group">
          <Button fullWidth onclick={handleSync} disabled={loading || syncCooldown}>
            {t("btn_sync")}
          </Button>
        </div>

        <div class="advanced-wrapper">
          <button 
            type="button" 
            class="advanced-toggle" 
            onclick={() => showAdvanced = !showAdvanced}
            aria-expanded={showAdvanced}
          >
            <span>{t("advanced_title")}</span>
            <span class="arrow-icon {showAdvanced ? 'open' : ''}">▼</span>
          </button>

          {#if showAdvanced}
            <div class="advanced-content">
              <Button 
                variant="outline" 
                fullWidth 
                onclick={handleForceUpload} 
                disabled={loading}
                class="force-btn force-upload"
              >
                {t("btn_force_upload")}
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                onclick={handleForceDownload} 
                disabled={loading}
                class="force-btn force-download"
              >
                {t("btn_force_download")}
              </Button>
            </div>
          {/if}
        </div>
      </section>
    {/if}

    <section class="action-section local">
      <div class="section-header">
        <span class="section-icon">💾</span>
        <h3>{t("offline_backup")}</h3>
      </div>
      <div class="button-grid">
        <Button variant="outline" onclick={handleExport} disabled={loading}>
          {t("btn_export")}
        </Button>
        <Button variant="outline" onclick={() => fileInput.click()} disabled={loading}>
          {t("btn_import")}
        </Button>
      </div>
    </section>

    <input
      type="file"
      bind:this={fileInput}
      style="display:none"
      accept=".json"
      onchange={handleFile}
    />
    <a
      bind:this={downloadAnchor}
      href={undefined}
      aria-hidden="true"
      style="display:none"
      tabindex="-1"
    ></a>
  </main>
</div>

<style lang="scss">
  /* ─── Group Labels ───────────────────────────────── */
  .group-label {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 10px 0 14px;
    
    span {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--primary);
      white-space: nowrap;
      opacity: 0.85;
    }

    .line {
      height: 1px;
      flex: 1;
      background: linear-gradient(90deg, var(--border), transparent);
    }
  }

  /* ─── Action Sections ────────────────────────────── */
  .action-section {
    background: var(--surface);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 14px;
    border: 1px solid var(--border);
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: var(--primary-dark);
      box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.08);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;

      .section-icon { font-size: 1rem; }

      h3 {
        margin: 0;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: var(--text-dim);
      }
    }
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .button-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .advanced-wrapper {
    margin-top: 14px;
    border-top: 1px dashed var(--border);
    padding-top: 10px;
  }

  .advanced-toggle {
    background: transparent;
    border: none;
    padding: 6px 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-dim);
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--primary);
    }

    .arrow-icon {
      font-size: 0.65rem;
      transition: transform 0.2s ease;
      
      &.open {
        transform: rotate(180deg);
      }
    }
  }

  .advanced-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    animation: slideDown 0.2s ease-out forwards;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
