import { validatePlayerProperties, validateSettings } from "@/lib/schema";
import type { SaveData } from "@/lib/schema";

export function mergeValidPart(remote: unknown, local: SaveData): SaveData {
  const r = remote as Record<string, unknown>;
  const result: SaveData = { ...local };

  const ppResult = validatePlayerProperties(r?.PvZ2_PlayerProperties);
  if (ppResult.success) {
    result.PvZ2_PlayerProperties = ppResult.data;
  }

  const settingsResult = validateSettings(r?.PvZ2_Settings);
  if (settingsResult.success) {
    result.PvZ2_Settings = settingsResult.data;
  }

  return result;
}
