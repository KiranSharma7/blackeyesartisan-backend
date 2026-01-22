import { createFindParams } from '@medusajs/medusa/api/utils/validators';
import { z } from 'zod';
import { SEARCH_LIMITS } from './query-config';

// Optimized search parameters with better defaults and validation
export const StoreSearchProductsParams = createFindParams({
  offset: 0,
  limit: SEARCH_LIMITS.DEFAULT
}).merge(
  z.object({
    // Search query - trimmed and sanitized
    q: z
      .string()
      .trim()
      .max(200) // Prevent excessively long search queries
      .optional(),

    // Required regional context for pricing
    currency_code: z.string().length(3), // ISO 4217 currency code
    region_id: z.string().uuid(),

    // Filter arrays with size limits to prevent abuse
    collection_id: z
      .array(z.string().uuid())
      .max(20) // Limit filter combinations
      .optional(),
    category_id: z
      .array(z.string().uuid())
      .max(20)
      .optional(),
    type_id: z
      .array(z.string().uuid())
      .max(20)
      .optional(),
    materials: z
      .array(z.string().trim().max(100))
      .max(20)
      .optional(),

    // Sort order
    order: z
      .enum([
        'relevance',
        'calculated_price',
        '-calculated_price',
        'created_at',
        '-created_at',
        'title',
        '-title'
      ])
      .default('relevance'),

    // Price range with validation
    price_from: z.coerce
      .number()
      .min(0)
      .optional(),
    price_to: z.coerce
      .number()
      .min(0)
      .optional()
  })
).refine(
  (data) => {
    // Ensure price_from <= price_to if both are provided
    if (data.price_from !== undefined && data.price_to !== undefined) {
      return data.price_from <= data.price_to;
    }
    return true;
  },
  {
    message: 'price_from must be less than or equal to price_to',
    path: ['price_from']
  }
);

export type StoreSearchProductsParamsType = z.infer<typeof StoreSearchProductsParams>;
