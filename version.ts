import * as fs from "node:fs";
import * as path from "node:path";

const manifestPath = path.join(
  import.meta.dirname || ".",
  "src",
  "manifest.json",
);

if (!fs.existsSync(manifestPath)) {
  console.error("Error: src/manifest.json not found!");
  Deno.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const currentVersion = manifest.version;

if (!currentVersion) {
  console.error("Error: No version found in src/manifest.json!");
  Deno.exit(1);
}

const parts = currentVersion.split(".").map(Number);
if (parts.length !== 3 || parts.some(isNaN)) {
  console.error(
    `Error: Invalid version format in src/manifest.json: ${currentVersion}`,
  );
  Deno.exit(1);
}

let [major, minor, patch] = parts;
let type = "minor";
const args = Deno.args;

if (args.includes("--patch") || args.includes("patch")) {
  type = "patch";
} else if (args.includes("--major") || args.includes("major")) {
  type = "major";
} else if (args.includes("--minor") || args.includes("minor")) {
  type = "minor";
}

if (type === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (type === "minor") {
  minor += 1;
  patch = 0;
} else if (type === "patch") {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;

manifest.version = newVersion;
fs.writeFileSync(
  manifestPath,
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);
console.log(`✓ Updated src/manifest.json version to ${newVersion}`);

console.log(
  `\n🎉 Successfully bumped version from ${currentVersion} to ${newVersion} (${type.toUpperCase()})`,
);
