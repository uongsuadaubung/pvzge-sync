import {
  getGithubToken,
  getLanguage,
  getLastSync,
  getAutoSyncEnabled,
  getAutoSyncInterval,
  getAutoCollectEnabled,
  setGithubSettings,
  clearAuth,
} from "./storage";
import { setLanguage } from "./i18n.svelte";
import { SupportLanguage } from "./i18n.svelte";
import { SyncResponseSchema, View, type GithubUser } from "./types";

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
  autoCollectEnabled: false,

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
    this.language = await getLanguage();
    this.lastSync = await getLastSync();
    this.autoSyncEnabled = await getAutoSyncEnabled();
    this.autoSyncInterval = await getAutoSyncInterval();
    this.autoCollectEnabled = await getAutoCollectEnabled();

    await setLanguage(this.language);

    if (this.githubToken) {
      // Lấy thông tin user thông qua background để đảm bảo tính nhất quán
      const rawResponse = await new Promise((resolve) =>
        chrome.runtime.sendMessage({ type: "GET_USER_INFO" }, resolve),
      );

      const result = SyncResponseSchema.safeParse(rawResponse);
      if (result.success && "githubUser" in result.data) {
        this.githubUser = result.data.githubUser;
        console.log("[Store] GitHub user loaded:", this.githubUser.login);
      } else if (!result.success) {
        console.warn("[Store] Failed to load GitHub user info:", result.error.format());
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
    autoCollectEnabled: boolean,
  ) {
    console.log("[Store] Updating settings...");
    await setGithubSettings(
      token,
      lang,
      autoSyncEnabled,
      autoSyncInterval,
      autoCollectEnabled,
    );

    this.githubToken = token;
    this.language = lang;
    this.autoSyncEnabled = autoSyncEnabled;
    this.autoSyncInterval = autoSyncInterval;
    this.autoCollectEnabled = autoCollectEnabled;

    if (!token) this.githubUser = null;
    await setLanguage(lang);

    // Thông báo cho các thành phần khác (background, content)
    chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  },

  /** Đăng xuất: Xóa toàn bộ thông tin liên quan đến GitHub và dừng đồng bộ. */
  async logout() {
    console.log("[Store] Logging out...");
    await clearAuth();

    // Cập nhật lại trạng thái local trong store
    this.githubToken = "";
    this.autoSyncEnabled = false;
    this.lastSync = 0;
    this.githubUser = null;

    // Thông báo cho background để dừng Alarm và thông báo cho tabs
    chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  },

  /** Chuyển đổi màn hình hiển thị trong Popup. */
  navigate(newView: View) {
    this.view = newView;
    console.debug("[Store] Navigated to:", newView);
  },
});
