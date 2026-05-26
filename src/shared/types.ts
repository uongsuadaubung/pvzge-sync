import { z } from "zod";
import { SaveDataSchema } from "@/domains/game/schema.ts";
import { GithubUserSchema } from "@/domains/github/schema.ts";
import type { GithubUser } from "@/domains/github/schema.ts";

export enum View {
  Main = "main",
  Settings = "settings",
  Guide = "guide",
  History = "history",
}

export const SyncMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("UPLOAD_TO_GIST"), data: SaveDataSchema }),
  z.object({ type: z.literal("APPLY_REMOTE_DATA"), data: SaveDataSchema }),
  z.object({ type: z.literal("DOWNLOAD_FROM_GIST") }),
  z.object({ type: z.literal("GET_LOCAL_DATA") }),
  z.object({ type: z.literal("VALIDATE_TOKEN"), token: z.string() }),
  z.object({ type: z.literal("GET_USER_INFO") }),
  z.object({ type: z.literal("SETTINGS_UPDATED") }),
  z.object({ type: z.literal("GAME_PAGE_LOADED") }),
]);

export const SyncResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: SaveDataSchema,
    gistUpdatedAt: z.number().optional(),
  }),
  z.object({ success: z.literal(true), githubUser: GithubUserSchema }),
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export type SyncMessage = z.infer<typeof SyncMessageSchema>;
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
export type { GithubUser };

export const SyncStatusTypeSchema = z.enum([
  "info",
  "success",
  "warning",
  "error",
]);
export type SyncStatusType = z.infer<typeof SyncStatusTypeSchema>;

export type DialogType = "alert" | "confirm";

export interface DialogConfig {
  show: boolean;
  title: string;
  message: string;
  type: DialogType;
  severity: SyncStatusType;
}
