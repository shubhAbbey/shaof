import React from 'react';
import Link from 'next/link';
import type { CmsSaleBannerSection } from '@ecom/types';
import { Container } from '../ui/container';
import { Button } from '../ui/button';
import { Heading, Text } from '../ui/typography';
import { Flame, Clock, ArrowRight } from 'lucide-react';

export interface SaleBannerSectionProps {
  section: CmsSaleBannerSection;
}

export const SaleBannerSection: React.FC<SaleBannerSectionProps> = ({ section }) => {
  return (
    <section className="w-full py-6 sm:py-8">
      <Container size="xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-brand-700 p-6 sm:p-10 text-white shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black tracking-wider uppercase backdrop-blur-xs">
                <Flame className="h-3.5 w-3.5 text-yellow-300" />
                <span>{section.badgeText || 'LIMITED TIME FLASH SALE'}</span>
              </div>

              <Heading level={2} size="xl" className="text-2xl sm:text-4xl font-black text-white">
                {section.title}
              </Heading>

              {section.discountHighlight && (
                <div className="inline-block rounded-lg bg-yellow-400 px-3 py-1 text-sm sm:text-base font-black text-gray-950 shadow-xs">
                  {section.discountHighlight}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-rose-100 font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>{section.disclaimerText || 'Ends midnight | Free shipping above ₹999'}</span>
              </div>
            </div>

            <div className="shrink-0">
              <Link href={section.ctaLink || '/sale'}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-red-600 hover:bg-yellow-50 font-black shadow-md rounded-full px-8"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {section.ctaText || 'Shop Flash Sale'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
SaleBannerSection.displayName = 'SaleBannerSection';
