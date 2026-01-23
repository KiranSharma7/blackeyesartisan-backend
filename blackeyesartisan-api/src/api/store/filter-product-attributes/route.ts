import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Fetch collections, types, and products with materials in parallel
  const [collectionsResult, typesResult, productsResult] = await Promise.all([
    query.graph({
      entity: 'product_collection',
      fields: ['id', 'title'],
      filters: {}
    }),
    query.graph({
      entity: 'product_type',
      fields: ['id', 'value'],
      filters: {}
    }),
    query.graph({
      entity: 'product',
      fields: ['material'],
      filters: {}
    })
  ]);

  // Extract unique materials from products
  const uniqueMaterials = [
    ...new Set(
      (productsResult.data as Array<{ material?: string | null }>)
        .map((p) => p.material)
        .filter((m): m is string => m != null && m !== '')
    )
  ];

  res.json({
    collection: collectionsResult.data.map((c: { id: string; title: string }) => ({
      id: c.id,
      value: c.title
    })),
    type: typesResult.data,
    material: uniqueMaterials.map((v) => ({ id: v, value: v }))
  });
};
