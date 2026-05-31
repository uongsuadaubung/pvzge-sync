import { z } from "zod";
import { createSignal } from "solid-js";

const LangSchema = z.object({
  app_name: z.string(),
  last_sync: z.string(),
  next_sync_in: z.string(),
  no_sync: z.string(),
  status_no_github: z.string(),
  status_connected: z.string(),
  cloud_sync: z.string(),
  btn_upload: z.string(),
  btn_download: z.string(),
  offline_backup: z.string(),
  btn_export: z.string(),
  btn_import: z.string(),
  btn_manage_backup: z.string(),
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
  conflict_title: z.string(),
  conflict_desc: z.string(),
  conflict_use_local: z.string(),
  conflict_use_local_desc: z.string(),
  conflict_use_cloud: z.string(),
  conflict_use_cloud_desc: z.string(),
  msg_invalid_json: z.string(),
  msg_game_not_open: z.string(),
  not_game_page_title: z.string(),
  not_game_page_body: z.string(),
  not_game_page_body_prefix: z.string(),
  not_game_page_body_suffix: z.string(),
  schema_error_title: z.string(),
  btn_sync: z.string(),
  advanced_title: z.string(),
  btn_force_upload: z.string(),
  btn_force_download: z.string(),
  msg_force_upload_confirm: z.string(),
  msg_force_download_confirm: z.string(),
  msg_force_upload_success: z.string(),
  msg_force_download_success: z.string(),
  token_validating: z.string(),
  token_invalid: z.string(),
  token_label: z.string(),
  btn_go_back: z.string(),
  btn_logout: z.string(),
  connected_as: z.string(),
  auto_sync_label: z.string(),
  auto_sync_interval: z.string(),
  auto_sync_mins: z.string(),
  schema_error_body: z.string(),
  auto_collect: z.string(),
  btn_auto_collect_on: z.string(),
  btn_auto_collect_off: z.string(),
  group_tools: z.string(),
  group_sync: z.string(),
  guide_title: z.string(),
  guide_welcome: z.string(),
  guide_subtitle: z.string(),
  guide_step1_title: z.string(),
  guide_step1_desc: z.string(),
  guide_step2_title: z.string(),
  guide_step2_desc: z.string(),
  guide_step3_title: z.string(),
  guide_step3_desc: z.string(),
  guide_btn_start: z.string(),
  guide_close_page: z.string(),
  guide_quick_action_desc: z.string(),
  guide_open_game_btn: z.string(),
  guide_tab_general: z.string(),
  guide_tab_token: z.string(),
  guide_tab_features: z.string(),
  guide_tab_faq: z.string(),
  guide_tab_policy: z.string(),
  guide_tab_docker: z.string(),
  guide_docker_title: z.string(),
  guide_docker_desc: z.string(),
  guide_docker_step1_title: z.string(),
  guide_docker_step1_desc: z.string(),
  guide_docker_step2_title: z.string(),
  guide_docker_step2_desc: z.string(),
  guide_docker_local_title: z.string(),
  guide_docker_local_desc: z.string(),
  policy_title: z.string(),
  policy_desc: z.string(),
  policy_item1_title: z.string(),
  policy_item1_desc: z.string(),
  policy_item2_title: z.string(),
  policy_item2_desc: z.string(),
  policy_item3_title: z.string(),
  policy_item3_desc: z.string(),
  policy_item4_title: z.string(),
  policy_item4_desc: z.string(),
  policy_summary: z.string(),
  guide_token_title: z.string(),
  guide_token_desc: z.string(),
  guide_token_step1_title: z.string(),
  guide_token_step1_desc: z.string(),
  guide_token_step1_btn: z.string(),
  guide_token_step1_img_info: z.string(),
  guide_token_step2_title: z.string(),
  guide_token_step2_desc: z.string(),
  guide_token_step2_img_info: z.string(),
  guide_token_step3_title: z.string(),
  guide_token_step3_desc: z.string(),
  guide_token_step3_img_info: z.string(),
  guide_token_step4_title: z.string(),
  guide_token_step4_desc: z.string(),
  guide_token_step4_img_info: z.string(),
  guide_token_important_note: z.string(),
  guide_token_note_desc: z.string(),
  guide_features_title: z.string(),
  guide_features_desc: z.string(),
  guide_feature1_title: z.string(),
  guide_feature1_desc: z.string(),
  guide_feature1_how_to: z.string(),
  guide_feature1_how_to_desc: z.string(),
  guide_feature1_smart: z.string(),
  guide_feature1_smart_desc: z.string(),
  guide_feature2_title: z.string(),
  guide_feature2_desc: z.string(),
  guide_feature2_how_to: z.string(),
  guide_feature2_how_to_desc: z.string(),
  guide_feature2_secure: z.string(),
  guide_feature2_secure_desc: z.string(),
  guide_feature3_title: z.string(),
  guide_feature3_desc: z.string(),
  guide_feature3_export: z.string(),
  guide_feature3_export_desc: z.string(),
  guide_feature3_import: z.string(),
  guide_feature3_import_desc: z.string(),
  guide_feature4_title: z.string(),
  guide_feature4_desc: z.string(),
  guide_feature4_how_to: z.string(),
  guide_feature4_how_to_desc: z.string(),
  guide_feature4_limit: z.string(),
  guide_feature4_limit_desc: z.string(),
  guide_feature5_title: z.string(),
  guide_feature5_desc: z.string(),
  guide_feature5_upload: z.string(),
  guide_feature5_upload_desc: z.string(),
  guide_feature5_download: z.string(),
  guide_feature5_download_desc: z.string(),
  guide_faq_title: z.string(),
  guide_faq_desc: z.string(),
  guide_faq1_q: z.string(),
  guide_faq1_a: z.string(),
  guide_faq2_q: z.string(),
  guide_faq2_a: z.string(),
  guide_faq3_q: z.string(),
  guide_faq3_a: z.string(),
  guide_faq4_q: z.string(),
  guide_faq4_a: z.string(),
  guide_faq5_q: z.string(),
  guide_faq5_a: z.string(),
  guide_faq6_q: z.string(),
  guide_faq6_a: z.string(),
  dialog_title_info: z.string(),
  dialog_title_warning: z.string(),
  dialog_title_error: z.string(),
  dialog_title_success: z.string(),
  dialog_btn_ok: z.string(),
  msg_sync_success_upload: z.string(),
  msg_sync_success_download: z.string(),
  msg_sync_no_changes: z.string(),
  msg_export_success: z.string(),
  msg_import_success: z.string(),
  msg_token_not_configured: z.string(),
  msg_cloud_save_not_found: z.string(),
  msg_gist_file_not_found: z.string(),
  btn_history: z.string(),
  history_title: z.string(),
  history_empty: z.string(),
  history_loading: z.string(),
  history_overwrite_confirm: z.string(),
  history_overwrite_success: z.string(),
  history_coins: z.string(),
  history_gems: z.string(),
  history_sprouts: z.string(),
  history_plants: z.string(),
  status_auto_sync_download_blocked: z.string(),
  status_auto_sync_conflict: z.string(),
  status_auto_sync_success_upload: z.string(),
  status_auto_sync_no_changes: z.string(),
  status_auto_sync_identical: z.string(),
  status_auto_sync_empty_local: z.string(),
  msg_logout_warning: z.string(),
  check_clear_progress_label: z.string(),
  btn_logout_confirm: z.string(),
  dialog_loading: z.string(),
});

type Lang = z.infer<typeof LangSchema>;

export enum SupportLanguage {
  En = "en",
  Vi = "vi",
}

export const SupportLanguageSchema = z.enum(SupportLanguage);

export type TranslationKey = keyof Lang;

export function isTranslationKey(key: string): key is TranslationKey {
  return key in LangSchema.shape;
}

const loaders: Record<SupportLanguage, () => Promise<unknown>> = {
  [SupportLanguage.En]: () =>
    import("@/locales/en.json").then((m) => m.default),
  [SupportLanguage.Vi]: () =>
    import("@/locales/vi.json").then((m) => m.default),
};

const [translations, setTranslations] = createSignal<Partial<Lang>>({});
const [currentLanguageCode, setCurrentLanguageCode] = createSignal<
  SupportLanguage
>(SupportLanguage.En);

export async function setLanguage(code: SupportLanguage): Promise<void> {
  const raw = await loaders[code]();
  setTranslations(LangSchema.parse(raw));
  setCurrentLanguageCode(code);
}

export function t(key: TranslationKey): string {
  return translations()[key] ?? key;
}

/**
 * Định dạng ngày giờ tự động dựa trên ngôn ngữ/khu vực hoạt động hiện tại.
 * - Tiếng Việt (vi): DD/MM/YYYY HH:mm:ss (Định dạng Việt Nam)
 * - Tiếng Anh (en): MM/DD/YYYY, HH:mm:ss (Định dạng Mỹ/Quốc tế)
 */
export function formatDateTime(dateInput: Date | number | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const locale = currentLanguageCode() === SupportLanguage.Vi
    ? "vi-VN"
    : "en-US";
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
