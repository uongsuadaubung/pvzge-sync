import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { build, type PluginBuild, stop } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import { compile } from "sass";
import AdmZip from "adm-zip";

const __dirname = import.meta.dirname || ".";
const distDir = join(__dirname, "dist");
const chromeDir = join(distDir, "chrome");
const firefoxDir = join(distDir, "firefox");
const srcDir = join(__dirname, "src");

// 1. Clean and create directories
[distDir, chromeDir, firefoxDir].forEach((dir) => {
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
});

async function runBuild() {
  console.log("Compiling SCSS...");
  try {
    const compiled = compile(join(srcDir, "styles", "app.scss"), {
      sourceMap: false,
    });

    writeFileSync(join(chromeDir, "popup.css"), compiled.css);
    writeFileSync(join(chromeDir, "guide.css"), compiled.css);
    writeFileSync(join(firefoxDir, "popup.css"), compiled.css);
    writeFileSync(join(firefoxDir, "guide.css"), compiled.css);
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
  ].map((file) => join(srcDir, file));

  // Custom path-alias resolver plugin for esbuild
  const pathAliasPlugin = {
    name: "path-alias",
    setup(build: PluginBuild) {
      build.onResolve({ filter: /^@\// }, (args) => {
        const relativePath = args.path.substring(2); // remove "@/"
        const resolvedPath = join(srcDir, relativePath);
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
    await build({
      ...commonConfig,
      outdir: chromeDir,
      entryNames: "[name]",
      outExtension: { ".js": ".js" },
    });

    // Rename popup-entry.js → popup.js
    renameSync(
      join(chromeDir, "popup-entry.js"),
      join(chromeDir, "popup.js"),
    );
    // Rename guide-entry.js → guide.js
    renameSync(
      join(chromeDir, "guide-entry.js"),
      join(chromeDir, "guide.js"),
    );

    // Build for Firefox
    await build({
      ...commonConfig,
      outdir: firefoxDir,
      entryNames: "[name]",
      outExtension: { ".js": ".js" },
    });

    renameSync(
      join(firefoxDir, "popup-entry.js"),
      join(firefoxDir, "popup.js"),
    );
    renameSync(
      join(firefoxDir, "guide-entry.js"),
      join(firefoxDir, "guide.js"),
    );

    console.log("✓ JS/TS bundling successful.");
  } catch (err) {
    console.error("Esbuild bundling failed:", err);
    stop();
    Deno.exit(1);
  } finally {
    stop();
  }

  console.log("Copying assets...");
  const assets = ["manifest.json", "popup.html", "guide.html"];

  function copyAssets(targetDir: string, isFirefox = false) {
    assets.forEach((file) => {
      let content: string;
      if (file === "manifest.json") {
        const manifest = JSON.parse(
          readFileSync(join(srcDir, file), "utf8"),
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
        content = readFileSync(join(srcDir, file), "utf8");
      }
      writeFileSync(join(targetDir, file), content);
    });

    // Copy icons
    const iconsTarget = join(targetDir, "icons");
    mkdirSync(iconsTarget, { recursive: true });
    const iconsSrc = join(srcDir, "icons");
    if (existsSync(iconsSrc)) {
      readdirSync(iconsSrc).forEach((icon) => {
        copyFileSync(
          join(iconsSrc, icon),
          join(iconsTarget, icon),
        );
      });
    }

    // Copy images
    const imagesTarget = join(targetDir, "images");
    mkdirSync(imagesTarget, { recursive: true });
    const imagesSrc = join(srcDir, "images");
    if (existsSync(imagesSrc)) {
      readdirSync(imagesSrc).forEach((img) => {
        copyFileSync(
          join(imagesSrc, img),
          join(imagesTarget, img),
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
    chromeZip.writeZip(join(distDir, "chrome.zip"));

    const firefoxZip = new AdmZip();
    firefoxZip.addLocalFolder(firefoxDir);
    firefoxZip.writeZip(join(distDir, "firefox.zip"));
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
