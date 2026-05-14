import { getGithubToken, getLanguage, getLastSync, setGithubSettings, setLastSync as storageSetLastSync } from "./storage";
import { setLanguage } from "./i18n.svelte";
import type { SupportLanguage } from "./i18n.svelte";
import type { GithubUser, SyncResponse } from "./types";

// Định nghĩa Store theo chuẩn Svelte 5 Runes
export const appStore = $state({
  // Dữ liệu từ Storage
  githubToken: "",
  language: "en" as SupportLanguage,
  lastSync: 0,

  // Trạng thái Giao diện (UI State)
  isLoaded: false,
  view: "main" as "main" | "settings",
  githubUser: null as GithubUser | null,


  // Getter phái sinh (Derived data)
  get githubConnected() {
    return !!this.githubToken;
  },

  // Các hàm Action để thay đổi trạng thái
  async init() {
    this.githubToken = (await getGithubToken()) ?? "";
    this.language = (await getLanguage()) ?? "en";
    this.lastSync = (await getLastSync()) ?? 0;

    setLanguage(this.language); // Update i18n

    if (this.githubToken) {
      const r: SyncResponse = await new Promise((resolve) =>
        chrome.runtime.sendMessage({ type: "GET_USER_INFO" }, resolve),
      );
      if (r?.success && r.githubUser) this.githubUser = r.githubUser;
    }

    this.isLoaded = true;
  },

  async updateSettings(token: string, lang: SupportLanguage) {
    await setGithubSettings(token, lang);
    this.githubToken = token;
    this.language = lang;
    setLanguage(lang); // Update i18n
  },

  async markSynced() {
    await storageSetLastSync();
    this.lastSync = Date.now();
  },

  navigate(newView: "main" | "settings") {
    this.view = newView;
  },

});

