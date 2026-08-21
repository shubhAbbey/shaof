import fs from 'node:fs';
import path from 'node:path';

function copyDirRecursive(srcDir, destDir) {
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

const cmsDir = path.resolve(process.cwd(), 'apps/cms');
const srcDir = path.join(cmsDir, 'src');
const distSrcDir = path.join(cmsDir, 'dist', 'src');

copyDirRecursive(srcDir, distSrcDir);
console.log('✓ All schema and component JSON files copied to dist/src.');
