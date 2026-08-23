/**
 * Centralized API Configuration & Endpoints
 *
 * Defines reusable API routes, Medusa backend endpoints, CMS endpoints,
 * and storefront internal routing.
 */

import { env } from './env';

export const apiConfig = {
  medusa: {
    baseUrl: env.medusaUrl,
    publishableKey: env.medusaPublishableKey,
    endpoints: {
      products: '/store/products',
      productByHandle: (handle: string) => `/store/products?handle=${encodeURIComponent(handle)}`,
      productById: (id: string) => `/store/products/${encodeURIComponent(id)}`,
      categories: '/store/product-categories',
      collections: '/store/collections',
      regions: '/store/regions',
      carts: '/store/carts',
      cart: (cartId: string) => `/store/carts/${encodeURIComponent(cartId)}`,
      lineItems: (cartId: string) => `/store/carts/${encodeURIComponent(cartId)}/line-items`,
      lineItem: (cartId: string, lineId: string) =>
        `/store/carts/${encodeURIComponent(cartId)}/line-items/${encodeURIComponent(lineId)}`,
    },
  },
  cms: {
    baseUrl: env.strapiUrl,
    apiToken: env.strapiApiToken,
    endpoints: {
      pages: '/api/pages',
      pageBySlug: (slug: string) =>
        `/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[seo][populate]=*&populate[sections][populate]=*`,
      navigations: '/api/navigations',
      navigationByHandle: (handle: string) =>
        `/api/navigations?filters[handle][$eq]=${encodeURIComponent(handle)}`,
    },
  },
  storefront: {
    baseUrl: env.siteUrl,
    routes: {
      home: '/',
      product: (handle: string) => `/product/${encodeURIComponent(handle)}`,
      category: (handle: string) => `/category/${encodeURIComponent(handle)}`,
      collection: (handle: string) => `/collections/${encodeURIComponent(handle)}`,
      brand: (brand: string) => `/brand/${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`,
      sale: '/sale',
      search: (query?: string) => (query ? `/search?q=${encodeURIComponent(query)}` : '/search'),
      cart: '/cart',
      wishlist: '/wishlist',
      checkout: '/checkout',
    },
    internalApi: {
      productDetail: (handle: string) => `/api/products/${encodeURIComponent(handle)}`,
      searchSuggestions: (query: string) => `/api/search/suggestions?q=${encodeURIComponent(query)}`,
      search: (query: string) => `/api/search?q=${encodeURIComponent(query)}`,
    },
  },
};
