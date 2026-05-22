import type { GithubUser } from "@/shared/types.ts";
import { t } from "@/shared/i18n.ts";

interface Props {
  user: GithubUser | null;
  showBio?: boolean;
  showConnectedText?: boolean;
}

export default function UserProfile(props: Props) {
  return (
    <div class="user-profile">
      {props.user
        ? (
          <>
            <img src={props.user.avatar_url} alt="Avatar" class="avatar" />
            <div class="user-info">
              {props.showConnectedText && (
                <span class="connected-text">{t("connected_as")}</span>
              )}
              <span class="username">{props.user.login}</span>
              {props.showBio && props.user.bio && (
                <span class="user-bio">{props.user.bio}</span>
              )}
            </div>
          </>
        )
        : (
          <div class="user-info">
            <span class="username">{t("status_connected")}</span>
          </div>
        )}
    </div>
  );
}
