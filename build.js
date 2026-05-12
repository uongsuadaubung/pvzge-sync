const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const esbuild = require('esbuild');

const distDir = path.join(__dirname, 'dist');
const chromeDir = path.join(distDir, 'chrome');
const firefoxDir = path.join(distDir, 'firefox');
const srcDir = path.join(__dirname, 'src');

// 1. Clean and create directories
[distDir, chromeDir, firefoxDir].forEach(dir => {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
    fs.mkdirSync(dir, { recursive: true });
});

async function runBuild() {
    console.log('Linting with ESLint...');
    try {
        execSync('npm run lint', { stdio: 'inherit' });
    } catch (e) {
        console.error('Linting failed. Build aborted.');
        process.exit(1);
    }

    console.log('Type checking with tsc...');
    try {
        execSync('npx tsc --noEmit', { stdio: 'inherit' });
    } catch (e) {
        console.error('Type checking failed. Build aborted.');
        process.exit(1);
    }

    console.log('Bundling with esbuild...');
    
    // Entry points for bundling
    const entryPoints = [
        'background.ts',
        'content.ts',
        'popup.ts',
        'conflict.ts',
        'i18n.ts'
    ].map(file => path.join(srcDir, file));

    // Common esbuild config
    const commonConfig = {
        entryPoints,
        bundle: true,
        minify: true, 
        sourcemap: false,
        platform: 'browser',
        target: ['esnext'],
    };

    // Build for Chrome
    await esbuild.build({
        ...commonConfig,
        outdir: chromeDir,
    });

    // Build for Firefox
    await esbuild.build({
        ...commonConfig,
        outdir: firefoxDir,
    });

    console.log('Copying assets...');
    const assets = [
        'manifest.json',
        'popup.html',
        'popup.css',
        'conflict.html',
        'conflict.css'
    ];

    function copyAssets(targetDir, isFirefox = false) {
        assets.forEach(file => {
            let content;
            if (file === 'manifest.json') {
                const manifest = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8'));
                if (isFirefox) {
                    manifest.browser_specific_settings = {
                        gecko: {
                            id: "pvzge-sync@kien.hm",
                            strict_min_version: "109.0"
                        }
                    };
                }
                content = JSON.stringify(manifest, null, 2);
            } else {
                content = fs.readFileSync(path.join(srcDir, file));
            }
            fs.writeFileSync(path.join(targetDir, file), content);
        });

        // Copy icons
        const iconsTarget = path.join(targetDir, 'icons');
        fs.mkdirSync(iconsTarget, { recursive: true });
        const iconsSrc = path.join(srcDir, 'icons');
        if (fs.existsSync(iconsSrc)) {
            fs.readdirSync(iconsSrc).forEach(icon => {
                fs.copyFileSync(path.join(iconsSrc, icon), path.join(iconsTarget, icon));
            });
        }
    }

    copyAssets(chromeDir);
    copyAssets(firefoxDir, true);

    // Create ZIP packages
    const AdmZip = require('adm-zip');
    const chromeZip = new AdmZip();
    chromeZip.addLocalFolder(chromeDir);
    chromeZip.writeZip(path.join(distDir, 'chrome.zip'));

    const firefoxZip = new AdmZip();
    firefoxZip.addLocalFolder(firefoxDir);
    firefoxZip.writeZip(path.join(distDir, 'firefox.zip'));

    console.log('Done! Files in /dist:');
    console.log('  - chrome/        (unpacked directory)');
    console.log('  - firefox/       (unpacked directory)');
    console.log('  - chrome.zip     (packed for Chrome)');
    console.log('  - firefox.zip    (packed for Firefox)');
}

runBuild().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
