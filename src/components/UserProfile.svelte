<script lang="ts">
  import type { GithubUser } from "@/shared/types";
  import { t } from "@/shared/i18n.svelte";

  interface Props {
    user: GithubUser | null;
    showBio?: boolean;
    showConnectedText?: boolean;
  }

  let { user, showBio = false, showConnectedText = false }: Props = $props();
</script>

<div class="user-profile">
  {#if user}
    <img src={user.avatar_url} alt="Avatar" class="avatar" />
    <div class="user-info">
      {#if showConnectedText}
        <span class="connected-text">{t("connected_as")}</span>
      {/if}
      <span class="username">{user.name ?? user.login}</span>
      {#if showBio && user.bio}
        <span class="user-bio">{user.bio}</span>
      {/if}
    </div>
  {:else}
    <div class="user-info">
      <span class="username">{t("status_connected")}</span>
    </div>
  {/if}
</div>
