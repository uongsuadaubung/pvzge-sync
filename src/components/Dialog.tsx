import { t } from "@/shared/i18n.ts";
import Button from "@/components/Button.tsx";

interface Props {
  show: boolean;
  title: string;
  message: string;
  type?: "alert" | "confirm";
  severity?: "info" | "success" | "warning" | "error";
  onConfirm: (result: boolean) => void;
}

export default function Dialog(props: Props) {
  const type = () => props.type || "alert";
  const severity = () => props.severity || "info";

  function getSeverityIcon(sev: string) {
    switch (sev) {
      case "success":
        return "☀️"; // Sunflower Sun
      case "error":
        return "🧟"; // Zombie
      case "warning":
        return "⚠️"; // Alert Sign
      case "info":
      default:
        return "ℹ️"; // Info Sign
    }
  }

  return (
    <>
      {props.show && (
        <div
          class="dialog-overlay"
          onClick={() => {
            if (type() === "alert") props.onConfirm(true);
          }}
        >
          <div
            class={`dialog-box ${severity()}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div class="dialog-header">
              <span class="dialog-icon">{getSeverityIcon(severity())}</span>
              <h3>{props.title}</h3>
            </div>

            <div class="dialog-body">
              <p>{props.message}</p>
            </div>

            <div class="dialog-footer">
              {type() === "confirm"
                ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => props.onConfirm(false)}
                    >
                      {t("btn_cancel")}
                    </Button>
                    <Button
                      variant={severity() === "error" ||
                          severity() === "warning"
                        ? "danger"
                        : "primary"}
                      onClick={() => props.onConfirm(true)}
                    >
                      {t("dialog_btn_ok")}
                    </Button>
                  </>
                )
                : (
                  <Button
                    variant="primary"
                    onClick={() => props.onConfirm(true)}
                    fullWidth
                  >
                    {t("dialog_btn_ok")}
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
