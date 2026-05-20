import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pkgPath = path.join(__dirname, 'package.json');
const manifestPath = path.join(__dirname, 'src', 'manifest.json');
const lockPath = path.join(__dirname, 'package-lock.json');

// Read files
if (!fs.existsSync(pkgPath)) {
    console.error('Error: package.json not found!');
    process.exit(1);
}
if (!fs.existsSync(manifestPath)) {
    console.error('Error: src/manifest.json not found!');
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const currentVersion = pkg.version;
if (!currentVersion) {
    console.error('Error: No version found in package.json!');
    process.exit(1);
}

// Parse version: major.minor.patch
const parts = currentVersion.split('.').map(Number);
if (parts.length !== 3 || parts.some(isNaN)) {
    console.error(`Error: Invalid version format in package.json: ${currentVersion}`);
    process.exit(1);
}

let [major, minor, patch] = parts;

// Determine release type (default is 'minor')
let type = 'minor';
const args = process.argv.slice(2);

if (args.includes('--patch') || args.includes('patch')) {
    type = 'patch';
} else if (args.includes('--major') || args.includes('major')) {
    type = 'major';
} else if (args.includes('--minor') || args.includes('minor')) {
    type = 'minor';
}

// Bump version
if (type === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
} else if (type === 'minor') {
    minor += 1;
    patch = 0;
} else if (type === 'patch') {
    patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;

// Update package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`✓ Updated package.json version to ${newVersion}`);

// Update src/manifest.json
manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`✓ Updated src/manifest.json version to ${newVersion}`);

// Update package-lock.json if it exists
if (fs.existsSync(lockPath)) {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lock.version = newVersion;
    if (lock.packages && lock.packages['']) {
        lock.packages[''].version = newVersion;
    }
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated package-lock.json version to ${newVersion}`);
}

console.log(`\n🎉 Successfully bumped version from ${currentVersion} to ${newVersion} (${type.toUpperCase()})`);
