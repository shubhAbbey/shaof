import type { Metadata } from 'next';
import type { CmsSeoDto } from '@ecom/types';
import { config } from '../config';

const SITE_NAME = config.site.name;
const SITE_URL = config.site.url;
const DEFAULT_DESCRIPTION =
  'India-First fashion ecommerce destination for high-trend apparel, ethnic and modern collections with seamless checkout and COD.';

export interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  canonicalUrl,
  noIndex = false,
}: SeoOptions = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = canonicalUrl ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${SITE_URL}${canonicalUrl}`) : undefined;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      url: canonical || SITE_URL,
      images: image ? [{ url: image }] : undefined,
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  };
}

export function constructCmsSeoMetadata(seo?: CmsSeoDto, fallbackTitle?: string): Metadata {
  return constructMetadata({
    title: seo?.metaTitle || fallbackTitle,
    description: seo?.metaDescription,
    image: seo?.shareImage?.url,
    canonicalUrl: seo?.canonicalUrl,
    noIndex: seo?.preventIndexing,
  });
}
