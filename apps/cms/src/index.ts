import fs from 'node:fs';
import path from 'node:path';
import { SEED_PAGES, SEED_NAVIGATIONS } from './seed-data.js';

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
    // 1. Configure Public Role Permissions
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
            strapi.log.info(`[Bootstrap] Granted public permission: ${action}`);
          }
        }
      }
    } catch (err) {
      strapi.log.error(`[Bootstrap] Error configuring permissions: ${err}`);
    }

    // 2. Auto-seed Initial CMS Pages (Homepage, Sale, Campaigns, Policies, About)
    try {
      for (const pageData of SEED_PAGES) {
        const existing = await strapi.documents('api::page.page').findFirst({
          filters: { slug: pageData.slug },
        });

        if (!existing) {
          await strapi.documents('api::page.page').create({
            data: pageData,
            status: 'published',
          });
          strapi.log.info(`[Bootstrap] Auto-seeded and published page: ${pageData.title} (${pageData.slug})`);
        }
      }
    } catch (err) {
      strapi.log.error(`[Bootstrap] Error seeding initial pages: ${err}`);
    }

    // 3. Auto-seed Navigation Menus
    try {
      for (const navData of SEED_NAVIGATIONS) {
        const existing = await strapi.documents('api::navigation.navigation').findFirst({
          filters: { handle: navData.handle },
        });

        if (!existing) {
          await strapi.documents('api::navigation.navigation').create({
            data: navData,
            status: 'published',
          });
          strapi.log.info(`[Bootstrap] Auto-seeded and published navigation: ${navData.title} (${navData.handle})`);
        }
      }
    } catch (err) {
      strapi.log.error(`[Bootstrap] Error seeding navigations: ${err}`);
    }
  },
};
