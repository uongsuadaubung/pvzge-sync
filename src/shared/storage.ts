import { z } from "zod";
import { SupportLanguage } from "./i18n.svelte";

/**
 * Schema định nghĩa cấu trúc dữ liệu lưu trữ trong chrome.storage.local.
 */
const SettingsSchema = z.object({
  githubToken: z.string().default(""),
  gistId: z.string().default(""),
  lastSync: z.number().default(0),
  language: z.enum(SupportLanguage).default(SupportLanguage.En),
  autoSyncEnabled: z.boolean().default(false),
  autoSyncInterval: z.number().default(5),
  autoCollectEnabled: z.boolean().default(false),
  autoCollectKey: z.string().default("a"),
});

export type AppSettings = z.infer<typeof SettingsSchema>;

const STORAGE_KEY = "pvzge_sync_settings";

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
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
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

/** Lấy phím tự động nhặt mặt trời */
export async function getAutoCollectKey(): Promise<string> {
  return (await getAllSettings()).autoCollectKey;
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

/**
 * Lưu các thiết lập chính của GitHub và ứng dụng.
 */
export async function setGithubSettings(
  githubToken: string,
  language: SupportLanguage,
  autoSyncEnabled: boolean,
  autoSyncInterval: number,
  autoCollectEnabled: boolean,
  autoCollectKey: string,
) {
  await updateSettings({
    githubToken,
    language,
    autoSyncEnabled,
    autoSyncInterval,
    autoCollectEnabled,
    autoCollectKey,
  });
}
