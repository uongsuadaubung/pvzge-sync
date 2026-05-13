<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "@/lib/i18n.svelte";
  import { findConflicts, hasConflicts } from "@/lib/utils";
  import { mergeValidPart } from "@/lib/merge";
  import { SaveDataSchema } from "@/lib/schema";
  import { GAME_HOST } from "@/lib/constants";
  import type { SyncResponse } from "@/lib/types";
  import type { SaveData } from "@/lib/schema";
  import {
    getGithubToken,
    getLastSync,
    setLastSync,
  } from "@/lib/storage";
  import Settings from "@/components/Settings.svelte";
  import Conflict from "@/components/Conflict.svelte";
  import { appStore } from "@/lib/store.svelte";

  // — app state —
  let ready = $state(false);
  let onGamePage = $state(false);
  let githubConnected = $state(false);
  let statusMsg = $state("");
  let statusColor = $state("#ff9800");
  let dotActive = $state(false);
  let lastSyncMsg = $state("");
  let warnMsg = $state("");
  let errorMsg = $state("");
  let localData = $state<SaveData | null>(null);
  let fileInput = $state<HTMLInputElement>(null!);

  async function refreshStatus() {
    const token = await getGithubToken();
    const ls = await getLastSync();
    githubConnected = !!token;
    if (token) {
      statusMsg = t("status_connected");
      statusColor = "#4caf50";
      dotActive = true;
    } else {
      statusMsg = t("status_no_github");
      statusColor = "#ff9800";
      dotActive = false;
    }
    lastSyncMsg = ls
      ? t("last_sync") + new Date(ls).toLocaleString()
      : t("no_sync");
  }

  async function getGameTab(): Promise<chrome.tabs.Tab | null> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab?.url?.includes(GAME_HOST) ? tab : null;
  }

  async function getLocalData(): Promise<SaveData> {
    const tab = await getGameTab();
    if (!tab) throw new Error(t("msg_game_not_open"));
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id!, { type: "GET_LOCAL_DATA" }, (r) => {
        chrome.runtime.lastError
          ? reject(new Error("Connection error."))
          : resolve(r.data);
      });
    });
  }

  async function validateLocalData(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const tab = await getGameTab();
    if (!tab) return { valid: false, errors: [t("msg_game_not_open")] };
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id!, { type: "VALIDATE_LOCAL_DATA" }, (r) => {
        if (chrome.runtime.lastError || !r)
          resolve({ valid: false, errors: ["Connection error"] });
        else resolve(r as { valid: boolean; errors: string[] });
      });
    });
  }

  async function finalizeSyncDirect(data: SaveData) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id)
      chrome.tabs.sendMessage(tab.id, { type: "APPLY_REMOTE_DATA", data });
    await appStore.markSynced();
    statusMsg = "✅ Synced!";
    refreshStatus();
  }

  async function handleUpload() {
    try {
      statusMsg = "⏳ ...";
      const data = await getLocalData();
      chrome.runtime.sendMessage(
        { type: "UPLOAD_TO_GIST", data },
        (r: SyncResponse) => {
          if (r.success) {
            appStore.markSynced();
            refreshStatus();
          } else {
            alert("Error: " + r.error);
            refreshStatus();
          }
        },
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
      refreshStatus();
    }
  }

  async function handleDownload() {
    try {
      statusMsg = "⏳ ...";
      chrome.runtime.sendMessage(
        { type: "DOWNLOAD_FROM_GIST" },
        async (r: SyncResponse) => {
          if (!r.success) {
            alert("Error: " + r.error);
            refreshStatus();
            return;
          }
          let remote = r.data as SaveData;
          if (!SaveDataSchema.safeParse(remote).success) {
            remote = mergeValidPart(remote, localData!);
            if (!SaveDataSchema.safeParse(remote).success) {
              alert("Cannot fix remote data. Please update the extension.");
              refreshStatus();
              return;
            }
            alert("Remote data partially incompatible. Merged with local.");
          }
          if (findConflicts(localData!, remote).length === 0) {
            await setLastSync();
            statusMsg = "✅ Already up to date!";
            refreshStatus();
            return;
          }
          appStore.setConflictData(localData!, remote);
        },
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
      refreshStatus();
    }
  }

  async function handleExport() {
    try {
      const data = await getLocalData();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      Object.assign(document.createElement("a"), {
        href: url,
        download:
          "pvzge_save_" + new Date().toISOString().slice(0, 10) + ".json",
      }).click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as SaveData;
        if (!SaveDataSchema.safeParse(imported).success) {
          const merged = mergeValidPart(imported, localData!);
          if (!SaveDataSchema.safeParse(merged).success) {
            alert("Cannot fix file. Update extension.");
            return;
          }
          alert("File partially incompatible. Merged with local.");
        }
        if (!hasConflicts(localData!, imported))
          await finalizeSyncDirect(imported);
        else {
          appStore.setConflictData(localData!, imported);
        }
      } catch {
        alert(t("msg_invalid_json"));
      }
    };
    reader.readAsText(file);
  }

  function openSettings() {
    appStore.navigate("settings");
  }

  onMount(async () => {
    await appStore.init();

    const tab = await getGameTab();
    onGamePage = !!tab;

    if (!onGamePage) {
      warnMsg = t("not_game_page_body");
      ready = true;
      return;
    }

    const validation = await validateLocalData();
    if (!validation.valid) {
      errorMsg = validation.errors.join("; ");
      ready = true;
      return;
    }

    localData = await getLocalData();
    await refreshStatus();
    ready = true;
  });
</script>

{#if ready}
  {#if appStore.view === "conflict"}
    <Conflict />
  {:else if appStore.view === "settings"}
    <Settings />
  {:else}
    <div class="container">
      <header>
        <div class="logo-wrapper">
          <img src="icons/icon48.png" alt="Logo" class="logo" />
        </div>
        <div class="header-text">
          <h1>{t("app_name")}</h1>
          <small id="last-sync">{lastSyncMsg || t("no_sync")}</small>
        </div>
        <button class="btn-settings-icon" title="Cài đặt" onclick={openSettings}
          >⚙️</button
        >
      </header>

      {#if warnMsg}
        <div class="warn-banner">
          <strong>🎮 {t("not_game_page_title")}</strong><br />{@html warnMsg}
        </div>
      {:else if errorMsg}
        <div class="error-banner">
          <strong>⚠️ {t("schema_error_title")}</strong><br />
          Local save data is incompatible. Please update the extension.<br />
          <small>{errorMsg}</small>
        </div>
      {:else}
        <main>
          <div class="status-indicator">
            <span
              class="dot {dotActive ? 'active' : ''}"
              style="background:{statusColor}"
            ></span>
            <span id="status-text" style="color:{statusColor}">{statusMsg}</span
            >
          </div>

          {#if githubConnected}
            <section class="action-section cloud">
              <div class="section-header">
                <span class="section-icon">☁️</span>
                <h3>{t("cloud_sync")}</h3>
              </div>
              <div class="button-group">
                <button class="btn primary full-width" onclick={handleUpload}
                  >{t("btn_upload")}</button
                >
                <button
                  class="btn secondary full-width"
                  onclick={handleDownload}>{t("btn_download")}</button
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
        </main>
      {/if}
    </div>
  {/if}
{/if}
