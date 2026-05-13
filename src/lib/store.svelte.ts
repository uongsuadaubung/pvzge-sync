import { getGithubToken, getLanguage, getLastSync, setGithubSettings, setLastSync as storageSetLastSync } from "./storage";
import { setLanguage } from "./i18n.svelte";
import type { SaveData } from "./schema";

// Định nghĩa Store theo chuẩn Svelte 5 Runes
export const appStore = $state({
  // Dữ liệu từ Storage
  githubToken: "",
  language: "en",
  lastSync: 0,

  // Trạng thái Giao diện (UI State)
  isLoaded: false,
  view: "main" as "main" | "settings" | "conflict",

  // Dữ liệu tạm thời (để truyền giữa các View)
  localData: null as SaveData | null,
  remoteData: null as SaveData | null,

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
    this.isLoaded = true;
  },

  async updateSettings(token: string, lang: string) {
    await setGithubSettings(token, lang);
    this.githubToken = token;
    this.language = lang;
    setLanguage(lang); // Update i18n
  },

  async markSynced() {
    await storageSetLastSync();
    this.lastSync = Date.now();
  },

  navigate(newView: "main" | "settings" | "conflict") {
    this.view = newView;
  },

  setConflictData(local: SaveData, remote: SaveData) {
    this.localData = local;
    this.remoteData = remote;
    this.view = "conflict";
  },
});
