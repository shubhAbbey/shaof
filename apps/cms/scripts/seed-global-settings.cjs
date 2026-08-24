const strapiFactory = require('@strapi/strapi');
const path = require('node:path');

async function seedGlobalSettings() {
  const appDir = path.resolve(process.cwd(), 'apps/cms');
  const distDir = path.join(appDir, 'dist');

  const strapi = await strapiFactory.createStrapi({ appDir, distDir }).load();
  console.log('Strapi loaded successfully for Global Settings seeding.');

  try {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    if (publicRole) {
      const requiredActions = ['api::global-setting.global-setting.find'];
      for (const action of requiredActions) {
        const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: publicRole.id } });
        if (!existing) {
          await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: publicRole.id } });
          console.log('✓ Granted Public permission:', action);
        }
      }
    }
  } catch (err) {
    console.error('Error configuring permissions for global-setting:', err);
  }

  try {
    const globalData = {
      siteName: 'EcomFashion',
      siteTagline: 'India Modern Edit',
      announcementText: 'Free Express Shipping across India on orders above ₹999 | Cash on Delivery Available',
      announcementLink: '/sale',
      freeShippingThreshold: 999,
      footerAboutText: 'India premier modern fashion destination offering curated ethnic wear, contemporary western silhouettes, plus size edits, and artisanal textiles with seamless checkout and pan-India express delivery.',
      trendingSearches: ['Kurta Sets', 'Oversized T-Shirts', 'Floral Maxi Dresses', 'Linen Shirts', 'Embroidered Sarees', 'Cargo Pants'],
      defaultSeo: {
        metaTitle: 'EcomFashion | Premium Indian Ethnic & Western Wear',
        metaDescription: 'India-First fashion ecommerce destination for high-trend apparel, ethnic and modern collections with seamless checkout and COD.',
        canonicalUrl: 'https://ecomfashion.com',
      },
      valuePropositions: [
        { title: 'Free Express Delivery', subtitle: 'On all orders above ₹999 across India', icon: 'truck' },
        { title: '7-Day Easy Returns', subtitle: 'Doorstep pickup & instant store credit/refund', icon: 'refresh' },
        { title: 'Cash on Delivery & UPI', subtitle: 'Pay cash or scan QR upon delivery', icon: 'credit-card' },
        { title: '100% Genuine Products', subtitle: 'Hand-curated premium quality apparel', icon: 'shield' },
      ],
    };

    const existing = await strapi.documents('api::global-setting.global-setting').findFirst();
    if (existing) {
      await strapi.documents('api::global-setting.global-setting').update({ documentId: existing.documentId, data: globalData });
      console.log('✓ Updated Global Settings (documentId:', existing.documentId, ')');
    } else {
      const created = await strapi.documents('api::global-setting.global-setting').create({ data: globalData });
      console.log('✓ Created Global Settings (documentId:', created.documentId, ')');
    }
  } catch (err) {
    console.error('Error seeding global-setting document:', err);
  }

  await strapi.destroy();
  console.log('✓ Global Settings seeding complete.');
}

seedGlobalSettings().catch(console.error);