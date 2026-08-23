import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchProductByHandle, fetchCommerceProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PdpView } from '../../../components/pdp/pdp-view';

interface PdpPageProps {
  params: {
    handle: string;
  };
}

export async function generateMetadata({ params }: PdpPageProps): Promise<Metadata> {
  const product = await fetchProductByHandle(params.handle);

  if (!product) {
    return constructMetadata({
      title: 'Product Not Found | E-Commerce',
      description: 'The requested product could not be located.',
    });
  }

  const brandText = product.brand ? ` by ${product.brand}` : '';
  const priceText = product.price ? ` - ₹${product.price}` : '';

  return constructMetadata({
    title: `${product.title}${brandText}${priceText} | Gulmohar`,
    description: product.description || `Buy ${product.title} online with handcrafted Indian elegance, fast delivery, and COD.`,
    image: product.thumbnail || product.images?.[0],
  });
}

export default async function ProductDetailPage({ params }: PdpPageProps) {
  const { handle } = params;
  const product = await fetchProductByHandle(handle);

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category or collection
  let relatedProducts = await fetchCommerceProducts({
    categoryHandle: product.categoryHandle,
    collectionHandle: product.collectionHandle,
    limit: 8,
  });

  // Filter out current product from related products
  relatedProducts = relatedProducts.filter((p) => p.handle !== product.handle);

  return <PdpView product={product} relatedProducts={relatedProducts} />;
}
