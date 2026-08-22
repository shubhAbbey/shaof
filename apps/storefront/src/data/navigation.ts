import type { NavCategory } from '../types/navigation';

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    id: 'women',
    handle: 'women',
    name: 'Women',
    href: '/category/women',
    badge: 'POPULAR',
    groups: [
      {
        title: 'Ethnic Wear',
        items: [
          { label: 'Kurta & Kurti Sets', href: '/category/women-kurta-sets', isHot: true },
          { label: 'Sarees & Blouses', href: '/category/women-sarees' },
          { label: 'Lehenga Cholis', href: '/category/women-lehengas' },
          { label: 'Anarkali Suits', href: '/category/women-anarkali' },
          { label: 'Ethnic Dresses', href: '/category/women-ethnic-dresses' },
          { label: 'Dupattas & Shawls', href: '/category/women-dupattas' },
        ],
      },
      {
        title: 'Western Wear',
        items: [
          { label: 'Dresses & Jumpsuits', href: '/category/women-dresses', isNew: true },
          { label: 'Tops & Tees', href: '/category/women-tops' },
          { label: 'Shirts & Blouses', href: '/category/women-shirts' },
          { label: 'Jeans & Jeggings', href: '/category/women-jeans' },
          { label: 'Trousers & Pants', href: '/category/women-trousers' },
          { label: 'Skirts & Shorts', href: '/category/women-skirts' },
        ],
      },
      {
        title: 'Festive & Occasion',
        items: [
          { label: 'Wedding Guest Styles', href: '/category/women-wedding', isHot: true },
          { label: 'Party Wear Dresses', href: '/category/women-party-wear' },
          { label: 'Embroidered Gowns', href: '/category/women-gowns' },
          { label: 'Indo-Western Fusion', href: '/category/women-indo-western' },
          { label: 'Silk Collection', href: '/category/women-silk' },
        ],
      },
      {
        title: 'Footwear & Accessories',
        items: [
          { label: 'Heels & Wedges', href: '/category/women-heels' },
          { label: 'Juttis & Mojaris', href: '/category/women-juttis' },
          { label: 'Handbags & Clutches', href: '/category/women-handbags' },
          { label: 'Fashion Jewellery', href: '/category/women-jewellery' },
          { label: 'Belts & Scarves', href: '/category/women-accessories' },
        ],
      },
    ],
    featured: [
      {
        title: 'Summer Meadow Collection',
        subtitle: 'Breezy silhouettes in pure mulmul & chanderi',
        href: '/collections/summer-meadow',
        badge: 'NEW ARRIVAL',
      },
      {
        title: 'Festive Glam Edit',
        subtitle: 'Hand-sequined lehengas and draped sarees',
        href: '/collections/festive-glam',
        badge: 'UP TO 50% OFF',
      },
    ],
  },
  {
    id: 'men',
    handle: 'men',
    name: 'Men',
    href: '/category/men',
    groups: [
      {
        title: 'Topwear',
        items: [
          { label: 'Casual Shirts', href: '/category/men-casual-shirts', isHot: true },
          { label: 'Formal Shirts', href: '/category/men-formal-shirts' },
          { label: 'Oversized T-Shirts', href: '/category/men-oversized-tshirts', isNew: true },
          { label: 'Polo T-Shirts', href: '/category/men-polo-tshirts' },
          { label: 'Jackets & Blazers', href: '/category/men-jackets' },
        ],
      },
      {
        title: 'Bottomwear',
        items: [
          { label: 'Jeans & Denim', href: '/category/men-jeans' },
          { label: 'Chinos & Trousers', href: '/category/men-chinos' },
          { label: 'Cargo Pants', href: '/category/men-cargos', isHot: true },
          { label: 'Joggers & Trackpants', href: '/category/men-joggers' },
          { label: 'Shorts', href: '/category/men-shorts' },
        ],
      },
      {
        title: 'Ethnic & Festive',
        items: [
          { label: 'Kurta Pyjama Sets', href: '/category/men-kurtas', isHot: true },
          { label: 'Nehru & Modi Jackets', href: '/category/men-nehru-jackets' },
          { label: 'Sherwanis', href: '/category/men-sherwanis' },
          { label: 'Dhoti Pants & Kurtas', href: '/category/men-dhoti-sets' },
        ],
      },
      {
        title: 'Footwear & Accessories',
        items: [
          { label: 'Sneakers & Casual Shoes', href: '/category/men-sneakers' },
          { label: 'Formal Loafers', href: '/category/men-loafers' },
          { label: 'Kolhapuris & Sandals', href: '/category/men-sandals' },
          { label: 'Leather Wallets & Belts', href: '/category/men-wallets' },
          { label: 'Sunglasses & Watches', href: '/category/men-watches' },
        ],
      },
    ],
    featured: [
      {
        title: 'Linen & Breathable Cottons',
        subtitle: 'Relaxed fits for the contemporary wardrobe',
        href: '/collections/men-linen',
        badge: 'TRENDING',
      },
    ],
  },
  {
    id: 'curve-plus',
    handle: 'curve-plus',
    name: 'Curve + Plus',
    href: '/category/curve-plus',
    badge: 'NEW',
    groups: [
      {
        title: 'Plus Size Tops & Kurtas',
        items: [
          { label: 'Plus Size Kurtis (XL - 6XL)', href: '/category/plus-kurtis', isHot: true },
          { label: 'A-Line Tunics', href: '/category/plus-tunics' },
          { label: 'Flowy Blouses', href: '/category/plus-blouses' },
          { label: 'Maxi Tops', href: '/category/plus-maxi-tops' },
        ],
      },
      {
        title: 'Plus Size Dresses',
        items: [
          { label: 'Wrap & Tiered Dresses', href: '/category/plus-wrap-dresses', isNew: true },
          { label: 'Party Dresses', href: '/category/plus-party-dresses' },
          { label: 'Anarkalis & Gowns', href: '/category/plus-anarkalis' },
        ],
      },
      {
        title: 'Plus Size Bottomwear',
        items: [
          { label: 'Comfort Stretch Jeans', href: '/category/plus-jeans' },
          { label: 'Palazzo Pants', href: '/category/plus-palazzos' },
          { label: 'Cotton Culottes', href: '/category/plus-culottes' },
        ],
      },
    ],
    featured: [
      {
        title: 'All Body Confident Fits',
        subtitle: 'Designed to celebrate your natural curves',
        href: '/collections/curve-curated',
        badge: 'SIZE 14 - 28',
      },
    ],
  },
  {
    id: 'kids',
    handle: 'kids',
    name: 'Kids',
    href: '/category/kids',
    groups: [
      {
        title: 'Boys (2-14 Yrs)',
        items: [
          { label: 'T-Shirts & Polos', href: '/category/kids-boys-tshirts' },
          { label: 'Shirts & Denim', href: '/category/kids-boys-shirts' },
          { label: 'Kurta Pyjamas', href: '/category/kids-boys-kurtas', isHot: true },
          { label: 'Shorts & Joggers', href: '/category/kids-boys-shorts' },
        ],
      },
      {
        title: 'Girls (2-14 Yrs)',
        items: [
          { label: 'Frocks & Dresses', href: '/category/kids-girls-dresses', isNew: true },
          { label: 'Lehenga Cholis', href: '/category/kids-girls-lehengas', isHot: true },
          { label: 'Tops & Skirts', href: '/category/kids-girls-tops' },
          { label: 'Leggings & Pants', href: '/category/kids-girls-pants' },
        ],
      },
      {
        title: 'Infants & Toddlers',
        items: [
          { label: 'Rompers & Onesies', href: '/category/kids-infants-rompers' },
          { label: 'Baby Co-ord Sets', href: '/category/kids-infants-sets' },
          { label: 'First Festive Sets', href: '/category/kids-infants-festive' },
        ],
      },
    ],
  },
  {
    id: 'home-living',
    handle: 'home-living',
    name: 'Home & Living',
    href: '/category/home-living',
    groups: [
      {
        title: 'Bed Linen',
        items: [
          { label: 'Bedsheets & Pillow Covers', href: '/category/home-bedsheets' },
          { label: 'Duvet Covers & Quilts', href: '/category/home-quilts' },
          { label: 'Cushion Covers', href: '/category/home-cushions', isHot: true },
        ],
      },
      {
        title: 'Curtains & Rugs',
        items: [
          { label: 'Blackout Curtains', href: '/category/home-curtains' },
          { label: 'Floor Rugs & Mats', href: '/category/home-rugs' },
          { label: 'Table Runners', href: '/category/home-runners' },
        ],
      },
      {
        title: 'Decor & Fragrances',
        items: [
          { label: 'Scented Candles', href: '/category/home-candles' },
          { label: 'Brass & Ceramic Planters', href: '/category/home-planters' },
          { label: 'Wall Art & Frames', href: '/category/home-wall-art' },
        ],
      },
    ],
  },
  {
    id: 'beauty',
    handle: 'beauty',
    name: 'Beauty',
    href: '/category/beauty',
    groups: [
      {
        title: 'Makeup',
        items: [
          { label: 'Lipsticks & Liquid Lip', href: '/category/beauty-lips', isHot: true },
          { label: 'Kajal, Eyeliner & Mascara', href: '/category/beauty-eyes' },
          { label: 'Foundations & Compact', href: '/category/beauty-face' },
        ],
      },
      {
        title: 'Skincare & Haircare',
        items: [
          { label: 'Ayurvedic Serums', href: '/category/beauty-serums' },
          { label: 'Sunscreen & Moisturizers', href: '/category/beauty-skincare' },
          { label: 'Herbal Hair Oils & Shampoos', href: '/category/beauty-hair' },
        ],
      },
    ],
  },
  {
    id: 'sale',
    handle: 'sale',
    name: 'Sale',
    href: '/sale',
    badge: 'UP TO 70%',
    groups: [
      {
        title: 'Flash Discounts',
        items: [
          { label: 'Under ₹499 Store', href: '/sale?price=under-499', isHot: true },
          { label: 'Under ₹999 Store', href: '/sale?price=under-999', isHot: true },
          { label: 'Flat 50% Off', href: '/sale?discount=50', isHot: true },
          { label: 'Flat 70% Off Clearance', href: '/sale?discount=70', isHot: true },
          { label: 'Buy 1 Get 1 Free Deals', href: '/sale?deal=bogo' },
        ],
      },
      {
        title: 'Category Deals',
        items: [
          { label: 'Ethnic Wear Sale', href: '/sale?cat=ethnic' },
          { label: 'Western Wear Sale', href: '/sale?cat=western' },
          { label: 'Men Topwear Sale', href: '/sale?cat=men-topwear' },
          { label: 'Footwear Mega Sale', href: '/sale?cat=footwear' },
        ],
      },
    ],
    featured: [
      {
        title: 'Mega Season End Clearance',
        subtitle: 'Extra 10% instant discount on prepaid orders',
        href: '/sale',
        badge: 'LIMITED TIME',
      },
    ],
  },
];
