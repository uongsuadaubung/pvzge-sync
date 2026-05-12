import { validatePlayerProperties, validateSettings } from './schema';
import type { SaveData } from './types';

export function mergeValidPart(remote: SaveData, local: SaveData): SaveData {
  const result: SaveData = { ...remote };

  const ppResult = validatePlayerProperties(remote.PvZ2_PlayerProperties);
  if (!ppResult.success && local.PvZ2_PlayerProperties) {
    result.PvZ2_PlayerProperties = local.PvZ2_PlayerProperties;
  }

  const settingsResult = validateSettings(remote.PvZ2_Settings);
  if (!settingsResult.success && local.PvZ2_Settings) {
    result.PvZ2_Settings = local.PvZ2_Settings;
  }

  return result;
}
