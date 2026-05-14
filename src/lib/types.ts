import type { SaveData } from "./schema";

// Các giá trị có thể xuất hiện tại leaf node khi diff SaveData
export type ConflictValue = string | number | boolean | null | object;

export interface Conflict {
  path: string;
  local: ConflictValue;
  remote: ConflictValue;
}



export type SyncMessage =
  | { type: "UPLOAD_TO_GIST"; data: SaveData }
  | { type: "APPLY_REMOTE_DATA"; data: SaveData }
  | { type: "DOWNLOAD_FROM_GIST" }
  | { type: "GET_LOCAL_DATA" };

export interface SyncResponse {
  success: boolean;
  data?: SaveData;
  error?: string;
  gistUpdatedAt?: number; // unix ms — để so sánh với lastSync
}
