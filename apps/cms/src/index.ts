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
  async bootstrap({ strapi }: { strapi: any }) {
    // Configure Public Role Permissions
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        const requiredActions = [
          'api::page.page.find',
          'api::page.page.findOne',
          'api::navigation.navigation.find',
          'api::navigation.navigation.findOne',
        ];

        for (const action of requiredActions) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              action,
              role: publicRole.id,
            },
          });

          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
      }
    } catch {
      // Non-blocking permission bootstrap
    }
  },
};
