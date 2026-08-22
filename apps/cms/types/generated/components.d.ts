import type { Schema, Struct } from '@strapi/strapi';

export interface ElementsCategoryItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_category_items';
  info: {
    description: 'Category item with Medusa category handle reference';
    displayName: 'Category Item';
    icon: 'tag';
  };
  attributes: {
    categoryHandle: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_banners';
  info: {
    description: 'Promotional or informational banner';
    displayName: 'Banner Section';
    icon: 'landscape';
  };
  attributes: {
    badgeText: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images'>;
    mobileMedia: Schema.Attribute.Media<'images'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsCategoryTiles extends Struct.ComponentSchema {
  collectionName: 'components_sections_category_tiles';
  info: {
    description: 'Category navigation tiles referencing Medusa category handles';
    displayName: 'Category Tiles';
    icon: 'grid';
  };
  attributes: {
    desktopVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<6>;
    items: Schema.Attribute.Component<'elements.category-item', true>;
    layout: Schema.Attribute.Enumeration<['grid', 'carousel', 'tiles']> &
      Schema.Attribute.DefaultTo<'grid'>;
    mobileVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<2>;
    sliderEnabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCollectionCarousel extends Struct.ComponentSchema {
  collectionName: 'components_sections_collection_carousels';
  info: {
    description: 'Collection carousel referencing Medusa collection handle';
    displayName: 'Collection Carousel';
    icon: 'slideshow';
  };
  attributes: {
    collectionHandle: Schema.Attribute.String & Schema.Attribute.Required;
    desktopVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5>;
    limit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<8>;
    mobileVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<2>;
    sliderEnabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    viewAllLink: Schema.Attribute.String;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    description: 'Hero section with responsive media and CTA';
    displayName: 'Hero Section';
    icon: 'picture';
  };
  attributes: {
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images' | 'videos'>;
    mobileMedia: Schema.Attribute.Media<'images' | 'videos'>;
    subtitle: Schema.Attribute.String;
    textAlignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'center'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsProductCarousel extends Struct.ComponentSchema {
  collectionName: 'components_sections_product_carousels';
  info: {
    description: 'Product carousel referencing collection, category, or product handles';
    displayName: 'Product Carousel';
    icon: 'carousel';
  };
  attributes: {
    categoryHandle: Schema.Attribute.String;
    collectionHandle: Schema.Attribute.String;
    desktopVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5>;
    limit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<8>;
    mobileVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<2>;
    productHandles: Schema.Attribute.JSON;
    sliderEnabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    viewAllLink: Schema.Attribute.String;
  };
}

export interface SectionsProductGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_product_grids';
  info: {
    description: 'Product grid section referencing collection or category handles';
    displayName: 'Product Grid';
    icon: 'apps';
  };
  attributes: {
    categoryHandle: Schema.Attribute.String;
    collectionHandle: Schema.Attribute.String;
    columns: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    desktopVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    limit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    mobileVisibleItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<2>;
    productHandles: Schema.Attribute.JSON;
    sliderEnabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    viewAllLink: Schema.Attribute.String;
  };
}

export interface SectionsPromotionalCta extends Struct.ComponentSchema {
  collectionName: 'components_sections_promotional_ctas';
  info: {
    description: 'Call-to-action block with badges, links, and media';
    displayName: 'Promotional CTA';
    icon: 'bullhorn';
  };
  attributes: {
    badgeText: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String & Schema.Attribute.Required;
    ctaText: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    layout: Schema.Attribute.Enumeration<['split', 'centered', 'card']> &
      Schema.Attribute.DefaultTo<'split'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsRichText extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_texts';
  info: {
    description: 'Rich text and policy content block';
    displayName: 'Rich Text';
    icon: 'file';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface SectionsSaleBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_sale_banners';
  info: {
    description: 'Sale banner with countdown timer and highlight';
    displayName: 'Sale Banner';
    icon: 'price-tag';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    discountHighlight: Schema.Attribute.String;
    timerEndDate: Schema.Attribute.DateTime;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata component';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    preventIndexing: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'elements.category-item': ElementsCategoryItem;
      'sections.banner': SectionsBanner;
      'sections.category-tiles': SectionsCategoryTiles;
      'sections.collection-carousel': SectionsCollectionCarousel;
      'sections.hero': SectionsHero;
      'sections.product-carousel': SectionsProductCarousel;
      'sections.product-grid': SectionsProductGrid;
      'sections.promotional-cta': SectionsPromotionalCta;
      'sections.rich-text': SectionsRichText;
      'sections.sale-banner': SectionsSaleBanner;
      'shared.seo': SharedSeo;
    }
  }
}
