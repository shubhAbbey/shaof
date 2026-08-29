import fs from 'node:fs';
import path from 'node:path';

export function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.name.endsWith('.json')) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

const cmsDir = fs.existsSync(path.join(process.cwd(), 'src'))
  ? process.cwd()
  : path.resolve(process.cwd(), 'apps/cms');
const srcDir = path.join(cmsDir, 'src');
const distSrcDir = path.join(cmsDir, 'dist', 'src');

copyDirRecursive(srcDir, distSrcDir);
console.log('✓ All schema and component JSON files copied to dist/src.');

/**
 * Ensures Strapi scoped packages are synchronized between workspace and root node_modules.
 * Resolves Strapi v5 monorepo module resolution where @strapi/core expects @strapi/strapi/package.json.
 */
export function syncStrapiModules() {
  const rootDir = fs.existsSync(path.join(process.cwd(), 'node_modules'))
    ? process.cwd()
    : path.resolve(cmsDir, '../..');
  const cmsStrapiDir = path.join(cmsDir, 'node_modules', '@strapi');
  const rootStrapiDir = path.join(rootDir, 'node_modules', '@strapi');

  if (fs.existsSync(cmsStrapiDir) && fs.existsSync(rootStrapiDir)) {
    // Link packages from apps/cms to root node_modules/@strapi
    for (const dir of fs.readdirSync(cmsStrapiDir)) {
      const target = path.join(cmsStrapiDir, dir);
      const link = path.join(rootStrapiDir, dir);
      if (!fs.existsSync(link)) {
        try {
          fs.symlinkSync(target, link, 'junction');
        } catch {
          // ignore if already linked
        }
      }
    }
    // Link packages from root to apps/cms node_modules/@strapi
    for (const dir of fs.readdirSync(rootStrapiDir)) {
      const target = path.join(rootStrapiDir, dir);
      const link = path.join(cmsStrapiDir, dir);
      if (!fs.existsSync(link)) {
        try {
          fs.symlinkSync(target, link, 'junction');
        } catch {
          // ignore if already linked
        }
      }
    }
    console.log('✓ Strapi monorepo module resolution synchronized.');
  }
}

syncStrapiModules();
