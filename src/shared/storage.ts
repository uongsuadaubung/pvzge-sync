import { z } from "zod";
import { SupportLanguage } from "./i18n.svelte";

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

export async function getLanguage(): Promise<SupportLanguage | undefined> {
  const { language } = await chrome.storage.local.get("language");
  return z.enum(SupportLanguage).safeParse(language).data;
}

// --- setters ---

export async function setGistId(gistId: string) {
  await chrome.storage.local.set({ gistId });
}

export async function setLastSync() {
  await chrome.storage.local.set({ lastSync: Date.now() });
}

export async function setGithubSettings(githubToken: string, language: string) {
  await chrome.storage.local.set({ githubToken, language });
}
