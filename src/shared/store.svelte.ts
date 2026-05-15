import { getGithubToken, getLanguage, getLastSync, setGithubSettings } from "./storage";
import { setLanguage } from "./i18n.svelte";
import { SupportLanguage } from "./i18n.svelte";
import type { GithubUser, SyncResponse } from "./types";
import { View } from "./types";

// Định nghĩa Store theo chuẩn Svelte 5 Runes
export const appStore = $state({
  // Dữ liệu từ Storage
  githubToken: "",
  language: SupportLanguage.En,
  lastSync: 0,

  // Trạng thái Giao diện (UI State)
  isLoaded: false,
  view: View.Main,
  githubUser: null as GithubUser | null,


  // Getter phái sinh (Derived data)
  get githubConnected() {
    return !!this.githubToken;
  },

  // Các hàm Action để thay đổi trạng thái
  async init() {
    this.githubToken = (await getGithubToken()) ?? "";
    this.language = (await getLanguage()) ?? SupportLanguage.En;
    this.lastSync = (await getLastSync()) ?? 0;

    await setLanguage(this.language); // Update i18n

    if (this.githubToken) {
      const r: SyncResponse = await new Promise((resolve) =>
        chrome.runtime.sendMessage({ type: "GET_USER_INFO" }, resolve),
      );
      if (r.success && "githubUser" in r) this.githubUser = r.githubUser;
    }

    this.isLoaded = true;
  },

  async updateSettings(token: string, lang: SupportLanguage) {
    await setGithubSettings(token, lang);
    this.githubToken = token;
    this.language = lang;
    if (!token) this.githubUser = null;
    await setLanguage(lang); // Update i18n
  },

  async logout() {
    await this.updateSettings("", this.language);
  },

  navigate(newView: View) {
    this.view = newView;
  },

});
