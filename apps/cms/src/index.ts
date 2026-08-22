import fs from 'node:fs';
import path from 'node:path';

function syncSchemasToDist() {
  try {
    const cwd = process.cwd();
    const srcDir = path.resolve(cwd, 'src');
    const distSrcDir = path.resolve(cwd, 'dist', 'src');

    if (fs.existsSync(srcDir) && fs.existsSync(distSrcDir)) {
      const copyJsonFiles = (src: string, dest: string) => {
        if (!fs.existsSync(src)) return;
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const sPath = path.join(src, entry.name);
          const dPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyJsonFiles(sPath, dPath);
          } else if (entry.name.endsWith('.json')) {
            fs.copyFileSync(sPath, dPath);
          }
        }
      };

      copyJsonFiles(srcDir, distSrcDir);
    }
  } catch {
    // Non-blocking schema sync
  }
}

// Synchronously sync schemas when module is evaluated by Strapi loader
syncSchemasToDist();

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/*{ strapi }*/) {
    syncSchemasToDist();
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap(/*{ strapi }*/) {},
};
