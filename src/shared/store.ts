import { createStore } from "solid-js/store";
import {
  clearAuth,
  clearSessionGistCache,
  getAutoCollectEnabled,
  getAutoSyncEnabled,
  getAutoSyncInterval,
  getAutoSyncStatus,
  getCachedGithubUser,
  getGistId,
  getGithubToken,
  getLanguage,
  getLastSync,
  getLocalhostPort,
  setGithubSettings,
  subscribeToSettings,
  type UpdateSettingsOptions,
} from "@/shared/storage.ts";
import { setLanguage } from "@/shared/i18n.ts";
import { SupportLanguage } from "@/shared/i18n.ts";
import { clearLocalGameData } from "@/domains/sync/sync.ts";
import {
  type GithubUser,
  SyncResponseSchema,
  type SyncStatusType,
  View,
} from "@/shared/types.ts";

export interface AppStore {
  githubToken: string;
  gistId: string;
  language: SupportLanguage;
  lastSync: number;
  autoSyncEnabled: boolean;
  autoSyncInterval: number;
  autoCollectEnabled: boolean;
  localhostPort: string;
  autoSyncStatus: string;
  autoSyncStatusType: SyncStatusType;
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
  gistId: "",
  language: SupportLanguage.En,
  lastSync: 0,
  autoSyncEnabled: false,
  autoSyncInterval: 5,
  autoCollectEnabled: false,
  localhostPort: "8080",
  autoSyncStatus: "",
  autoSyncStatusType: "info",

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
  async init() {
    console.log("[Store] Initializing...");
    const token = (await getGithubToken()) ?? "";
    const gistId = (await getGistId()) ?? "";
    const language = await getLanguage();
    const lastSync = await getLastSync();
    const autoSyncEnabled = await getAutoSyncEnabled();
    const autoSyncInterval = await getAutoSyncInterval();
    const autoCollectEnabled = await getAutoCollectEnabled();
    const localhostPort = await getLocalhostPort();
    const autoSyncStatusObj = await getAutoSyncStatus();
    const cachedUser = await getCachedGithubUser();

    setAppStore({
      githubToken: token,
      gistId,
      language,
      lastSync,
      autoSyncEnabled,
      autoSyncInterval,
      autoCollectEnabled,
      localhostPort,
      autoSyncStatus: autoSyncStatusObj.status,
      autoSyncStatusType: autoSyncStatusObj.type,
      githubUser: cachedUser,
    });

    await setLanguage(language);

    // Chỉ gọi API lấy thông tin nếu có token nhưng chưa có dữ liệu lưu tạm (cache)
    if (token && !cachedUser) {
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
          result.error,
        );
      }
    }

    // Đăng ký lắng nghe thay đổi từ storage để tự động cập nhật store
    subscribeToSettings((settings) => {
      setAppStore({
        githubToken: settings.githubToken,
        gistId: settings.gistId,
        language: settings.language,
        lastSync: settings.lastSync,
        autoSyncEnabled: settings.autoSyncEnabled,
        autoSyncInterval: settings.autoSyncInterval,
        autoCollectEnabled: settings.autoCollectEnabled,
        localhostPort: settings.localhostPort,
        autoSyncStatus: settings.autoSyncStatus || "",
        autoSyncStatusType: settings.autoSyncStatusType,
        githubUser: settings.cachedGithubUser,
      });
    });

    setAppStore("isLoaded", true);
    console.log("[Store] Initialization complete.");
  },

  async updateSettings(options: Partial<UpdateSettingsOptions>) {
    console.log("[Store] Updating settings...");

    // 1. Chuẩn bị patch để lưu vào storage
    const storagePatch: Partial<UpdateSettingsOptions> & {
      cachedGithubUser?: GithubUser | null;
    } = { ...options };

    if (options.githubToken !== undefined) {
      storagePatch.cachedGithubUser = options.githubToken
        ? appStore.githubUser
        : null;
    }

    await setGithubSettings(storagePatch);

    // 2. Cập nhật SolidJS Store bằng cách truyền partial patch
    const storePatch: Partial<AppStore> = { ...options };
    if (options.githubToken !== undefined) {
      storePatch.githubUser = !options.githubToken
        ? null
        : appStore.githubUser;
    }
    setAppStore(storePatch);

    // 3. Cập nhật ngôn ngữ i18n nếu ngôn ngữ được truyền vào
    if (options.language !== undefined) {
      await setLanguage(options.language);
    }

    // Thông báo cho các thành phần khác (background, content)
    chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  },

  /** Đăng xuất: Xóa toàn bộ thông tin liên quan đến GitHub và dừng đồng bộ. */
  async logout(clearLocalProgress?: boolean) {
    console.log("[Store] Logging out...");
    if (clearLocalProgress) {
      await clearLocalGameData();
    }

    await clearAuth();
    await clearSessionGistCache();

    // Cập nhật lại trạng thái local trong store
    setAppStore({
      githubToken: "",
      gistId: "",
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
