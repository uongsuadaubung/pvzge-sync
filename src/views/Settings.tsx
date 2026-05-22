import { createSignal, onMount } from "solid-js";
import { SupportLanguage, t } from "@/shared/i18n.ts";
import { appStore, appStoreActions, setAppStore } from "@/shared/store.ts";
import Header from "@/components/Header.tsx";
import Button from "@/components/Button.tsx";
import UserProfile from "@/components/UserProfile.tsx";
import { type SyncResponse, View } from "@/shared/types.ts";
import NumberInput from "@/components/NumberInput.tsx";
import Select from "@/components/Select.tsx";
import Checkbox from "@/components/Checkbox.tsx";
import Input from "@/components/Input.tsx";

export default function Settings() {
  const [tokenInput, setTokenInput] = createSignal("");
  const [langInput, setLangInput] = createSignal(SupportLanguage.En);
  const [autoSyncEnabled, setAutoSyncEnabled] = createSignal(false);
  const [autoSyncInterval, setAutoSyncInterval] = createSignal(30);
  const [autoCollectEnabled, setAutoCollectEnabled] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [tokenError, setTokenError] = createSignal("");

  const langOptions = [
    { value: "en", label: "English" },
    { value: "vi", label: "Tiếng Việt" },
  ];

  onMount(() => {
    setTokenInput(appStore.githubToken);
    setLangInput(appStore.language);
    setAutoSyncEnabled(appStore.autoSyncEnabled);
    setAutoSyncInterval(appStore.autoSyncInterval);
    setAutoCollectEnabled(appStore.autoCollectEnabled);
  });

  async function save() {
    const token = tokenInput().trim();
    setTokenError("");

    // Chỉ validate nếu token thay đổi và không rỗng
    if (token && token !== appStore.githubToken) {
      setSaving(true);
      const r: SyncResponse = await new Promise((resolve) =>
        chrome.runtime.sendMessage({ type: "VALIDATE_TOKEN", token }, resolve)
      );
      setSaving(false);
      if (!r.success) {
        const err = r.error;
        setTokenError(
          err === "token_invalid"
            ? t("token_invalid")
            : (err ?? t("token_invalid")),
        );
        return;
      }
      setAppStore("githubUser", "githubUser" in r ? r.githubUser : null);
    }

    await appStoreActions.updateSettings(
      token,
      langInput(),
      autoSyncEnabled(),
      autoSyncInterval(),
      autoCollectEnabled(),
    );
    appStoreActions.navigate(View.Main);
  }

  return (
    <div class="container">
      <Header
        showBack
        title={t("settings_title")}
      />

      <main>
        <div class="input-group">
          <label for="select-lang">{t("lang_label")}</label>
          <Select
            id="select-lang"
            value={langInput()}
            options={langOptions}
            onchange={setLangInput}
          />
        </div>

        <div class="input-group">
          <Checkbox
            id="check-autosync"
            checked={autoSyncEnabled()}
            label={t("auto_sync_label")}
            onchange={setAutoSyncEnabled}
          />
        </div>

        {autoSyncEnabled() && (
          <div class="input-group">
            <label for="input-interval">{t("auto_sync_interval")}</label>
            <NumberInput
              id="input-interval"
              value={autoSyncInterval()}
              min={1}
              step={1}
              fullWidth
              onchange={setAutoSyncInterval}
            />
          </div>
        )}

        <div class="input-group">
          <Checkbox
            id="check-autocollect"
            checked={autoCollectEnabled()}
            label={t("auto_collect")}
            onchange={setAutoCollectEnabled}
          />
        </div>

        <div class="input-group">
          <label for="input-token">{t("token_label")}</label>
          {appStore.githubConnected
            ? (
              <>
                <UserProfile user={appStore.githubUser} showConnectedText />
                <Button
                  variant="danger"
                  fullWidth
                  onclick={() => {
                    appStoreActions.logout();
                    setTokenInput("");
                    setAutoSyncEnabled(false);
                  }}
                >
                  {t("btn_logout")}
                </Button>
              </>
            )
            : (
              <>
                <Input
                  id="input-token"
                  type="password"
                  value={tokenInput()}
                  placeholder="ghp_xxxxxxxxxxxx"
                  error={!!tokenError()}
                  oninput={(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    setTokenInput(target.value);
                    setTokenError("");
                  }}
                />
                {tokenError() && <p class="token-error">{tokenError()}</p>}
                <div class="help-box">
                  <p>
                    {t("help_no_token")}{" "}
                    <a
                      href="https://github.com/settings/tokens/new?description=PVZGE%20Sync&scopes=gist"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("help_click_here")}
                    </a>
                  </p>
                  <ul style={{ "padding-left": "16px" }}>
                    <li>{t("help_step1")}</li>
                    <li>{t("help_step2")}</li>
                  </ul>
                </div>
              </>
            )}
        </div>

        <div class="input-group">
          <Button
            fullWidth
            onclick={save}
            disabled={saving()}
          >
            {saving() ? t("token_validating") : t("btn_save")}
          </Button>
        </div>
      </main>
    </div>
  );
}
