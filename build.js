import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, extname, basename, resolve } from 'path';
import CleanCSS from 'clean-css';
import sharp from 'sharp';
import glob from 'fast-glob';

import siteData from './site/_data/site.js';
const site = siteData;
const theme = '_themes/' + (process.env.THEME || site.theme);
const destPath = '_site';

const command = process.argv[2];

// --- Clean ---
function clean() {
  if (existsSync(destPath)) {
    rmSync(destPath, { recursive: true, force: true });
  }
  mkdirSync(destPath, { recursive: true });
}

// --- Copy static files ---
function justCopy() {
  const files = [
    `site/${theme}/favicon.ico`,
    `site/${theme}/favicon-32x32.png`,
    `site/${theme}/apple-touch-icon.png`,
    `site/robots.txt`,
    `site/humans.txt`,
  ];
  for (const f of files) {
    if (existsSync(f)) {
      cpSync(f, join(destPath, basename(f)));
    }
  }
  // Copy fonts
  const fontDir = `site/${theme}/fonts`;
  if (existsSync(fontDir)) {
    const outFontDir = join(destPath, 'fonts');
    mkdirSync(outFontDir, { recursive: true });
    for (const f of readdirSync(fontDir)) {
      if (f.endsWith('.woff') || f.endsWith('.woff2')) {
        cpSync(join(fontDir, f), join(outFontDir, f));
      }
    }
  }
}

// --- Build CSS ---
function buildCSS() {
  const cssFiles = [
    `site/${theme}/css/fonts.css`,
    `site/${theme}/css/poole.css`,
    `site/${theme}/css/hyde.css`,
    `site/${theme}/css/styles.css`,
    `./node_modules/highlight.js/styles/github.min.css`,
  ];

  let combined = '';
  for (const f of cssFiles) {
    if (existsSync(f)) {
      combined += readFileSync(f, 'utf8') + '\n';
    }
  }

  const result = new CleanCSS({
    level: { 2: { restructureRules: true } }
  }).minify(combined);

  if (result.errors.length) {
    console.error('CSS errors:', result.errors);
  }

  const outDir = join('site', theme, 'layouts', 'css');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'styles.css'), result.styles);
  console.log(`[CSS] Built ${result.styles.length} bytes`);
}

// --- Build HTML (Eleventy) ---
function buildHTML() {
  execSync('npx @11ty/eleventy --quiet', { stdio: 'inherit' });
}

function buildHTMLSpawn() {
  return spawn('npx', ['@11ty/eleventy', '--quiet'], {
    shell: true,
    stdio: 'inherit'
  });
}

// --- Build Images ---
async function buildImages() {
  const images = glob.sync(['site/posts/**/*.jpg', 'site/pages/**/*.jpg']);
  let count = 0;

  for (const img of images) {
    const rel = img.replace(/^site\/(?:posts|pages)\//, '');
    const name = basename(rel, extname(rel));
    const dir = dirname(rel);
    const outDir = join(destPath, 'images', dir);
    mkdirSync(outDir, { recursive: true });

    const input = sharp(img);

    const variants = [
      { width: 720, suffix: '-720x', format: 'jpeg' },
      { width: 330, suffix: '-330x', format: 'webp' },
      { width: 720, suffix: '-720x', format: 'webp' },
      { width: 660, suffix: '-330x@2x', format: 'webp' },
      { width: 990, suffix: '-330x@3x', format: 'webp' },
    ];

    for (const v of variants) {
      const ext = v.format === 'jpeg' ? '.jpg' : '.webp';
      const outFile = join(outDir, `${name}${v.suffix}${ext}`);
      if (existsSync(outFile)) continue;

      let pipeline = sharp(img).resize(v.width);
      if (v.format === 'webp') {
        pipeline = pipeline.webp();
      } else {
        pipeline = pipeline.jpeg();
      }
      await pipeline.toFile(outFile);
      count++;
    }
  }
  console.log(`[Images] Processed ${count} image variants`);
}

// --- Serve with BrowserSync ---
async function serve() {
  const bs = (await import('browser-sync')).default.create();
  bs.init({
    server: destPath,
    files: [
      `${destPath}/**/*.html`,
      `${destPath}/css/*.css`,
      `${destPath}/images/*`
    ],
    open: false,
    port: 3000,
    ui: { port: 3001 }
  });
  return bs;
}

// --- Watch ---
async function watchFiles(bs) {
  const chokidar = (await import('chokidar')).default;

  chokidar.watch(['site/**/*.{md,njk,11tydata.js}', '_11ty/**/*.js', 'eleventy.config.js'], {
    ignoreInitial: true
  }).on('all', () => {
    console.log('[Watch] Rebuilding HTML...');
    try {
      buildHTML();
      if (bs) bs.reload();
    } catch (e) {
      console.error('[Watch] HTML build error:', e.message);
    }
  });

  chokidar.watch(`site/${theme}/css/*.css`, {
    ignoreInitial: true
  }).on('all', () => {
    console.log('[Watch] Rebuilding CSS...');
    try {
      buildCSS();
      buildHTML();
      if (bs) bs.reload();
    } catch (e) {
      console.error('[Watch] CSS build error:', e.message);
    }
  });

  chokidar.watch('site/{posts,pages}/**/*.jpg', {
    ignoreInitial: true
  }).on('all', async () => {
    console.log('[Watch] Processing images...');
    try {
      await buildImages();
      if (bs) bs.reload();
    } catch (e) {
      console.error('[Watch] Image build error:', e.message);
    }
  });
}

// --- Main ---
async function main() {
  if (command === 'build') {
    clean();
    justCopy();
    buildCSS();
    buildHTML();
    await buildImages();
    console.log('[Build] Done.');
  } else if (command === 'live') {
    clean();
    justCopy();
    buildCSS();
    buildHTML();
    await buildImages();
    const bs = await serve();
    await watchFiles(bs);
    console.log('[Live] Watching for changes...');
  } else {
    console.log('Usage: node build.js [build|live]');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
