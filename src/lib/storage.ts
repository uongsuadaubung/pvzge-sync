import { z } from "zod";
import { SaveDataSchema } from "@/lib/schema";
import type { SaveData } from "@/lib/schema";

// --- getters ---

export async function getGithubToken(): Promise<string | undefined> {
  const { githubToken } = await chrome.storage.local.get("githubToken");
  return z.string().safeParse(githubToken).data;
}

export async function getGistId(): Promise<string | undefined> {
  const { gistId } = await chrome.storage.local.get("gistId");
  return z.string().safeParse(gistId).data;
}

export async function getLastSync(): Promise<number | undefined> {
  const { lastSync } = await chrome.storage.local.get("lastSync");
  return z.number().safeParse(lastSync).data;
}

export async function getLanguage(): Promise<string | undefined> {
  const { language } = await chrome.storage.local.get("language");
  return z.string().safeParse(language).data;
}

// Caller is responsible for calling removeAutoSyncData() after consuming the data.
export async function getAutoSyncData(tabId: number): Promise<SaveData | undefined> {
  const key = `autoSync_${tabId}`;
  const stored = await chrome.storage.local.get(key);
  const result = SaveDataSchema.safeParse(stored[key]);
  return result.success ? result.data : undefined;
}

// --- setters ---

export async function setGistId(gistId: string) {
  await chrome.storage.local.set({ gistId });
}

export async function setLastSync() {
  await chrome.storage.local.set({ lastSync: Date.now() });
}

export async function setAutoSyncData(tabId: number, data: SaveData) {
  await chrome.storage.local.set({ [`autoSync_${tabId}`]: data });
}

export async function setGithubSettings(githubToken: string, language: string) {
  await chrome.storage.local.set({ githubToken, language });
}

export async function setLanguage(language: string) {
  await chrome.storage.local.set({ language });
}

// --- removers ---

export async function removeAutoSyncData(tabId: number) {
  await chrome.storage.local.remove(`autoSync_${tabId}`);
}
