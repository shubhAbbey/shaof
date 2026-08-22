import React from 'react';
import type { CmsSection } from '@ecom/types';
import { HeroSection } from './hero-section';
import { BannerSection } from './banner-section';
import { SaleBannerSection } from './sale-banner-section';
import { CategoryTilesSection } from './category-tiles-section';
import { CollectionCarouselSection } from './collection-carousel-section';
import { ProductCarouselSection } from './product-carousel-section';
import { ProductGridSection } from './product-grid-section';
import { PromotionalCtaSection } from './promotional-cta-section';
import { RichTextSection } from './rich-text-section';

export interface SectionRendererProps {
  sections: CmsSection[];
}

/**
 * Central Dynamic Zone Section Registry for Strapi CMS sections.
 */
export const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      {sections.map((section, index) => {
        const key = `${section.__component}-${section.id || index}`;

        switch (section.__component) {
          case 'sections.hero':
            return <HeroSection key={key} section={section} />;

          case 'sections.banner':
            return <BannerSection key={key} section={section} />;

          case 'sections.sale-banner':
            return <SaleBannerSection key={key} section={section} />;

          case 'sections.category-tiles':
            return <CategoryTilesSection key={key} section={section} />;

          case 'sections.collection-carousel':
            return <CollectionCarouselSection key={key} section={section} />;

          case 'sections.product-carousel':
            return <ProductCarouselSection key={key} section={section} />;

          case 'sections.product-grid':
            return <ProductGridSection key={key} section={section} />;

          case 'sections.promotional-cta':
            return <PromotionalCtaSection key={key} section={section} />;

          case 'sections.rich-text':
            return <RichTextSection key={key} section={section} />;

          default:
            console.warn(`Unrecognized CMS section component: ${(section as any)?.__component}`);
            return null;
        }
      })}
    </div>
  );
};
SectionRenderer.displayName = 'SectionRenderer';

