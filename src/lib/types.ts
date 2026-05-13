import type { SaveData } from "./schema";

export interface Conflict {
  path: string;
  local: unknown;
  remote: unknown;
}

export type SyncMessage =
  | { type: "UPLOAD_TO_GIST"; data: SaveData }
  | { type: "APPLY_REMOTE_DATA"; data: SaveData }
  | { type: "DOWNLOAD_FROM_GIST" }
  | { type: "GET_LOCAL_DATA" }
  | { type: "VALIDATE_LOCAL_DATA" };

export interface SyncResponse {
  success: boolean;
  data?: SaveData;
  error?: string;
}
