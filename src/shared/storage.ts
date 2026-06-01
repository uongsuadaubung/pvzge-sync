import { z } from "zod";
import { SupportLanguage, SupportLanguageSchema } from "@/shared/i18n.ts";
import { type SyncStatusType, SyncStatusTypeSchema } from "@/shared/types.ts";
import { type GithubUser, GithubUserSchema } from "@/domains/github/schema.ts";
import { type SaveData, SaveDataSchema } from "@/domains/game/schema.ts";

/**
 * Schema định nghĩa cấu trúc dữ liệu lưu trữ trong chrome.storage.local.
 */
const SettingsSchema = z.object({
  githubToken: z.string().default(""),
  gistId: z.string().default(""),
  lastSync: z.number().default(0),
  lastSyncedHash: z.string().default(""),
  language: SupportLanguageSchema.default(SupportLanguage.En),
  autoSyncEnabled: z.boolean().default(false),
  autoSyncInterval: z.number().default(5),
  autoCollectEnabled: z.boolean().default(false),
  localhostPort: z.string().default("8080"),
  autoSyncStatus: z.string().default(""),
  autoSyncStatusType: SyncStatusTypeSchema.default("info"),
  cachedGithubUser: GithubUserSchema.nullable().default(null),
});

export type AppSettings = z.infer<typeof SettingsSchema>;

export interface UpdateSettingsOptions {
  githubToken: string;
  language: SupportLanguage;
  autoSyncEnabled: boolean;
  autoSyncInterval: number;
  autoCollectEnabled: boolean;
  localhostPort: string;
}

export const STORAGE_KEY = "pvzge_sync_settings";

/**
 * Lấy toàn bộ settings từ chrome.storage.local.
 * Nếu chưa có dữ liệu, trả về giá trị mặc định từ Schema.
 */
async function getAllSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const raw = result[STORAGE_KEY];
  const parsed = SettingsSchema.parse(raw || {});
  console.debug("[Storage] Read all settings:", parsed);
  return parsed;
}

/**
 * Cập nhật một hoặc nhiều trường trong settings.
 * @param patch - Đối tượng chứa các trường cần cập nhật.
 */
async function updateSettings(patch: Partial<AppSettings>) {
  const current = await getAllSettings();
  const next = { ...current, ...patch };
  // Chốt chặn bảo vệ triệt tiêu hoàn toàn mọi Proxy (nếu có) bằng cách parse qua Zod Schema trước khi ghi vào storage
  const safeNext = SettingsSchema.parse(next);
  await chrome.storage.local.set({ [STORAGE_KEY]: safeNext });
  console.log("[Storage] Settings updated:", patch);
}

// --- Getters ---

/** Lấy GitHub Token (trả về undefined nếu chuỗi rỗng) */
export async function getGithubToken(): Promise<string | undefined> {
  const val = (await getAllSettings()).githubToken;
  return val || undefined;
}

/** Lấy Gist ID (trả về undefined nếu chuỗi rỗng) */
export async function getGistId(): Promise<string | undefined> {
  const val = (await getAllSettings()).gistId;
  return val || undefined;
}

/** Lấy thời điểm đồng bộ thành công cuối cùng (Unix timestamp) */
export async function getLastSync(): Promise<number> {
  return (await getAllSettings()).lastSync;
}

/** Lấy mã băm đồng bộ thành công cuối cùng */
export async function getLastSyncedHash(): Promise<string> {
  return (await getAllSettings()).lastSyncedHash;
}

/** Lấy ngôn ngữ hiện tại của ứng dụng */
export async function getLanguage(): Promise<SupportLanguage> {
  return (await getAllSettings()).language;
}

/** Kiểm tra tính năng tự động đồng bộ có đang bật hay không */
export async function getAutoSyncEnabled(): Promise<boolean> {
  return (await getAllSettings()).autoSyncEnabled;
}

/** Lấy chu kỳ tự động đồng bộ (đơn vị: phút) */
export async function getAutoSyncInterval(): Promise<number> {
  return (await getAllSettings()).autoSyncInterval;
}

/** Kiểm tra tính năng tự động nhặt mặt trời có đang bật hay không */
export async function getAutoCollectEnabled(): Promise<boolean> {
  return (await getAllSettings()).autoCollectEnabled;
}

/** Lấy cổng Localhost hoạt động */
export async function getLocalhostPort(): Promise<string> {
  return (await getAllSettings()).localhostPort;
}

// --- Setters ---

/** Lưu Gist ID vào storage */
export async function setGistId(gistId: string) {
  await updateSettings({ gistId });
}

/** Cập nhật thời điểm đồng bộ cuối cùng thành 'bây giờ' */
export async function setLastSync() {
  await updateSettings({ lastSync: Date.now() });
}

/** Lưu mã băm đồng bộ thành công cuối cùng */
export async function setLastSyncedHash(lastSyncedHash: string) {
  await updateSettings({ lastSyncedHash });
}

export async function setGithubSettings(
  settings: Partial<UpdateSettingsOptions> & {
    cachedGithubUser?: GithubUser | null;
  },
) {
  const patch: Partial<AppSettings> = {};

  if (settings.githubToken !== undefined) patch.githubToken = settings.githubToken;
  if (settings.language !== undefined) patch.language = settings.language;
  if (settings.autoSyncEnabled !== undefined) patch.autoSyncEnabled = settings.autoSyncEnabled;
  if (settings.autoSyncInterval !== undefined) patch.autoSyncInterval = settings.autoSyncInterval;
  if (settings.autoCollectEnabled !== undefined) patch.autoCollectEnabled = settings.autoCollectEnabled;
  if (settings.localhostPort !== undefined) patch.localhostPort = settings.localhostPort;

  if (settings.githubToken !== undefined) {
    const currentToken = await getGithubToken();
    if (currentToken !== settings.githubToken) {
      patch.cachedGithubUser = settings.cachedGithubUser !== undefined
        ? settings.cachedGithubUser
        : null;
    }
  } else if (settings.cachedGithubUser !== undefined) {
    patch.cachedGithubUser = settings.cachedGithubUser;
  }

  await updateSettings(patch);
}
/**
 * Đăng xuất: Xóa toàn bộ thông tin liên quan đến GitHub và đồng bộ.
 */
export async function clearAuth() {
  await updateSettings({
    githubToken: "",
    gistId: "",
    lastSync: 0,
    lastSyncedHash: "",
    autoSyncEnabled: false,
    autoSyncStatus: "",
    autoSyncStatusType: "info",
    cachedGithubUser: null,
  });
  console.log("[Storage] Auth cleared.");
}

/** Đăng ký lắng nghe các thay đổi cấu hình từ các tiến trình khác (như background) */
export function subscribeToSettings(callback: (settings: AppSettings) => void) {
  if (
    typeof chrome === "undefined" || !chrome.storage ||
    !chrome.storage.onChanged
  ) return;
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes[STORAGE_KEY]) {
      const newValue = changes[STORAGE_KEY].newValue;
      if (newValue) {
        try {
          const parsed = SettingsSchema.parse(newValue);
          callback(parsed);
        } catch (e) {
          console.error("[Storage] Failed to parse updated settings:", e);
        }
      }
    }
  });
}

/** Lấy trạng thái đồng bộ tự động hiện tại */
export async function getAutoSyncStatus(): Promise<
  { status: string; type: SyncStatusType }
> {
  const settings = await getAllSettings();
  return {
    status: settings.autoSyncStatus || "",
    type: settings.autoSyncStatusType,
  };
}

/** Cập nhật trạng thái đồng bộ tự động */
export async function setAutoSyncStatus(
  status: string,
  type: SyncStatusType = "info",
) {
  await updateSettings({ autoSyncStatus: status, autoSyncStatusType: type });
}

/** Lấy thông tin user GitHub đang được lưu trong cache */
export async function getCachedGithubUser(): Promise<GithubUser | null> {
  return (await getAllSettings()).cachedGithubUser;
}

/** Cập nhật thông tin user GitHub vào cache */
export async function setCachedGithubUser(cachedGithubUser: GithubUser | null) {
  await updateSettings({ cachedGithubUser });
}

const SESSION_CACHE_KEY = "pvzge_session_gist_cache";

/** Lấy dữ liệu SaveData đã cache từ Session RAM */
export async function getSessionGistCache(): Promise<SaveData | null> {
  if (typeof chrome === "undefined" || !chrome.storage?.session) return null;
  try {
    const result = await chrome.storage.session.get(SESSION_CACHE_KEY);
    const raw = result[SESSION_CACHE_KEY];
    if (!raw) return null;
    return SaveDataSchema.parse(raw);
  } catch (e) {
    console.warn("[Storage] Failed to read session cache:", e);
    return null;
  }
}

/** Lưu dữ liệu SaveData vào Session RAM */
export async function setSessionGistCache(data: SaveData) {
  if (typeof chrome === "undefined" || !chrome.storage?.session) return;
  try {
    // Chốt chặn bảo vệ triệt tiêu hoàn toàn Proxy bằng cách parse qua Zod Schema trước khi đưa vào storage
    const safeData = SaveDataSchema.parse(data);
    await chrome.storage.session.set({ [SESSION_CACHE_KEY]: safeData });
    console.log("[Storage] Session cache updated.");
  } catch (e) {
    console.error("[Storage] Failed to set session cache:", e);
  }
}

/** Xóa sạch dữ liệu cache trong Session RAM */
export async function clearSessionGistCache() {
  if (typeof chrome === "undefined" || !chrome.storage?.session) return;
  try {
    await chrome.storage.session.remove(SESSION_CACHE_KEY);
    console.log("[Storage] Session cache cleared.");
  } catch (e) {
    console.error("[Storage] Failed to clear session cache:", e);
  }
}
