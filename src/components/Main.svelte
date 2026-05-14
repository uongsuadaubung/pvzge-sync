<script lang="ts">
  import { t } from "@/lib/i18n.svelte";

  import { mergeValidPart } from "@/lib/merge";
  import { smartSync, getLocalData, applyRemoteToGame } from "@/lib/sync";
  import { SaveDataSchema } from "@/lib/schema";
  import type { SaveData } from "@/lib/schema";

  import { appStore } from "@/lib/store.svelte";

  let fileInput = $state<HTMLInputElement>(null!);
  let downloadAnchor = $state<HTMLAnchorElement>(null!);

  // Derived từ store — tự cập nhật khi token thay đổi
  let statusMsg = $derived(
    appStore.githubConnected ? t("status_connected") : t("status_no_github"),
  );
  let statusColor = $derived(appStore.githubConnected ? "#4caf50" : "#ff9800");
  let lastSyncMsg = $derived(
    appStore.lastSync
      ? t("last_sync") + new Date(appStore.lastSync).toLocaleString()
      : t("no_sync"),
  );



  async function handleSync() {
    await smartSync(true).catch((e: unknown) =>
      alert("Error: " + (e instanceof Error ? e.message : String(e))),
    );
  }

  async function handleExport() {
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
  }

  async function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await file.text().catch(() => null);
    if (!text) {
      alert(t("msg_invalid_json"));
      return;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      alert(t("msg_invalid_json"));
      return;
    }

    const parseResult = SaveDataSchema.safeParse(raw);
    let imported: SaveData;
    if (parseResult.success) {
      imported = parseResult.data;
    } else {
      let local: SaveData;
      try {
        local = await getLocalData();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : String(e));
        return;
      }
      const merged = mergeValidPart(raw, local);
      if (!SaveDataSchema.safeParse(merged).success) {
        alert("Cannot fix file. Update extension.");
        return;
      }
      alert("File partially incompatible. Merged with local.");
      imported = merged;
    }
    await applyRemoteToGame(imported);
  }
</script>

<div class="container">
  <header>
    <div class="logo-wrapper">
      <img src="icons/icon48.png" alt="Logo" class="logo" />
    </div>
    <div class="header-text">
      <h1>{t("app_name")}</h1>
      <small id="last-sync">{lastSyncMsg || t("no_sync")}</small>
    </div>
    <button
      class="btn-settings-icon"
      title="Cài đặt"
      onclick={() => appStore.navigate("settings")}>⚙️</button
    >
  </header>

  <main>
    <div class="status-indicator">
      <span
        class="dot {appStore.githubConnected ? 'active' : ''}"
        style="background:{statusColor}"
      ></span>
      <span id="status-text" style="color:{statusColor}">{statusMsg}</span>
    </div>

    {#if appStore.githubConnected}
      <section class="action-section cloud">
        <div class="section-header">
          <span class="section-icon">☁️</span>
          <h3>{t("cloud_sync")}</h3>
        </div>
        <div class="button-group">
          <button class="btn primary full-width" onclick={handleSync}
            >{t("btn_sync")}</button
          >
        </div>
      </section>
    {/if}

    <section class="action-section local">
      <div class="section-header">
        <span class="section-icon">💾</span>
        <h3>{t("offline_backup")}</h3>
      </div>
      <div class="button-grid">
        <button class="btn outline" onclick={handleExport}
          >{t("btn_export")}</button
        >
        <button class="btn outline" onclick={() => fileInput.click()}
          >{t("btn_import")}</button
        >
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
