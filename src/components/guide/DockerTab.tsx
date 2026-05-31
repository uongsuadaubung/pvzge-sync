import { type Component, createSignal } from "solid-js";
import { t } from "@/shared/i18n.ts";

interface CodeBlockProps {
  code: string;
}

const CodeBlock: Component<CodeBlockProps> = (props) => {
  const [copied, setCopied] = createSignal(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(props.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div class="code-terminal-box">
      <pre><code>{props.code}</code></pre>
      <button class="copy-btn" onClick={copyToClipboard}>
        {copied() ? "✓ Copied" : "📋 Copy"}
      </button>
    </div>
  );
};

export const DockerTab: Component = () => {
  return (
    <section class="tab-panel fade-in">
      <div class="panel-header">
        <h2>🐳 {t("guide_docker_title")}</h2>
        <p>{t("guide_docker_desc")}</p>
      </div>

      <div class="steps-vertical">
        {/* STEP 1 */}
        <div class="vertical-step-card">
          <div class="step-index">1</div>
          <div class="step-content">
            <h3>{t("guide_docker_step1_title")}</h3>
            <p>{t("guide_docker_step1_desc")}</p>
            <CodeBlock code="docker run -d -p 8080:80 --name pvzge gaozih/pvzge:latest" />
          </div>
        </div>

        {/* STEP 2 */}
        <div class="vertical-step-card">
          <div class="step-index">2</div>
          <div class="step-content">
            <h3>{t("guide_docker_step2_title")}</h3>
            <p>{t("guide_docker_step2_desc")}</p>
            <CodeBlock code="podman run -d -p 8080:80 --name pvzge docker.io/gaozih/pvzge:latest" />
          </div>
        </div>

        {/* DETAILS */}
        <div class="vertical-step-card">
          <div class="step-index">🌟</div>
          <div class="step-content">
            <h3>{t("guide_docker_local_title")}</h3>
            <p>{t("guide_docker_local_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DockerTab;
