import { t } from "@/shared/i18n.ts";
import Header from "@/components/Header.tsx";

interface NoticeProps {
  warnMsg?: string;
  errorMsg?: string;
  localUrl?: string;
}

export default function Notice(props: NoticeProps) {
  return (
    <div class="container">
      <Header showLogo showSettings />

      {props.warnMsg
        ? (
          <div class="warn-banner">
            <strong>🎮 {t("not_game_page_title")}</strong>
            <br />
            {props.warnMsg === t("not_game_page_body")
              ? (
                <>
                  {t("not_game_page_body_prefix")}
                  <strong>play.pvzge.com</strong>
                  {props.localUrl && (
                    <>
                      {t("word_or")}
                      <strong>localhost</strong>
                    </>
                  )}
                  {t("not_game_page_body_suffix")}
                </>
              )
              : (
                props.warnMsg
              )}
            <div
              class="action-link"
              style="display: flex; flex-direction: column; gap: 8px;"
            >
              <a
                href="https://play.pvzge.com"
                target="_blank"
                style="text-align: center;"
              >
                {t("guide_open_game_btn")} 🚀
              </a>
              {props.localUrl && (
                <a
                  href={props.localUrl}
                  target="_blank"
                  style="text-align: center; background: var(--primary); color: var(--bg);"
                >
                  {t("btn_open_local_game")} 💻
                </a>
              )}
            </div>
          </div>
        )
        : props.errorMsg
        ? (
          <div class="error-banner">
            <strong>⚠️ {t("schema_error_title")}</strong>
            <br />
            {t("schema_error_body")}
            <br />
            <small>{props.errorMsg}</small>
          </div>
        )
        : null}
    </div>
  );
}
