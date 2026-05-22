import * as fs from "node:fs";
import * as path from "node:path";
import * as esbuild from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import * as sass from "sass";
import AdmZip from "adm-zip";

const __dirname = import.meta.dirname || ".";
const distDir = path.join(__dirname, "dist");
const chromeDir = path.join(distDir, "chrome");
const firefoxDir = path.join(distDir, "firefox");
const srcDir = path.join(__dirname, "src");

// 1. Clean and create directories
[distDir, chromeDir, firefoxDir].forEach((dir) => {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  fs.mkdirSync(dir, { recursive: true });
});

async function runBuild() {
  console.log("Compiling SCSS...");
  try {
    const compiled = sass.compile(path.join(srcDir, "styles", "app.scss"), {
      sourceMap: false,
    });

    fs.writeFileSync(path.join(chromeDir, "popup.css"), compiled.css);
    fs.writeFileSync(path.join(chromeDir, "guide.css"), compiled.css);
    fs.writeFileSync(path.join(firefoxDir, "popup.css"), compiled.css);
    fs.writeFileSync(path.join(firefoxDir, "guide.css"), compiled.css);
    console.log("✓ SCSS compilation successful.");
  } catch (e) {
    console.error("SCSS compilation failed:", e);
    Deno.exit(1);
  }

  console.log("Bundling with esbuild...");

  // Entry points for bundling
  const entryPoints = [
    "extension/background.ts",
    "extension/content.ts",
    "popup-entry.tsx",
    "guide-entry.tsx",
  ].map((file) => path.join(srcDir, file));

  // Custom path-alias resolver plugin for esbuild
  const pathAliasPlugin = {
    name: "path-alias",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /^@\// }, (args) => {
        const relativePath = args.path.substring(2); // remove "@/"
        const resolvedPath = path.join(srcDir, relativePath);
        return { path: resolvedPath };
      });
    },
  };

  // Common esbuild config
  const commonConfig = {
    entryPoints,
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: "browser" as const,
    target: ["esnext"],
    plugins: [pathAliasPlugin, solidPlugin()],
  };

  try {
    // Build for Chrome
    await esbuild.build({
      ...commonConfig,
      outdir: chromeDir,
      entryNames: "[name]",
      outExtension: { ".js": ".js" },
    });

    // Rename popup-entry.js → popup.js
    fs.renameSync(
      path.join(chromeDir, "popup-entry.js"),
      path.join(chromeDir, "popup.js"),
    );
    // Rename guide-entry.js → guide.js
    fs.renameSync(
      path.join(chromeDir, "guide-entry.js"),
      path.join(chromeDir, "guide.js"),
    );

    // Build for Firefox
    await esbuild.build({
      ...commonConfig,
      outdir: firefoxDir,
      entryNames: "[name]",
      outExtension: { ".js": ".js" },
    });

    fs.renameSync(
      path.join(firefoxDir, "popup-entry.js"),
      path.join(firefoxDir, "popup.js"),
    );
    fs.renameSync(
      path.join(firefoxDir, "guide-entry.js"),
      path.join(firefoxDir, "guide.js"),
    );

    console.log("✓ JS/TS bundling successful.");
  } catch (err) {
    console.error("Esbuild bundling failed:", err);
    esbuild.stop();
    Deno.exit(1);
  } finally {
    esbuild.stop();
  }

  console.log("Copying assets...");
  const assets = ["manifest.json", "popup.html", "guide.html"];

  function copyAssets(targetDir: string, isFirefox = false) {
    assets.forEach((file) => {
      let content: string;
      if (file === "manifest.json") {
        const manifest = JSON.parse(
          fs.readFileSync(path.join(srcDir, file), "utf8"),
        );
        if (isFirefox) {
          manifest.browser_specific_settings = {
            gecko: {
              id: "pvzge-sync@uongsuadaubung.github.io",
              strict_min_version: "142.0",
              data_collection_permissions: {
                required: ["none"],
              },
            },
          };
          manifest.background = {
            scripts: ["background.js"],
            type: "module",
          };
          manifest.permissions = manifest.permissions.filter(
            (p: string) => p !== "declarativeContent",
          );
          delete manifest.host_permissions;
        }
        content = JSON.stringify(manifest, null, 2);
      } else {
        content = fs.readFileSync(path.join(srcDir, file), "utf8");
      }
      fs.writeFileSync(path.join(targetDir, file), content);
    });

    // Copy icons
    const iconsTarget = path.join(targetDir, "icons");
    fs.mkdirSync(iconsTarget, { recursive: true });
    const iconsSrc = path.join(srcDir, "icons");
    if (fs.existsSync(iconsSrc)) {
      fs.readdirSync(iconsSrc).forEach((icon) => {
        fs.copyFileSync(
          path.join(iconsSrc, icon),
          path.join(iconsTarget, icon),
        );
      });
    }

    // Copy images
    const imagesTarget = path.join(targetDir, "images");
    fs.mkdirSync(imagesTarget, { recursive: true });
    const imagesSrc = path.join(srcDir, "images");
    if (fs.existsSync(imagesSrc)) {
      fs.readdirSync(imagesSrc).forEach((img) => {
        fs.copyFileSync(
          path.join(imagesSrc, img),
          path.join(imagesTarget, img),
        );
      });
    }
  }

  copyAssets(chromeDir);
  copyAssets(firefoxDir, true);

  console.log("Creating ZIP packages...");
  try {
    const chromeZip = new AdmZip();
    chromeZip.addLocalFolder(chromeDir);
    chromeZip.writeZip(path.join(distDir, "chrome.zip"));

    const firefoxZip = new AdmZip();
    firefoxZip.addLocalFolder(firefoxDir);
    firefoxZip.writeZip(path.join(distDir, "firefox.zip"));
    console.log("✓ ZIP packaging successful.");
  } catch (zipErr) {
    console.error("ZIP packaging failed:", zipErr);
    Deno.exit(1);
  }

  console.log("Done! Files in /dist:");
  console.log("  - chrome/        (unpacked directory)");
  console.log("  - firefox/       (unpacked directory)");
  console.log("  - chrome.zip     (packed for Chrome)");
  console.log("  - firefox.zip    (packed for Firefox)");
}

runBuild().catch((err) => {
  console.error("Build failed:", err);
  Deno.exit(1);
});
