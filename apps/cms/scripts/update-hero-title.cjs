const strapiFactory = require('@strapi/strapi');
const path = require('node:path');

async function updateHeroTitle(newTitle) {
  const appDir = path.resolve(process.cwd(), 'apps/cms');
  const distDir = path.join(appDir, 'dist');

  const strapi = await strapiFactory.createStrapi({
    appDir,
    distDir,
  }).load();

  const existing = await strapi.documents('api::page.page').findFirst({
    filters: { slug: 'homepage' },
    populate: ['sections', 'seo'],
  });

  if (existing) {
    const updatedSections = (existing.sections || []).map((section) => {
      if (section.__component === 'sections.hero') {
        return {
          ...section,
          title: newTitle,
        };
      }
      return section;
    });

    await strapi.documents('api::page.page').update({
      documentId: existing.documentId,
      data: {
        ...existing,
        sections: updatedSections,
      },
      status: 'published',
    });

    console.log(`✓ Updated hero title to "${newTitle}" (documentId: ${existing.documentId})`);
  }

  await strapi.destroy();
}

const title = process.argv[2] || 'CMS HOMEPAGE TEST';
updateHeroTitle(title).catch(console.error);
