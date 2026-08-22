import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCmsPage } from '../../../lib/strapi-client';
import { constructCmsSeoMetadata } from '../../../lib/seo';
import { SectionRenderer } from '../../../components/sections';
import type { CmsPageDto } from '@ecom/types';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface PolicyPageProps {
  params: {
    slug: string;
  };
}

async function getPolicyPage(slug: string): Promise<CmsPageDto | null> {
  // Try exact slug first (e.g. "privacy-policy"), then prefix/suffix variants
  let page = await fetchCmsPage(slug);
  if (!page && !slug.startsWith('policy-')) {
    page = await fetchCmsPage(`policy-${slug}`);
  }
  return page;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const page = await getPolicyPage(params.slug);

  if (!page) {
    return {
      title: 'Policy Not Found | Fashion Ecommerce MVP',
      robots: { index: false, follow: false },
    };
  }

  return constructCmsSeoMetadata(page.seo, `${page.title} | EcomFashion`);
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const page = await getPolicyPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white py-4 sm:py-8">
      <SectionRenderer sections={page.sections} />
    </main>
  );
}
