import { createSignal } from "solid-js";
import { t } from "@/shared/i18n.ts";
import { appStoreActions } from "@/shared/store.ts";
import Button from "@/components/Button.tsx";
import Checkbox from "@/components/Checkbox.tsx";

interface Props {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogoutDialog(props: Props) {
  const [saving, setSaving] = createSignal(false);
  const [clearProgressChecked, setClearProgressChecked] = createSignal(true);

  async function handleLogout() {
    try {
      setSaving(true);
      await appStoreActions.logout(clearProgressChecked());
      props.onSuccess();
    } catch (e: unknown) {
      console.error("[LogoutDialog] Logout failed:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {props.show && (
        <div class="dialog-overlay" onClick={props.onClose}>
          <div class="dialog-box warning" onClick={(e) => e.stopPropagation()}>
            <div class="dialog-header">
              <span class="dialog-icon">⚠️</span>
              <h3>{t("dialog_title_warning")}</h3>
            </div>

            <div class="dialog-body">
              <p>{t("msg_logout_warning")}</p>

              <div
                style={{
                  "margin-top": "16px",
                  "display": "flex",
                  "flex-direction": "column",
                  "gap": "8px",
                }}
              >
                <Checkbox
                  id="check-clear-progress"
                  checked={clearProgressChecked()}
                  label={t("check_clear_progress_label")}
                  onchange={setClearProgressChecked}
                />
              </div>
            </div>

            <div class="dialog-footer">
              <Button
                variant="outline"
                disabled={saving()}
                onClick={props.onClose}
              >
                {t("btn_cancel")}
              </Button>
              <Button
                variant={clearProgressChecked() ? "danger" : "primary"}
                disabled={saving()}
                onClick={handleLogout}
              >
                {saving()
                  ? t("dialog_loading") || "..."
                  : t("btn_logout_confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
