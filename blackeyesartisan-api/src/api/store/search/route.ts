import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { StoreSearchProductsParamsType } from './validators';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { QueryContext } from '@medusajs/utils';
import { SEARCH_LIMITS } from './query-config';

type ProductFilters = {
  q?: string;
  collection_id?: string[];
  categories?: { id: string[] };
  type_id?: string[];
  material?: string[];
  variants?: {
    prices: {
      amount: {
        $gte?: number;
        $lte?: number;
      };
    };
  };
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Cache duration in seconds
const CACHE_DURATION = IS_PRODUCTION ? 300 : 0; // 5 minutes in production

export const GET = async (
  req: MedusaRequest<StoreSearchProductsParamsType>,
  res: MedusaResponse
) => {
  const {
    q,
    limit: requestedLimit,
    offset,
    order,
    collection_id,
    category_id,
    type_id,
    materials,
    price_from,
    price_to,
    region_id,
    currency_code
  } = req.validatedQuery;

  // Enforce limit boundaries for performance
  const limit = Math.min(
    Math.max(requestedLimit ?? SEARCH_LIMITS.DEFAULT, SEARCH_LIMITS.MIN),
    SEARCH_LIMITS.MAX
  );

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Build filters object
  const filters: ProductFilters = {};

  if (q) {
    filters.q = q;
  }

  if (collection_id?.length) {
    filters.collection_id = collection_id;
  }

  if (category_id?.length) {
    filters.categories = { id: category_id };
  }

  if (type_id?.length) {
    filters.type_id = type_id;
  }

  if (materials?.length) {
    filters.material = materials;
  }

  // Price range filter
  if (price_from !== undefined || price_to !== undefined) {
    const priceAmount: { $gte?: number; $lte?: number } = {};

    if (price_from !== undefined) {
      priceAmount.$gte = price_from;
    }

    if (price_to !== undefined) {
      priceAmount.$lte = price_to;
    }

    filters.variants = {
      prices: { amount: priceAmount }
    };
  }

  // Parse order parameter
  const orderConfig =
    order === 'relevance'
      ? undefined
      : {
          [order.startsWith('-') ? order.slice(1) : order]: order.startsWith('-')
            ? 'DESC'
            : 'ASC'
        };

  const { data: products, metadata } = await query.index({
    entity: 'product',
    fields: req.queryConfig.fields,
    filters,
    pagination: {
      skip: offset ?? 0,
      take: limit,
      order: orderConfig
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id,
          currency_code
        })
      }
    }
  });

  const count = metadata?.estimate_count ?? products.length;

  // Set optimized cache headers for search results
  if (CACHE_DURATION > 0) {
    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    );
    // Create ETag based on query parameters for cache validation
    const etag = `"search-${Buffer.from(JSON.stringify({ q, collection_id, category_id, type_id, materials, price_from, price_to, offset, limit, order })).toString('base64').slice(0, 32)}"`;
    res.setHeader('ETag', etag);
  }

  // Add pagination metadata for better client-side handling
  const totalPages = Math.ceil(count / limit);
  const currentPage = Math.floor((offset ?? 0) / limit) + 1;

  res.json({
    products,
    count,
    limit,
    offset: offset ?? 0,
    // Additional pagination helpers
    pagination: {
      total_pages: totalPages,
      current_page: currentPage,
      has_next: currentPage < totalPages,
      has_prev: currentPage > 1
    }
  });
};
