import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CmsPromotionalCtaSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Heading, Text } from '../ui/typography';
import { getStrapiMediaUrl } from '../../lib/strapi-client';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface PromotionalCtaSectionProps {
  section: CmsPromotionalCtaSection;
}

export const PromotionalCtaSection: React.FC<PromotionalCtaSectionProps> = ({ section }) => {
  const imageUrl = getStrapiMediaUrl(section.image?.url);

  return (
    <section className="w-full py-8 sm:py-12">
      <Container size="xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-gray-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Text & Action */}
            <div className="space-y-4 md:col-span-8">
              {section.badgeText && (
                <Badge variant="brand" size="sm" className="bg-white/20 text-white border-white/30 backdrop-blur-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {section.badgeText}
                </Badge>
              )}

              <Heading level={2} size="xl" className="text-2xl sm:text-4xl font-black text-white">
                {section.title}
              </Heading>

              {section.description && (
                <Text className="text-sm sm:text-base text-gray-200 max-w-xl">
                  {section.description}
                </Text>
              )}

              <div className="pt-2">
                <Link href={section.ctaLink || '/collections/festive'}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full shadow-md shadow-brand-950/50"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {section.ctaText}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image on Right */}
            {imageUrl && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:col-span-4 shadow-md">
                <Image
                  src={imageUrl}
                  alt={section.title}
                  fill
                  className="object-cover object-center"
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};
PromotionalCtaSection.displayName = 'PromotionalCtaSection';
