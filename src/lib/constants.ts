// Merge
export const IGNORED_KEYS = ["date", "time"];

// Game
export const GAME_HOST = "play.pvzge.com";
export const GAME_URL_MATCH = "https://play.pvzge.com/*";
export const SAVE_KEYS = ["PvZ2_PlayerProperties", "PvZ2_Settings"] as const;

// GitHub API
export const GITHUB_API_BASE = "https://api.github.com";

// Gist
export const GIST_DESCRIPTION = "PVZGE Save Data Sync";
export const GIST_FILE_NAME = "pvzge_save.json";

// Auto-sync alarm
export const ALARM_NAME = "pvzge-periodic-sync";
export const SYNC_INTERVAL_MINUTES = 5;
