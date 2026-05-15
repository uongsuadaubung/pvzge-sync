import type { SaveData } from "@/domains/game/schema";

export enum View { Main = "main", Settings = "settings" }

export interface GithubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
}

export type SyncMessage =
  | { type: "UPLOAD_TO_GIST"; data: SaveData }
  | { type: "APPLY_REMOTE_DATA"; data: SaveData }
  | { type: "DOWNLOAD_FROM_GIST" }
  | { type: "GET_LOCAL_DATA" }
  | { type: "VALIDATE_TOKEN"; token: string }
  | { type: "GET_USER_INFO" };

export type SyncResponse =
  | { success: true; data: SaveData; gistUpdatedAt: number } // DOWNLOAD_FROM_GIST
  | { success: true; data: SaveData }                        // GET_LOCAL_DATA
  | { success: true; githubUser: GithubUser }                // GET_USER_INFO / VALIDATE_TOKEN
  | { success: true }                                        // UPLOAD_TO_GIST / APPLY_REMOTE_DATA
  | { success: false; error: string };
