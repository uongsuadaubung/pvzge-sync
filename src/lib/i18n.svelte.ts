interface Lang {
  app_name: string;
  last_sync: string;
  no_sync: string;
  status_no_github: string;
  status_connected: string;
  cloud_sync: string;
  btn_upload: string;
  btn_download: string;
  offline_backup: string;
  btn_export: string;
  btn_import: string;
  settings_title: string;
  help_no_token: string;
  help_click_here: string;
  help_step1: string;
  help_step2: string;
  btn_save: string;
  lang_label: string;
  detect_changes: string;
  choose_version: string;
  card_local: string;
  card_remote: string;
  not_selected: string;
  selected: string;
  btn_confirm_simple: string;
  btn_cancel: string;
  msg_invalid_json: string;
  msg_game_not_open: string;
  not_game_page_title: string;
  not_game_page_body: string;
  schema_error_title: string;
  btn_sync: string;
}

const translations: Record<"en" | "vi", Lang> = {
  en: {
    app_name: "PVZGE Sync",
    last_sync: "Last sync: ",
    no_sync: "Never synced",
    status_no_github: "GitHub not configured",
    status_connected: "GitHub Connected",
    cloud_sync: "Cloud Sync",
    btn_upload: "Upload to Cloud",
    btn_download: "Download from Cloud",
    offline_backup: "Offline Backup",
    btn_export: "Export JSON",
    btn_import: "Import JSON",
    settings_title: "GitHub Settings",
    help_no_token: "No Token?",
    help_click_here: "Click here to create",
    help_step1: "Select 'gist' scope.",
    help_step2: "Copy and paste the code above.",
    btn_save: "Save Settings",
    lang_label: "Language",
    detect_changes: "Changes Detected",
    choose_version: "Which version do you want to use?",
    card_local: "Local",
    card_remote: "Cloud",
    not_selected: "Not Selected",
    selected: "SELECTED",
    btn_confirm_simple: "Confirm and Save",
    btn_cancel: "Cancel",
    msg_invalid_json: "Error: Invalid JSON file.",
    msg_game_not_open: "Please open play.pvzge.com first.",
    not_game_page_title: "Not on Game Page",
    not_game_page_body: "Open <b>play.pvzge.com</b> to use sync features.",
    schema_error_title: "Update Required",
    btn_sync: "Sync",
  },
  vi: {
    app_name: "PVZGE Sync",
    last_sync: "Lần cuối: ",
    no_sync: "Chưa có bản đồng bộ nào",
    status_no_github: "Chưa cấu hình GitHub",
    status_connected: "GitHub Đã kết nối",
    cloud_sync: "Đồng bộ Đám mây",
    btn_upload: "Lưu lên Đám mây (Upload)",
    btn_download: "Tải về từ Đám mây (Download)",
    offline_backup: "Sao lưu Offline",
    btn_export: "Xuất file JSON",
    btn_import: "Nhập file JSON",
    settings_title: "Cài đặt GitHub",
    help_no_token: "Chưa có Token?",
    help_click_here: "Nhấn vào đây để tạo",
    help_step1: "Chọn quyền 'gist' khi tạo.",
    help_step2: "Copy và dán mã vào ô trên.",
    btn_save: "Lưu cài đặt",
    lang_label: "Ngôn ngữ",
    detect_changes: "Phát hiện thay đổi",
    choose_version: "Bạn muốn sử dụng bản lưu nào?",
    card_local: "Máy này (Local)",
    card_remote: "Đám mây (Cloud)",
    not_selected: "Chưa chọn",
    selected: "ĐÃ CHỌN",
    btn_confirm_simple: "Xác nhận và Chốt bản này",
    btn_cancel: "Hủy bỏ",
    msg_invalid_json: "Lỗi: File JSON không hợp lệ.",
    msg_game_not_open: "Vui lòng mở trang play.pvzge.com trước.",
    not_game_page_title: "Không phải trang game",
    not_game_page_body: "Mở <b>play.pvzge.com</b> để dùng tính năng đồng bộ.",
    schema_error_title: "Cần cập nhật Extension",
    btn_sync: "Đồng bộ",
  },
};
export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type SupportLanguage = typeof SUPPORTED_LANGUAGES[number];

let currentLang = $state<SupportLanguage>("en");

export function setLanguage(code: SupportLanguage) {
  currentLang = code;
}

export type TranslationKey = keyof Lang;

export function t(key: TranslationKey): string {
  return translations[currentLang]?.[key] ?? translations["en"]?.[key] ?? key;
}


