import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CmsHeroSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Button } from '../ui/button';
import { Heading, Text } from '../ui/typography';
import { getStrapiMediaUrl } from '../../lib/strapi-client';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HeroSectionProps {
  section: CmsHeroSection;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ section }) => {
  const desktopImageUrl = getStrapiMediaUrl(section.media?.url);
  const mobileImageUrl = getStrapiMediaUrl(section.mobileMedia?.url) || desktopImageUrl;

  const alignClass =
    section.textAlignment === 'center'
      ? 'items-center text-center mx-auto'
      : section.textAlignment === 'right'
      ? 'items-end text-right ml-auto'
      : 'items-start text-left';

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-brand-950 via-brand-900 to-gray-950 text-white">
      {/* Background Image / Overlay */}
      {desktopImageUrl ? (
        <div className="absolute inset-0 z-0">
          <picture>
            {mobileImageUrl && <source media="(max-width: 640px)" srcSet={mobileImageUrl} />}
            <Image
              src={desktopImageUrl}
              alt={section.media?.alternativeText || section.title}
              fill
              priority
              className="object-cover object-center opacity-40 mix-blend-luminosity"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-brand-950/40 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-700/20 via-transparent to-transparent" />
      )}

      {/* Hero Content */}
      <Container size="xl" className="relative z-10 py-16 sm:py-24 md:py-32">
        <div className={cn('flex max-w-2xl flex-col space-y-6', alignClass)}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3.5 py-1 text-xs font-bold text-brand-300 backdrop-blur-md border border-brand-500/30">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>{section.badgeText || 'SEASON HIGHLIGHT 2026'}</span>
          </div>

          {/* Heading */}
          <Heading level={1} size="2xl" className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {section.title}
          </Heading>

          {/* Subtitle */}
          {section.subtitle && (
            <Text variant="lead" className="text-base sm:text-lg text-gray-200/90 max-w-xl font-normal leading-relaxed">
              {section.subtitle}
            </Text>
          )}

          {/* CTA Action */}
          {section.ctaText && (
            <div className="pt-2">
              <Link href={section.ctaLink || '/category/women'}>
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full shadow-lg shadow-brand-900/50 hover:shadow-brand-600/30"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {section.ctaText}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};
HeroSection.displayName = 'HeroSection';
