import { createStore } from "solid-js/store";
import {
  clearAuth,
  getAutoCollectEnabled,
  getAutoSyncEnabled,
  getAutoSyncInterval,
  getGithubToken,
  getLanguage,
  getLastSync,
  setGithubSettings,
} from "@/shared/storage.ts";
import { setLanguage } from "@/shared/i18n.ts";
import { SupportLanguage } from "@/shared/i18n.ts";
import { type GithubUser, SyncResponseSchema, View } from "@/shared/types.ts";

export interface AppStore {
  githubToken: string;
  language: SupportLanguage;
  lastSync: number;
  autoSyncEnabled: boolean;
  autoSyncInterval: number;
  autoCollectEnabled: boolean;
  isLoaded: boolean;
  view: View;
  githubUser: GithubUser | null;
  readonly githubConnected: boolean;
}

/**
 * App Store sử dụng SolidJS Store.
 * Quản lý trạng thái toàn cục của ứng dụng, đồng bộ giữa Storage và UI.
 */
export const [appStore, setAppStore] = createStore<AppStore>({
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
  githubUser: null,

  /** Kiểm tra xem đã cấu hình GitHub hay chưa (dựa trên token) */
  get githubConnected() {
    return !!this.githubToken;
  },
});

export const appStoreActions = {
  /**
   * Khởi tạo store: Load dữ liệu từ storage và lấy thông tin User GitHub nếu có token.
   */
  async init() {
    console.log("[Store] Initializing...");
    const token = (await getGithubToken()) ?? "";
    const language = await getLanguage();
    const lastSync = await getLastSync();
    const autoSyncEnabled = await getAutoSyncEnabled();
    const autoSyncInterval = await getAutoSyncInterval();
    const autoCollectEnabled = await getAutoCollectEnabled();

    setAppStore({
      githubToken: token,
      language,
      lastSync,
      autoSyncEnabled,
      autoSyncInterval,
      autoCollectEnabled,
    });

    await setLanguage(language);

    if (token) {
      // Lấy thông tin user thông qua background để đảm bảo tính nhất quán
      const rawResponse = await new Promise((resolve) =>
        chrome.runtime.sendMessage({ type: "GET_USER_INFO" }, resolve)
      );

      const result = SyncResponseSchema.safeParse(rawResponse);
      if (result.success && "githubUser" in result.data) {
        setAppStore("githubUser", result.data.githubUser);
        console.log(
          "[Store] GitHub user loaded:",
          result.data.githubUser.login,
        );
      } else if (!result.success) {
        console.warn(
          "[Store] Failed to load GitHub user info:",
          result.error.format(),
        );
      }
    }

    setAppStore("isLoaded", true);
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

    setAppStore({
      githubToken: token,
      language: lang,
      autoSyncEnabled,
      autoSyncInterval,
      autoCollectEnabled,
      githubUser: !token ? null : appStore.githubUser,
    });

    await setLanguage(lang);

    // Thông báo cho các thành phần khác (background, content)
    chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  },

  /** Đăng xuất: Xóa toàn bộ thông tin liên quan đến GitHub và dừng đồng bộ. */
  async logout() {
    console.log("[Store] Logging out...");
    await clearAuth();

    // Cập nhật lại trạng thái local trong store
    setAppStore({
      githubToken: "",
      autoSyncEnabled: false,
      lastSync: 0,
      githubUser: null,
    });

    // Thông báo cho background để dừng Alarm và thông báo cho tabs
    chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  },

  /** Chuyển đổi màn hình hiển thị trong Popup. */
  navigate(newView: View) {
    setAppStore("view", newView);
    console.debug("[Store] Navigated to:", newView);
  },
};
