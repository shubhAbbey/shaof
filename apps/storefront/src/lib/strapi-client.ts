import type { CmsPageDto, CmsNavigationDto, CmsGlobalSettingsDto } from '@ecom/types';
import { config } from '../config';

const STRAPI_URL = config.cms.baseUrl;
const STRAPI_API_TOKEN = config.cms.apiToken;

export function getStrapiMediaUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_URL}${url}`;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export async function fetchStrapi<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T | null> {
  const url = `${STRAPI_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      console.error(`Strapi fetch error: HTTP ${res.status} for ${url}`);
      return null;
    }

    const json = await res.json();
    return json.data as T;
  } catch (error) {
    console.error(`Failed to fetch from Strapi (${url}):`, error);
    return null;
  }
}

/**
 * Fetch a CMS page by its slug with all nested sections and SEO components populated.
 */
export async function fetchCmsPage(slug: string): Promise<CmsPageDto | null> {
  const query = `/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[seo][populate]=*&populate[sections][populate]=*`;
  const pages = await fetchStrapi<CmsPageDto[]>(query, { revalidate: 60 });
  if (!pages || pages.length === 0) return null;
  return pages[0];
}

/**
 * Fetch navigation menu by handle.
 */
export async function fetchCmsNavigation(handle: string): Promise<CmsNavigationDto | null> {
  const query = `/api/navigations?filters[handle][$eq]=${encodeURIComponent(handle)}`;
  const navs = await fetchStrapi<CmsNavigationDto[]>(query, { revalidate: 300 });
  if (!navs || navs.length === 0) return null;
  return navs[0];
}

/**
 * Fetch global storefront settings including announcement, site branding, value props and default SEO.
 */
export async function fetchCmsGlobalSettings(): Promise<CmsGlobalSettingsDto | null> {
  const query = `/api/global-setting?populate[defaultSeo][populate]=*&populate[valuePropositions][populate]=*`;
  const result = await fetchStrapi<CmsGlobalSettingsDto>(query, { revalidate: 300 });
  return result;
}

