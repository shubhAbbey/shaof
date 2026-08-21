// ==========================================
// 1. CMS Page & Content Types
// ==========================================

export type CmsPageType =
  | 'homepage'
  | 'landing_page'
  | 'sale_page'
  | 'campaign_page'
  | 'brand_content_page'
  | 'policy_page';

export interface CmsMediaDto {
  id?: number | string;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  mime?: string;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface CmsSeoDto {
  id?: number | string;
  metaTitle: string;
  metaDescription: string;
  shareImage?: CmsMediaDto;
  canonicalUrl?: string;
  keywords?: string;
  preventIndexing?: boolean;
}

// ==========================================
// 2. CMS Dynamic Zone Reusable Sections
// ==========================================

export type CmsSectionComponentType =
  | 'sections.hero'
  | 'sections.banner'
  | 'sections.sale-banner'
  | 'sections.rich-text'
  | 'sections.category-tiles'
  | 'sections.collection-carousel'
  | 'sections.product-carousel'
  | 'sections.product-grid'
  | 'sections.promotional-cta';

export interface CmsBaseSection {
  id: number | string;
  __component: CmsSectionComponentType;
}

export interface CmsHeroSection extends CmsBaseSection {
  __component: 'sections.hero';
  title: string;
  subtitle?: string;
  media?: CmsMediaDto;
  mobileMedia?: CmsMediaDto;
  ctaText?: string;
  ctaLink?: string;
  textAlignment?: 'left' | 'center' | 'right';
}

export interface CmsBannerSection extends CmsBaseSection {
  __component: 'sections.banner';
  title: string;
  subtitle?: string;
  badgeText?: string;
  media?: CmsMediaDto;
  mobileMedia?: CmsMediaDto;
  ctaLink?: string;
}

export interface CmsSaleBannerSection extends CmsBaseSection {
  __component: 'sections.sale-banner';
  title: string;
  discountHighlight?: string;
  timerEndDate?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
}

export interface CmsRichTextSection extends CmsBaseSection {
  __component: 'sections.rich-text';
  content: string;
}

export interface CmsCategoryItemDto {
  id?: number | string;
  title: string;
  categoryHandle: string;
  image?: CmsMediaDto;
  link?: string;
}

export interface CmsCategoryTilesSection extends CmsBaseSection {
  __component: 'sections.category-tiles';
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel' | 'tiles';
  items?: CmsCategoryItemDto[];
}

export interface CmsCollectionCarouselSection extends CmsBaseSection {
  __component: 'sections.collection-carousel';
  title: string;
  subtitle?: string;
  collectionHandle: string;
  viewAllLink?: string;
  limit?: number;
}

export interface CmsProductCarouselSection extends CmsBaseSection {
  __component: 'sections.product-carousel';
  title: string;
  subtitle?: string;
  collectionHandle?: string;
  categoryHandle?: string;
  productHandles?: string[];
  limit?: number;
}

export interface CmsProductGridSection extends CmsBaseSection {
  __component: 'sections.product-grid';
  title: string;
  subtitle?: string;
  collectionHandle?: string;
  categoryHandle?: string;
  productHandles?: string[];
  columns?: number;
  limit?: number;
}

export interface CmsPromotionalCtaSection extends CmsBaseSection {
  __component: 'sections.promotional-cta';
  title: string;
  description?: string;
  badgeText?: string;
  ctaText: string;
  ctaLink: string;
  image?: CmsMediaDto;
  layout?: 'split' | 'centered' | 'card';
}

export type CmsSection =
  | CmsHeroSection
  | CmsBannerSection
  | CmsSaleBannerSection
  | CmsRichTextSection
  | CmsCategoryTilesSection
  | CmsCollectionCarouselSection
  | CmsProductCarouselSection
  | CmsProductGridSection
  | CmsPromotionalCtaSection;

// ==========================================
// 3. CMS Page DTO
// ==========================================

export interface CmsPageDto {
  id: number | string;
  documentId?: string;
  title: string;
  slug: string;
  pageType: CmsPageType;
  description?: string;
  seo?: CmsSeoDto;
  sections: CmsSection[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// ==========================================
// 4. Navigation Models
// ==========================================

export interface CmsNavigationItemDto {
  label: string;
  url: string;
  categoryHandle?: string;
  collectionHandle?: string;
  badge?: string;
  children?: CmsNavigationItemDto[];
}

export interface CmsNavigationDto {
  id: number | string;
  documentId?: string;
  title: string;
  handle: string;
  items: CmsNavigationItemDto[];
}

