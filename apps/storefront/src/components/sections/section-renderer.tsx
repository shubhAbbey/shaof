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
import { SectionErrorBoundary } from './section-error-boundary';

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
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <HeroSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.banner':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <BannerSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.sale-banner':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <SaleBannerSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.category-tiles':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <CategoryTilesSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.collection-carousel':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <CollectionCarouselSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.product-carousel':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <ProductCarouselSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.product-grid':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <ProductGridSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.promotional-cta':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <PromotionalCtaSection section={section} />
              </SectionErrorBoundary>
            );

          case 'sections.rich-text':
            return (
              <SectionErrorBoundary key={key} componentType={section.__component}>
                <RichTextSection section={section} />
              </SectionErrorBoundary>
            );

          default:
            console.warn(`Unrecognized CMS section component: ${(section as any)?.__component}`);
            return null;
        }
      })}
    </div>
  );
};
SectionRenderer.displayName = 'SectionRenderer';
