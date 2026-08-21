export type CmsSectionType =
  | 'sections.hero-banner'
  | 'sections.category-tiles'
  | 'sections.collection-carousel'
  | 'sections.product-grid'
  | 'sections.promo-banner'
  | 'sections.rich-text';

export interface CmsBaseSection {
  id: number | string;
  __component: CmsSectionType;
}

export interface CmsHeroBannerSection extends CmsBaseSection {
  __component: 'sections.hero-banner';
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  mobileImageUrl?: string;
}

export interface CmsCategoryTilesSection extends CmsBaseSection {
  __component: 'sections.category-tiles';
  heading?: string;
  items: Array<{
    id: string;
    title: string;
    categoryHandle: string;
    imageUrl: string;
  }>;
}

export interface CmsPageData {
  id: number | string;
  title: string;
  slug: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    shareImage?: string;
  };
  sections: CmsBaseSection[];
}
