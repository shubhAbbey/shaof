/**
 * Phase 14: Search Abstraction & Backend Integration
 * Search provider factory and public exports.
 */

import { ISearchProvider } from './types';
import { MedusaSearchProvider } from './medusa-provider';

export * from './types';
export * from './medusa-provider';

let defaultProviderInstance: ISearchProvider | null = null;

/**
 * Returns the configured search provider instance.
 * Defaults to MedusaSearchProvider.
 */
export function getSearchProvider(providerName = 'medusa'): ISearchProvider {
  if (providerName === 'medusa') {
    if (!defaultProviderInstance) {
      defaultProviderInstance = new MedusaSearchProvider();
    }
    return defaultProviderInstance;
  }

  // Future provider extensions (OpenSearch, Elasticsearch, Algolia, Meilisearch)
  // can be registered and returned here cleanly.
  return new MedusaSearchProvider();
}
