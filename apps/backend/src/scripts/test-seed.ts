import { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export default async function testSeed({ container }: { container: MedusaContainer }) {
  console.log('Medusa container loaded!');
  try {
    const productModule = container.resolve(Modules.PRODUCT);
    const [categories, catCount] = await productModule.listAndCountProductCategories();
    console.log('Categories count:', catCount);
    const [products, prodCount] = await productModule.listAndCountProducts();
    console.log('Products count:', prodCount);
    const [collections, colCount] = await productModule.listAndCountProductCollections();
    console.log('Collections count:', colCount);
  } catch (err: any) {
    console.error('Error with product module:', err.message);
  }
}
