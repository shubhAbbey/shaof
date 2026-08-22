import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCmsPage } from '../../../lib/strapi-client';
import { constructCmsSeoMetadata } from '../../../lib/seo';
import { SectionRenderer } from '../../../components/sections';
import type { CmsPageDto } from '@ecom/types';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface DynamicCmsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: DynamicCmsPageProps): Promise<Metadata> {
  const page: CmsPageDto | null = await fetchCmsPage(params.slug);

  if (!page) {
    return {
      title: 'Page Not Found | Fashion Ecommerce MVP',
      robots: { index: false, follow: false },
    };
  }

  return constructCmsSeoMetadata(page.seo, page.title);
}

export default async function DynamicCmsPage({ params }: DynamicCmsPageProps) {
  const page: CmsPageDto | null = await fetchCmsPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <SectionRenderer sections={page.sections} />
    </main>
  );
}
