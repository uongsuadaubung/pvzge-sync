export interface SaveData {
  [key: string]: unknown;
}

export interface GistFile {
  content: string;
}

export interface Gist {
  id: string;
  description: string;
  files: Record<string, GistFile>;
}

export interface PvzDate {
  year: number;
  month: number;
  date: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export interface Conflict {
  path: string;
  local: unknown;
  remote: unknown;
  choice: 'local' | 'remote';
}

export interface SyncMessage {
  type: 'UPLOAD_TO_GIST' | 'DOWNLOAD_FROM_GIST' | 'GET_LOCAL_DATA' | 'VALIDATE_LOCAL_DATA' | 'APPLY_REMOTE_DATA' | 'CACHE_FOR_AUTOSYNC';
  data?: SaveData;
}

export interface SyncResponse {
  success: boolean;
  data?: SaveData;
  error?: string;
}
