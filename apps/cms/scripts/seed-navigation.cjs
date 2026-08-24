const strapiFactory = require('@strapi/strapi');
const path = require('node:path');

const HEADER_NAV_ITEMS = [
  {
    id: 'women',
    name: 'Women',
    handle: 'women',
    href: '/category/women',
    badge: 'POPULAR',
    groups: [
      {
        title: 'Ethnic Wear',
        items: [
          { label: 'Kurta & Kurti Sets', href: '/category/women-kurta-sets', isHot: true },
          { label: 'Sarees & Blouses', href: '/category/women-sarees', isHot: true },
          { label: 'Anarkalis & Gowns', href: '/category/women-anarkali' },
          { label: 'Lehengas & Dupattas', href: '/category/women-lehengas' },
          { label: 'Palazzos & Ethnic Pants', href: '/category/women-ethnic-bottoms' },
        ],
      },
      {
        title: 'Western Wear',
        items: [
          { label: 'Dresses & Jumpsuits', href: '/category/women-dresses', isNew: true },
          { label: 'Tops, Tunics & Shirts', href: '/category/women-tops' },
          { label: 'Trousers & Jeans', href: '/category/women-jeans' },
          { label: 'Co-ord Sets', href: '/category/women-coords', isHot: true },
          { label: 'Jackets & Shrugs', href: '/category/women-jackets' },
        ],
      },
      {
        title: 'Festive & Occasion',
        items: [
          { label: 'Silk Edit', href: '/category/women-silk', isNew: true },
          { label: 'Party Sparkle', href: '/category/women-party' },
          { label: 'Handblock Prints', href: '/category/women-handblock' },
          { label: 'Wedding Guest', href: '/category/women-wedding' },
        ],
      },
    ],
    featured: [
      {
        title: 'Summer Meadow Collection',
        subtitle: 'Hand-block cotton kurtas and breezy silhouettes',
        href: '/collections/summer-meadow',
        badge: 'NEW LAUNCH',
      },
      {
        title: 'Festive Glam Edit',
        subtitle: 'Zari woven banarasi silks & royal magenta tones',
        href: '/collections/festive-glam',
        badge: 'TRENDING',
      },
    ],
  },
  {
    id: 'men',
    name: 'Men',
    handle: 'men',
    href: '/category/men',
    groups: [
      {
        title: 'Topwear',
        items: [
          { label: 'Casual Shirts', href: '/category/men-casual-shirts', isHot: true },
          { label: 'Linen Shirts', href: '/category/men-linen', isNew: true },
          { label: 'Polo & T-Shirts', href: '/category/men-tshirts' },
          { label: 'Short Kurtas', href: '/category/men-short-kurtas' },
          { label: 'Ethnic Kurtas & Nehru Jackets', href: '/category/men-ethnic', isHot: true },
        ],
      },
      {
        title: 'Bottomwear',
        items: [
          { label: 'Chinos & Trousers', href: '/category/men-trousers' },
          { label: 'Denim Jeans', href: '/category/men-jeans' },
          { label: 'Linen Pants & Drawstrings', href: '/category/men-linen-pants' },
          { label: 'Ethnic Pyjamas & Dhotis', href: '/category/men-pyjamas' },
        ],
      },
    ],
    featured: [
      {
        title: 'Linen & Breathable Cottons',
        subtitle: 'Effortless smart casuals made for Indian tropical summers',
        href: '/collections/capsule',
        badge: 'CAPSULE',
      },
    ],
  },
  {
    id: 'curve-plus',
    name: 'Curve + Plus',
    handle: 'curve-plus',
    href: '/category/curve-plus',
    badge: 'HOT',
    groups: [
      {
        title: 'Plus Ethnic',
        items: [
          { label: 'Anarkali Sets (XXL-6XL)', href: '/category/curve-anarkalis', isHot: true },
          { label: 'Straight Kurtas', href: '/category/curve-kurtas' },
          { label: 'Festive Suits', href: '/category/curve-festive', isNew: true },
        ],
      },
      {
        title: 'Plus Western',
        items: [
          { label: 'Flattering Maxi Dresses', href: '/category/curve-dresses', isHot: true },
          { label: 'Comfort Fit Tops', href: '/category/curve-tops' },
          { label: 'High-Rise Trousers', href: '/category/curve-bottoms' },
        ],
      },
    ],
    featured: [
      {
        title: 'All Body Confident Fits',
        subtitle: 'Inclusive sizing engineered with stretch comfort and drape',
        href: '/collections/curve-curated',
        badge: 'SIZE INCLUSIVE',
      },
    ],
  },
  {
    id: 'kids',
    name: 'Kids',
    handle: 'kids',
    href: '/category/kids',
    groups: [
      {
        title: 'Girls',
        items: [
          { label: 'Lehengas & Frocks', href: '/category/kids-girls-ethnic', isNew: true },
          { label: 'Cotton Dresses', href: '/category/kids-girls-dresses' },
        ],
      },
      {
        title: 'Boys',
        items: [
          { label: 'Kurta Pajama Sets', href: '/category/kids-boys-ethnic', isHot: true },
          { label: 'Shirts & Tees', href: '/category/kids-boys-casual' },
        ],
      },
    ],
  },
  {
    id: 'sale',
    name: 'Sale Store',
    handle: 'sale',
    href: '/sale',
    badge: 'UP TO 70%',
    groups: [
      {
        title: 'Sale by Category',
        items: [
          { label: 'Ethnic Under ₹1999', href: '/category/women-kurta-sets', isHot: true },
          { label: 'Western Under ₹999', href: '/category/women-dresses', isHot: true },
          { label: 'Men Topwear Flat 50% Off', href: '/category/men-casual-shirts' },
          { label: 'Clearance Finale', href: '/sale/all', isHot: true },
        ],
      },
    ],
    featured: [
      {
        title: 'Mega Season End Clearance',
        subtitle: 'Extra 10% instant discount on prepaid orders across India',
        href: '/sale',
        badge: 'LIMITED STOCK',
      },
    ],
  },
];

const FOOTER_NAV_COLUMNS = [
  {
    title: 'Top Categories',
    items: [
      { label: 'Women Ethnic & Western', href: '/category/women' },
      { label: 'Men Shirts & Denim', href: '/category/men' },
      { label: 'Curve + Plus', href: '/category/curve-plus' },
      { label: 'Kids Festive & Casual', href: '/category/kids' },
      { label: 'Flash Sale (Up to 70% Off)', href: '/sale' },
    ],
  },
  {
    title: 'Customer Support',
    items: [
      { label: 'Track Order', href: '/account/orders' },
      { label: 'Returns & Refunds', href: '/policies/return-policy' },
      { label: 'Shipping & Delivery', href: '/policies/shipping-policy' },
      { label: 'COD Guidelines', href: '/policies/cod-terms' },
      { label: 'Help Center & FAQs', href: '/pages/help-center' },
    ],
  },
  {
    title: 'Policies & Legal',
    items: [
      { label: 'Privacy Policy', href: '/policies/privacy-policy' },
      { label: 'Terms of Service', href: '/policies/terms-of-service' },
      { label: 'Return & Refund Policy', href: '/policies/return-policy' },
      { label: 'Security & Fraud Protection', href: '/policies/security' },
    ],
  },
];

async function seedNavigation() {
  const appDir = path.resolve(process.cwd(), 'apps/cms');
  const distDir = path.join(appDir, 'dist');
  const strapi = await strapiFactory.createStrapi({ appDir, distDir }).load();
  console.log('Strapi loaded for Navigation seeding.');

  // 1. Permissions
  try {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    if (publicRole) {
      const requiredActions = ['api::navigation.navigation.find', 'api::navigation.navigation.findOne'];
      for (const action of requiredActions) {
        const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: publicRole.id } });
        if (!existing) {
          await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: publicRole.id } });
          console.log('✓ Granted Public permission:', action);
        }
      }
    }
  } catch (err) {
    console.error('Error setting navigation permissions:', err);
  }

  // 2. Header Nav
  try {
    const existingHeader = await strapi.documents('api::navigation.navigation').findFirst({ filters: { handle: 'header-nav' } });
    if (existingHeader) {
      await strapi.documents('api::navigation.navigation').update({
        documentId: existingHeader.documentId,
        data: { title: 'Main Header Navigation', handle: 'header-nav', items: HEADER_NAV_ITEMS },
      });
      console.log('✓ Updated header-nav (documentId:', existingHeader.documentId, ')');
    } else {
      const created = await strapi.documents('api::navigation.navigation').create({
        data: { title: 'Main Header Navigation', handle: 'header-nav', items: HEADER_NAV_ITEMS },
      });
      console.log('✓ Created header-nav (documentId:', created.documentId, ')');
    }
  } catch (err) {
    console.error('Error seeding header-nav:', err);
  }

  // 3. Footer Nav
  try {
    const existingFooter = await strapi.documents('api::navigation.navigation').findFirst({ filters: { handle: 'footer-nav' } });
    if (existingFooter) {
      await strapi.documents('api::navigation.navigation').update({
        documentId: existingFooter.documentId,
        data: { title: 'Footer Navigation Columns', handle: 'footer-nav', items: FOOTER_NAV_COLUMNS },
      });
      console.log('✓ Updated footer-nav (documentId:', existingFooter.documentId, ')');
    } else {
      const created = await strapi.documents('api::navigation.navigation').create({
        data: { title: 'Footer Navigation Columns', handle: 'footer-nav', items: FOOTER_NAV_COLUMNS },
      });
      console.log('✓ Created footer-nav (documentId:', created.documentId, ')');
    }
  } catch (err) {
    console.error('Error seeding footer-nav:', err);
  }

  await strapi.destroy();
  console.log('✓ Navigation seeding complete.');
}

seedNavigation().catch(console.error);