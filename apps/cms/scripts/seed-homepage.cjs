const strapiFactory = require('@strapi/strapi');
const path = require('node:path');

async function seed() {
  const appDir = path.resolve(process.cwd(), 'apps/cms');
  const distDir = path.join(appDir, 'dist');

  const strapi = await strapiFactory.createStrapi({
    appDir,
    distDir,
  }).load();

  console.log('Strapi loaded successfully for seeding.');

  // 1. Configure Public Role Permissions for Page & Navigation
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
          console.log(`✓ Granted Public permission: ${action}`);
        } else {
          console.log(`- Public permission already present: ${action}`);
        }
      }
    }
  } catch (err) {
    console.error('Error configuring permissions:', err);
  }

  // 2. Create / Update Homepage Page Document
  try {
    const existing = await strapi.documents('api::page.page').findFirst({
      filters: { slug: 'homepage' },
    });

    const homepageData = {
      title: 'Homepage',
      slug: 'homepage',
      pageType: 'homepage',
      description: 'Official EcomFashion Storefront Homepage',
      seo: {
        metaTitle: 'EcomFashion | Premium Indian Ethnic & Western Wear',
        metaDescription:
          'Discover handcrafted luxury ethnic kurtas, silk sarees, and modern western silhouettes with fast express delivery across India.',
        canonicalUrl: 'https://ecomfashion.com',
      },
      sections: [
        {
          __component: 'sections.hero',
          title: 'Timeless Elegance, Modern Silhouettes',
          subtitle:
            'Explore our handcrafted collection of festive Indian wear, everyday westerns, and contemporary fusion styles.',
          ctaText: 'Shop New Season',
          ctaLink: '/category/women',
          textAlignment: 'left',
        },
        {
          __component: 'sections.category-tiles',
          title: 'Explore by Category',
          subtitle: 'Handpicked styles curated for every occasion',
          layout: 'grid',
          items: [
            { title: 'Kurta Sets', categoryHandle: 'women-kurta-sets', link: '/category/women-kurta-sets' },
            { title: 'Sarees', categoryHandle: 'women-sarees', link: '/category/women-sarees' },
            { title: 'Western Tops', categoryHandle: 'women-tops', link: '/category/women-tops' },
            { title: 'Dresses', categoryHandle: 'women-dresses', link: '/category/women-dresses' },
            { title: 'Men Shirts', categoryHandle: 'men-shirts', link: '/category/men-shirts' },
            { title: 'Curve + Plus', categoryHandle: 'curve-plus', link: '/category/curve-plus' },
          ],
        },
        {
          __component: 'sections.collection-carousel',
          title: 'Curated Festive Edit',
          subtitle: 'Most loved ethnic styles and designer silhouettes',
          collectionHandle: 'festive-edit',
          viewAllLink: '/category/women',
          limit: 8,
        },
        {
          __component: 'sections.sale-banner',
          title: 'Mega Season Finale Sale',
          discountHighlight: 'UP TO 60% OFF + EXTRA 10% ON PREPAID',
          ctaText: 'Explore Flash Sale',
          ctaLink: '/sale',
        },
        {
          __component: 'sections.product-grid',
          title: 'Trending New Arrivals',
          subtitle: 'Fresh drops added weekly to elevate your wardrobe',
          limit: 8,
          columns: 4,
        },
        {
          __component: 'sections.promotional-cta',
          title: 'The Linen & Silk Capsule',
          description:
            'Experience breathable luxury with our limited-edition pure mulberry silks and handwoven organic linens.',
          badgeText: 'LIMITED EDITION',
          ctaText: 'Discover the Capsule',
          ctaLink: '/collections/capsule',
        },
      ],
    };

    if (existing) {
      await strapi.documents('api::page.page').update({
        documentId: existing.documentId,
        data: homepageData,
        status: 'published',
      });
      console.log(`✓ Updated and published existing Homepage (documentId: ${existing.documentId})`);
    } else {
      const created = await strapi.documents('api::page.page').create({
        data: homepageData,
        status: 'published',
      });
      console.log(`✓ Created and published Homepage (documentId: ${created.documentId})`);
    }
  } catch (err) {
    console.error('Error seeding homepage document:', err);
  }

  await strapi.destroy();
  console.log('✓ Seeding complete.');
}

seed().catch(console.error);
