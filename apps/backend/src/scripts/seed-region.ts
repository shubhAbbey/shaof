import { MedusaContainer } from '@medusajs/framework/types';
import { createRegionsWorkflow } from '@medusajs/medusa/core-flows';
import { Modules } from '@medusajs/framework/utils';

export default async function seedRegion({ container }: { container: MedusaContainer }) {
  console.log('Checking Medusa regions...');
  const regionModule = container.resolve(Modules.REGION);
  const [existingRegions, count] = await regionModule.listAndCountRegions();

  if (count > 0) {
    console.log(`Found ${count} existing regions:`, existingRegions.map((r: any) => ({ id: r.id, name: r.name, currency_code: r.currency_code })));
    return;
  }

  console.log('No regions found. Creating India region (INR)...');
  const { result } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: 'India',
          currency_code: 'inr',
          countries: ['in'],
        },
      ],
    },
  });

  console.log('Successfully created region:', result);
}
