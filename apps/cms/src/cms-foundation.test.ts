import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import databaseConfig from '../config/database.js';
import serverConfig from '../config/server.js';
import adminConfig from '../config/admin.js';
import apiConfig from '../config/api.js';
import middlewaresConfig from '../config/middlewares.js';
import pluginsConfig from '../config/plugins.js';
import type { CmsPageDto, CmsNavigationDto, CmsSection } from '@ecom/types';

describe('Task 06: CMS Content Models & Section Registry', () => {
  const mockEnv: any = (key: string, defaultValue?: any) => defaultValue;
  mockEnv.int = (key: string, defaultValue?: number) => defaultValue || 0;
  mockEnv.array = (key: string, defaultValue?: string[]) => defaultValue || [];
  mockEnv.bool = (key: string, defaultValue?: boolean) => Boolean(defaultValue);

  it('configures PostgreSQL database targeting strapi_db', () => {
    const db = databaseConfig({ env: mockEnv });
    assert.equal(db.connection.client, 'postgres');
    assert.ok(db.connection.connection);
    if ('database' in db.connection.connection) {
      assert.equal(db.connection.connection.database, 'strapi_db');
    }
  });

  it('configures server settings on port 1337', () => {
    const server = serverConfig({ env: mockEnv });
    assert.equal(server.port, 1337);
    assert.equal(server.host, '0.0.0.0');
    assert.ok(Array.isArray(server.app.keys));
    assert.ok(server.app.keys.length >= 2);
  });

  it('validates Page schema with dynamic zone for all 9 reusable sections', () => {
    const pageSchemaPath = path.resolve(
      process.cwd(),
      'src/api/page/content-types/page/schema.json'
    );
    assert.ok(fs.existsSync(pageSchemaPath), 'Page schema file must exist');

    const schema = JSON.parse(fs.readFileSync(pageSchemaPath, 'utf8'));
    assert.equal(schema.kind, 'collectionType');
    assert.equal(schema.collectionName, 'pages');
    assert.equal(schema.attributes.title.type, 'string');
    assert.equal(schema.attributes.slug.type, 'uid');
    assert.equal(schema.attributes.pageType.type, 'enumeration');
    assert.deepEqual(schema.attributes.pageType.enum, [
      'homepage',
      'landing_page',
      'sale_page',
      'campaign_page',
      'brand_content_page',
      'policy_page',
    ]);
    assert.equal(schema.attributes.sections.type, 'dynamiczone');

    const expectedComponents = [
      'sections.hero',
      'sections.banner',
      'sections.sale-banner',
      'sections.rich-text',
      'sections.category-tiles',
      'sections.collection-carousel',
      'sections.product-carousel',
      'sections.product-grid',
      'sections.promotional-cta',
    ];
    for (const comp of expectedComponents) {
      assert.ok(
        schema.attributes.sections.components.includes(comp),
        `Dynamic zone must include ${comp}`
      );
    }
  });

  it('validates Navigation schema structure', () => {
    const navSchemaPath = path.resolve(
      process.cwd(),
      'src/api/navigation/content-types/navigation/schema.json'
    );
    assert.ok(fs.existsSync(navSchemaPath), 'Navigation schema file must exist');

    const schema = JSON.parse(fs.readFileSync(navSchemaPath, 'utf8'));
    assert.equal(schema.kind, 'collectionType');
    assert.equal(schema.collectionName, 'navigations');
    assert.equal(schema.attributes.handle.type, 'string');
    assert.equal(schema.attributes.handle.unique, true);
  });

  it('validates all 11 Strapi components exist and are valid JSON schemas', () => {
    const components = [
      'shared/seo.json',
      'elements/category-item.json',
      'sections/hero.json',
      'sections/banner.json',
      'sections/sale-banner.json',
      'sections/rich-text.json',
      'sections/category-tiles.json',
      'sections/collection-carousel.json',
      'sections/product-carousel.json',
      'sections/product-grid.json',
      'sections/promotional-cta.json',
    ];

    for (const relPath of components) {
      const fullPath = path.resolve(process.cwd(), 'src/components', relPath);
      assert.ok(fs.existsSync(fullPath), `Component file ${relPath} must exist`);
      const compJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      assert.ok(compJson.collectionName, `Component ${relPath} must have collectionName`);
      assert.ok(compJson.info.displayName, `Component ${relPath} must have displayName`);
      assert.ok(compJson.attributes, `Component ${relPath} must define attributes`);
    }
  });

  it('instantiates valid CmsPageDto and CmsNavigationDto type contracts', () => {
    const page: CmsPageDto = {
      id: 1,
      documentId: 'doc_home_123',
      title: 'Summer Season Homepage',
      slug: 'home',
      pageType: 'homepage',
      seo: {
        metaTitle: 'Summer Fashion Collection | Ecom MVP',
        metaDescription: 'Discover latest ethnic and western fashion wear.',
      },
      sections: [
        {
          id: 101,
          __component: 'sections.hero',
          title: 'Vibrant Summer Trends',
          subtitle: 'Up to 50% off on all new arrivals',
          ctaText: 'Shop Collection',
          ctaLink: '/collections/summer',
          textAlignment: 'center',
        },
        {
          id: 102,
          __component: 'sections.collection-carousel',
          title: 'Trending Collections',
          collectionHandle: 'summer-arrivals',
          limit: 8,
        },
      ],
    };

    assert.equal(page.pageType, 'homepage');
    assert.equal(page.sections.length, 2);

    const nav: CmsNavigationDto = {
      id: 1,
      title: 'Main Header Navigation',
      handle: 'header-main',
      items: [
        {
          label: 'Women',
          url: '/category/women',
          categoryHandle: 'women',
        },
        {
          label: 'Men',
          url: '/category/men',
          categoryHandle: 'men',
        },
      ],
    };

    assert.equal(nav.handle, 'header-main');
    assert.equal(nav.items.length, 2);
  });
});
