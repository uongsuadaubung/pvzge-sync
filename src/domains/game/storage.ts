import { SAVE_KEYS } from "@/shared/constants";
import { validateSaveData, validateSettings, type SaveData } from "@/domains/game/schema";

/**
 * Đọc dữ liệu thô từ localStorage của game.
 */
export function getGameSaveData(): { data: SaveData | null; errors: string[] | null } {
  const obj: Record<string, unknown> = {};

  for (const key of SAVE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) return { data: null, errors: [`Game data key '${key}' not found`] };

    try {
      obj[key] = JSON.parse(raw);
    } catch {
      return { data: null, errors: [`Game data key '${key}' is corrupted`] };
    }
  }

  const result = validateSaveData(obj);
  if (!result.success) {
    return { data: null, errors: result.error.issues.map((e) => e.message) };
  }

  return { data: result.data, errors: null };
}

/**
 * Đọc phím nhặt đồ (Game_CollectAll) từ cài đặt của game.
 */
export function getGameCollectKey(): string | null {
  try {
    const settingsRaw = localStorage.getItem("PvZ2_Settings");
    if (!settingsRaw) return null;

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(settingsRaw);
    } catch {
      return null;
    }

    const result = validateSettings(rawJson);
    if (!result.success) {
      console.warn("[GameStorage] Settings validation failed:", result.error.format());
      return null;
    }

    const key = result.data.KeyBinds?.Game_CollectAll;
    return typeof key === "string" ? key : null;
  } catch (e) {
    console.error("[GameStorage] Error reading PvZ2_Settings:", e);
    return null;
  }
}

/**
 * Ghi dữ liệu đồng bộ vào localStorage của game.
 */
export function setGameSaveData(data: SaveData) {
  for (const key of SAVE_KEYS) {
    localStorage.setItem(key, JSON.stringify(data[key]));
  }
}
