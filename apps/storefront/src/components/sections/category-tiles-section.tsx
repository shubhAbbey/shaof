import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CmsCategoryTilesSection, CmsCategoryItemDto } from '@ecom/types';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { getStrapiMediaUrl } from '../../lib/strapi-client';
import { Sparkles } from 'lucide-react';

const DEFAULT_CATEGORY_TILES: CmsCategoryItemDto[] = [
  { title: 'Kurta Sets', categoryHandle: 'women-kurta-sets', link: '/category/women-kurta-sets' },
  { title: 'Sarees', categoryHandle: 'women-sarees', link: '/category/women-sarees' },
  { title: 'Western Tops', categoryHandle: 'women-tops', link: '/category/women-tops' },
  { title: 'Dresses', categoryHandle: 'women-dresses', link: '/category/women-dresses' },
  { title: 'Men Shirts', categoryHandle: 'men-shirts', link: '/category/men-shirts' },
  { title: 'Curve + Plus', categoryHandle: 'curve-plus', link: '/category/curve-plus' },
];

export interface CategoryTilesSectionProps {
  section: CmsCategoryTilesSection;
}

export const CategoryTilesSection: React.FC<CategoryTilesSectionProps> = ({ section }) => {
  const items = section.items && section.items.length > 0 ? section.items : DEFAULT_CATEGORY_TILES;

  return (
    <section className="w-full py-8 sm:py-12 bg-gray-50/60">
      <Container size="xl">
        <div className="mb-6 sm:mb-8 text-center md:text-left">
          <Heading level={2} size="lg" className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {section.title || 'Explore by Category'}
          </Heading>
          {section.subtitle && (
            <Text className="mt-1 text-xs sm:text-sm text-gray-500">{section.subtitle}</Text>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {items.map((cat, idx) => {
            const imgUrl = getStrapiMediaUrl(cat.image?.url);
            return (
              <Link
                key={cat.categoryHandle || idx}
                href={cat.link || `/category/${cat.categoryHandle}`}
                className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-gray-200 bg-white p-3 text-center transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-2.5 flex items-center justify-center text-gray-400">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-108"
                    />
                  ) : (
                    <Sparkles className="h-8 w-8 text-brand-400 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {cat.title}
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
CategoryTilesSection.displayName = 'CategoryTilesSection';
