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

<style lang="scss">
  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 16px;
    transition: border-color 0.2s;

    &:hover { border-color: var(--primary-dark); }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
      border: 2px solid var(--primary-dark);
      box-shadow: 0 0 8px var(--glow-primary);
    }

    .user-info {
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;

      .connected-text {
        font-size: 0.72rem;
        color: var(--text-dim);
      }

      .username {
        font-size: 0.95rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--text);
      }

      .user-bio {
        font-size: 0.74rem;
        color: var(--text-dim);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 1px;
      }
    }
  }
</style>
