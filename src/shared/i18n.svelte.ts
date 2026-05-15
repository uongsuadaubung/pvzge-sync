import { z } from "zod";

const LangSchema = z.object({
  app_name: z.string(),
  last_sync: z.string(),
  no_sync: z.string(),
  status_no_github: z.string(),
  status_connected: z.string(),
  cloud_sync: z.string(),
  btn_upload: z.string(),
  btn_download: z.string(),
  offline_backup: z.string(),
  btn_export: z.string(),
  btn_import: z.string(),
  settings_title: z.string(),
  help_no_token: z.string(),
  help_click_here: z.string(),
  help_step1: z.string(),
  help_step2: z.string(),
  btn_save: z.string(),
  lang_label: z.string(),
  detect_changes: z.string(),
  choose_version: z.string(),
  card_local: z.string(),
  card_remote: z.string(),
  not_selected: z.string(),
  selected: z.string(),
  btn_confirm_simple: z.string(),
  btn_cancel: z.string(),
  msg_invalid_json: z.string(),
  msg_game_not_open: z.string(),
  not_game_page_title: z.string(),
  not_game_page_body: z.string(),
  schema_error_title: z.string(),
  btn_sync: z.string(),
  token_validating: z.string(),
  token_invalid: z.string(),
  token_label: z.string(),
  btn_go_back: z.string(),
  btn_logout: z.string(),
  connected_as: z.string(),
  schema_error_body: z.string(),
});

type Lang = z.infer<typeof LangSchema>;

export enum SupportLanguage {
  En = "en",
  Vi = "vi",
}

export type TranslationKey = keyof Lang;

const loaders: Record<SupportLanguage, () => Promise<unknown>> = {
  [SupportLanguage.En]: () => import("../locales/en.json").then((m) => m.default),
  [SupportLanguage.Vi]: () => import("../locales/vi.json").then((m) => m.default),
};

let translations = $state<Partial<Lang>>({});

export async function setLanguage(code: SupportLanguage): Promise<void> {
  const raw = await loaders[code]();
  translations = LangSchema.parse(raw);
}

export function t(key: TranslationKey): string {
  return translations[key] ?? key;
}
