const translations: Record<string, Record<string, string>> = {
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
        help_step2: "Copy and paste code above.",
        btn_save: "Save Settings",
        lang_label: "Language",
        detect_changes: "Changes Detected",
        choose_version: "Which version do you want to use?",
        card_local: "Local",
        card_remote: "Cloud",
        not_selected: "Not Selected",
        selected: "SELECTED",
        btn_confirm_simple: "Confirm and Save",
        btn_advanced: "Advanced Merge &raquo;",
        btn_cancel: "Cancel",
        advanced_title: "Advanced Merge",
        advanced_desc: "Choose exactly which properties to keep.",
        btn_smart_select: "🪄 Smart Selection",
        btn_all_local: "Take All Local",
        btn_all_remote: "Take All Cloud",
        btn_back: "Back",
        btn_confirm_advanced: "Confirm and Save",
        diff_none: "No differences found.",
        msg_gist_not_found: "No save data found on Cloud. Please Upload first.",
        msg_invalid_json: "Error: Invalid JSON file.",
        msg_game_not_open: "Please open play.pvzge.com first."
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
        btn_advanced: "Tùy chỉnh chi tiết (Advanced Merge) &raquo;",
        btn_cancel: "Hủy bỏ",
        advanced_title: "Merge chi tiết",
        advanced_desc: "Chọn chính xác từng thuộc tính bạn muốn giữ lại.",
        btn_smart_select: "🪄 Chọn thông minh",
        btn_all_local: "Lấy tất cả Local",
        btn_all_remote: "Lấy tất cả Cloud",
        btn_back: "Quay lại",
        btn_confirm_advanced: "Xác nhận và Lưu",
        diff_none: "Không có sự khác biệt nào.",
        msg_gist_not_found: "Không tìm thấy bản lưu trên Cloud. Hãy Upload trước.",
        msg_invalid_json: "Lỗi: File JSON không hợp lệ.",
        msg_game_not_open: "Vui lòng mở trang play.pvzge.com trước."
    }
};

let currentLang = 'en';

async function initLanguage() {
    const data = await chrome.storage.local.get('language');
    currentLang = (data.language as string) || 'en';
}

export function t(key: string): string {
    const langData = translations[currentLang];
    if (!langData) return key;
    return langData[key] || key;
}

export async function getLanguage(): Promise<string> {
    const data = await chrome.storage.local.get('language');
    return (data.language as string) || 'en';
}

export async function applyTranslations() {
    await initLanguage();
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (key) el.innerHTML = t(key);
    });
}
