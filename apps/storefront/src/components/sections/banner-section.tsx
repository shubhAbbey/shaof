import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CmsBannerSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Badge } from '../ui/badge';
import { Heading, Text } from '../ui/typography';
import { getStrapiMediaUrl } from '../../lib/strapi-client';
import { ArrowRight } from 'lucide-react';

export interface BannerSectionProps {
  section: CmsBannerSection;
}

export const BannerSection: React.FC<BannerSectionProps> = ({ section }) => {
  const imageUrl = getStrapiMediaUrl(section.media?.url);

  return (
    <section className="w-full py-6 sm:py-8">
      <Container size="xl">
        <Link
          href={section.ctaLink || '/collections/new-in'}
          className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-12 text-white transition-all hover:shadow-xl hover:border-brand-400"
        >
          {imageUrl && (
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity transition-transform duration-500 group-hover:scale-105">
              <Image
                src={imageUrl}
                alt={section.media?.alternativeText || section.title}
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/60 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-xl space-y-4">
            {section.badgeText && (
              <Badge variant="brand" size="sm" className="px-2.5 py-1">
                {section.badgeText}
              </Badge>
            )}

            <Heading level={2} size="xl" className="text-2xl sm:text-4xl font-extrabold text-white">
              {section.title}
            </Heading>

            {section.subtitle && (
              <Text className="text-sm sm:text-base text-gray-200 line-clamp-2">
                {section.subtitle}
              </Text>
            )}

            <div className="pt-2 flex items-center gap-2 font-bold text-sm text-brand-300 group-hover:text-white transition-colors">
              <span>{section.ctaLabel || 'Explore Collection'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
};
BannerSection.displayName = 'BannerSection';
