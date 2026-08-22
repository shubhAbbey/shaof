export const SEED_PAGES = [
  {
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
        limit: 12,
        desktopVisibleItems: 4,
        mobileVisibleItems: 2,
        sliderEnabled: true,
        viewAllLink: '/category/women',
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
  },
  {
    title: 'Mega Season Finale Sale',
    slug: 'sale',
    pageType: 'sale_page',
    description: 'Flash discounts and clearance deals on Indian ethnic and western fashion',
    seo: {
      metaTitle: 'Mega Season Finale Sale | Up to 70% Off | EcomFashion',
      metaDescription:
        'Explore extraordinary discounts up to 70% off on sarees, anarkalis, kurtis, dresses, and shirts. Fast delivery across India.',
      canonicalUrl: 'https://ecomfashion.com/sale',
    },
    sections: [
      {
        __component: 'sections.sale-banner',
        title: 'Mega Season Finale Flash Sale',
        discountHighlight: 'FLAT 50% - 70% OFF ON ALL CATEGORIES',
        ctaText: 'Shop All Deals',
        ctaLink: '/category/women',
      },
      {
        __component: 'sections.collection-carousel',
        title: 'Top Steals in Ethnic Wear',
        subtitle: 'Handcrafted Anarkalis, Sarees, and Kurtis at Unbeatable Prices',
        collectionHandle: 'sale-ethnic',
        viewAllLink: '/category/women',
        limit: 8,
      },
      {
        __component: 'sections.product-grid',
        title: 'Clearance Spotlight',
        subtitle: 'Limited stock remaining across trending sizes and styles',
        limit: 8,
        columns: 4,
      },
      {
        __component: 'sections.banner',
        title: 'Extra 10% Off on Prepaid UPI & Cards',
        subtitle: 'Instant discount applied at checkout on all orders above ₹1499.',
        badgeText: 'PREPAID BENEFIT',
        ctaLink: '/category/women',
      },
    ],
  },
  {
    title: 'Summer Solstice Campaign 2026',
    slug: 'summer-campaign-2026',
    pageType: 'campaign_page',
    description: 'Breezy organic linens and sun-kissed pastels for the summer season',
    seo: {
      metaTitle: 'Summer Solstice Campaign 2026 | EcomFashion',
      metaDescription:
        'Discover breathable organic cottons, flowy maxi silhouettes, and pastel hues handcrafted for warm summer days.',
      canonicalUrl: 'https://ecomfashion.com/pages/summer-campaign-2026',
    },
    sections: [
      {
        __component: 'sections.hero',
        title: 'Summer Solstice: Sun-Drenched Silhouettes',
        subtitle:
          'Step into effortless elegance with our summer edit crafted from 100% breathable organic linen and pure mulmul.',
        ctaText: 'Explore Summer Edit',
        ctaLink: '/category/women',
        textAlignment: 'center',
      },
      {
        __component: 'sections.product-grid',
        title: 'Featured Campaign Drops',
        subtitle: 'Handcrafted styles designed to keep you cool and stylish',
        limit: 4,
        columns: 4,
      },
      {
        __component: 'sections.promotional-cta',
        title: 'The Artisanal Dye Technique',
        description:
          'Each garment is hand-dipped in natural botanical dyes by master artisans in Jaipur, ensuring unique character and skin-safe comfort.',
        badgeText: 'HANDCRAFTED SUSTAINABILITY',
        ctaText: 'Shop Handcrafted',
        ctaLink: '/collections/handcrafted',
      },
    ],
  },
  {
    title: 'Royal Festive Kurtas Edit',
    slug: 'festive-kurtas-edit',
    pageType: 'landing_page',
    description: 'Curated royal festive kurtas with intricate zari embroidery',
    seo: {
      metaTitle: 'Royal Festive Kurtas Edit | EcomFashion',
      metaDescription:
        'Explore opulent silk blends, intricate zari work, and royal festive kurtas tailored for special celebrations.',
      canonicalUrl: 'https://ecomfashion.com/pages/festive-kurtas-edit',
    },
    sections: [
      {
        __component: 'sections.banner',
        title: 'Royal Festive Celebrations Edit',
        subtitle: 'Celebrate timeless Indian heritage with handcrafted silk embroidery and vibrant festive palettes.',
        badgeText: 'FESTIVE 2026',
        ctaLink: '/category/women',
      },
      {
        __component: 'sections.collection-carousel',
        title: 'Celebration Favorites',
        subtitle: 'Bestselling festive silhouettes chosen by stylists',
        collectionHandle: 'festive-edit',
        viewAllLink: '/category/women',
        limit: 8,
      },
    ],
  },
  {
    title: 'About EcomFashion — Our Heritage & Craft',
    slug: 'about-us',
    pageType: 'brand_content_page',
    description: 'The story behind EcomFashion, Indian craft heritage, and sustainable design',
    seo: {
      metaTitle: 'About Us | Our Story & Craft Heritage | EcomFashion',
      metaDescription:
        'Learn about EcomFashion’s journey, ethical sourcing from Indian weavers, and our commitment to sustainable modern fashion.',
      canonicalUrl: 'https://ecomfashion.com/pages/about-us',
    },
    sections: [
      {
        __component: 'sections.hero',
        title: 'Crafted with Passion, Rooted in Indian Heritage',
        subtitle:
          'Bridging centuries-old handloom traditions with modern contemporary silhouettes for today’s discerning fashion lover.',
        textAlignment: 'left',
      },
      {
        __component: 'sections.rich-text',
        content:
          '<h2>Our Craft Philosophy</h2><p>Founded in 2026, EcomFashion was born out of a deep reverence for India’s rich textile heritage. We collaborate directly with artisanal weaving clusters in Rajasthan, Gujarat, and Varanasi to bring you authentic, breathable fabrics crafted with integrity.</p><h3>Sustainable & Ethical Sourcing</h3><p>Every piece in our collection is crafted with zero-waste cutting techniques, natural botanical dyes, and fair-wage artisan partnerships.</p>',
      },
      {
        __component: 'sections.promotional-cta',
        title: 'Experience The Craft',
        description:
          'Join over 100,000 fashion enthusiasts who choose authentic artisanal wear with fast express delivery.',
        badgeText: 'INDIA PRIDE',
        ctaText: 'Explore Collections',
        ctaLink: '/category/women',
      },
    ],
  },
  {
    title: 'Privacy Policy & Data Protection',
    slug: 'privacy-policy',
    pageType: 'policy_page',
    description: 'Privacy policy, data collection, cookies, and consumer rights',
    seo: {
      metaTitle: 'Privacy Policy | EcomFashion',
      metaDescription: 'Read our Privacy Policy and data protection commitments for all users across India.',
      canonicalUrl: 'https://ecomfashion.com/policies/privacy-policy',
    },
    sections: [
      {
        __component: 'sections.rich-text',
        content:
          '<h1>Privacy Policy</h1><p><strong>Last Updated: August 2026</strong></p><p>At EcomFashion, accessible from ecomfashion.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by EcomFashion and how we use it.</p><h2>1. Information We Collect</h2><p>When you place an order, create an account, or subscribe to our newsletter, we collect personal information including name, email, phone number, shipping address, and payment preferences.</p><h2>2. How We Use Your Information</h2><p>We use the information we collect to process orders, manage deliveries, send order status updates, and improve customer experience.</p><h2>3. Payment Security & COD</h2><p>We do not store your credit card numbers or UPI PINs. All payment transactions are encrypted through PCI-DSS compliant payment gateways.</p>',
      },
    ],
  },
];

export const SEED_NAVIGATIONS = [
  {
    title: 'Main Header Navigation',
    handle: 'header-main-nav',
    items: [
      { label: 'Women', href: '/category/women' },
      { label: 'Men', href: '/category/men' },
      { label: 'Festive Edit', href: '/collections/festive-edit' },
      { label: 'Sale', href: '/sale' },
      { label: 'About Us', href: '/pages/about-us' },
    ],
  },
  {
    title: 'Footer Navigation',
    handle: 'footer-nav',
    items: [
      { label: 'About Us', href: '/pages/about-us' },
      { label: 'Privacy Policy', href: '/policies/privacy-policy' },
      { label: 'Sale & Offers', href: '/sale' },
    ],
  },
];
