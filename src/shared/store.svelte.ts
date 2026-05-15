import {
  getGithubToken,
  getLanguage,
  getLastSync,
  getAutoSyncEnabled,
  getAutoSyncInterval,
  setGithubSettings,
} from "./storage";
import { setLanguage } from "./i18n.svelte";
import { SupportLanguage } from "./i18n.svelte";
import type { GithubUser, SyncResponse } from "./types";
import { View } from "./types";

/**
 * App Store sử dụng Svelte 5 Runes ($state).
 * Quản lý trạng thái toàn cục của ứng dụng, đồng bộ giữa Storage và UI.
 */
export const appStore = $state({
  // --- Dữ liệu từ Storage ---
  githubToken: "",
  language: SupportLanguage.En,
  lastSync: 0,
  autoSyncEnabled: false,
  autoSyncInterval: 5,

  // --- Trạng thái Giao diện (UI State) ---
  isLoaded: false,
  view: View.Main,
  githubUser: null as GithubUser | null,

  /** Kiểm tra xem đã cấu hình GitHub hay chưa (dựa trên token) */
  get githubConnected() {
    return !!this.githubToken;
  },

  /**
   * Khởi tạo store: Load dữ liệu từ storage và lấy thông tin User GitHub nếu có token.
   */
  async init() {
    console.log("[Store] Initializing...");
    this.githubToken = (await getGithubToken()) ?? "";
    this.language = (await getLanguage()) ?? SupportLanguage.En;
    this.lastSync = (await getLastSync()) ?? 0;
    this.autoSyncEnabled = await getAutoSyncEnabled();
    this.autoSyncInterval = await getAutoSyncInterval();

    await setLanguage(this.language);

    if (this.githubToken) {
      // Lấy thông tin user thông qua background để đảm bảo tính nhất quán
      const r: SyncResponse = await new Promise((resolve) =>
        chrome.runtime.sendMessage({ type: "GET_USER_INFO" }, resolve),
      );
      if (r.success && "githubUser" in r) {
        this.githubUser = r.githubUser;
        console.log("[Store] GitHub user loaded:", this.githubUser.login);
      }
    }

    this.isLoaded = true;
    console.log("[Store] Initialization complete.");
  },

  /**
   * Cập nhật cài đặt và lưu vào storage.
   */
  async updateSettings(
    token: string,
    lang: SupportLanguage,
    autoSyncEnabled: boolean,
    autoSyncInterval: number,
  ) {
    console.log("[Store] Updating settings...");
    await setGithubSettings(token, lang, autoSyncEnabled, autoSyncInterval);

    this.githubToken = token;
    this.language = lang;
    this.autoSyncEnabled = autoSyncEnabled;
    this.autoSyncInterval = autoSyncInterval;

    if (!token) this.githubUser = null;
    await setLanguage(lang);

    // Thông báo cho background script để cập nhật Alarm
    chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  },

  /** Đăng xuất: Xóa token nhưng giữ nguyên các thiết lập khác. */
  async logout() {
    console.log("[Store] Logging out...");
    await this.updateSettings("", this.language, this.autoSyncEnabled, this.autoSyncInterval);
  },

  /** Chuyển đổi màn hình hiển thị trong Popup. */
  navigate(newView: View) {
    this.view = newView;
    console.debug("[Store] Navigated to:", newView);
  },
});
