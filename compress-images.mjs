/**
 * Image Compression Script — City of Truth Ministries
 * Converts all PNG/JPG/JPEG in /public to WebP.
 * Run: node compress-images.mjs
 * Requires: npm install sharp  (one-time, dev only)
 */

import sharp from 'sharp';
import { readdir, stat, rename } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, 'public');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp']);
const LOGO_KEYWORDS = ['logo', 'icon', 'badge', 'emblem', 'seal'];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (IMAGE_EXTS.has(extname(e.name).toLowerCase())) files.push(full);
  }
  return files;
}

async function run() {
  const images = await walk(PUBLIC_DIR);
  console.log(`\nFound ${images.length} images...\n`);
  let totalSaved = 0, converted = 0;

  for (const file of images) {
    const info = await stat(file);
    const originalSize = info.size;
    const name = basename(file).toLowerCase();
    const isLogo = LOGO_KEYWORDS.some(k => name.includes(k));
    const outPath = file.replace(/\.(jpg|jpeg|png|gif|bmp)$/i, '.webp');

    try {
      await sharp(file).webp({ quality: isLogo ? 80 : 82, effort: 4 }).toFile(outPath);
      const newInfo = await stat(outPath);
      const saved = originalSize - newInfo.size;
      totalSaved += saved;
      converted++;
      const pct = ((saved / originalSize) * 100).toFixed(0);
      console.log(`✅ ${basename(file)} → ${basename(outPath)} | ${(originalSize/1024).toFixed(0)}KB → ${(newInfo.size/1024).toFixed(0)}KB (−${pct}%)`);
      await rename(file, file + '.bak'); // keep original as .bak for safety
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
    }
  }

  console.log(`\n✅ Done: ${converted}/${images.length} images | Saved: ${(totalSaved/1024/1024).toFixed(1)} MB`);
  console.log(`Originals kept as .bak — delete after verifying:`);
  console.log(`  Get-ChildItem public -Recurse -Filter "*.bak" | Remove-Item`);
}

run().catch(console.error);
