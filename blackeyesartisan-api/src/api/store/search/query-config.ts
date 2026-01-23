// Minimal fields for listing view - optimized for performance
// Only includes essential data needed for product cards/listing pages
export const minimalStoreSearchProductFields = [
  'id',
  'title',
  'handle',
  'thumbnail',
  'collection_id',
  'type_id',
  'material',
  'created_at',
  '*variants.id',
  '*variants.calculated_price'
];

// Standard fields for search results with more details
export const defaultStoreSearchProductFields = [
  'id',
  'title',
  'subtitle',
  'handle',
  'thumbnail',
  'collection_id',
  'type_id',
  'material',
  'created_at',
  'updated_at',
  '*type',
  '*collection',
  '*tags',
  '*images',
  '*variants',
  '*variants.options',
  '*variants.prices',
  '*variants.calculated_price'
];

// Full fields for detailed product view
// Includes all product data - use sparingly as it's heavier on the database
export const fullStoreSearchProductFields = [
  'id',
  'title',
  'subtitle',
  'description',
  'handle',
  'is_giftcard',
  'discountable',
  'thumbnail',
  'collection_id',
  'type_id',
  'weight',
  'length',
  'height',
  'width',
  'hs_code',
  'origin_country',
  'mid_code',
  'material',
  'metadata',
  'created_at',
  'updated_at',
  '*type',
  '*collection',
  '*options',
  '*options.values',
  '*tags',
  '*images',
  '*variants',
  '*variants.options',
  '*variants.prices',
  '*variants.calculated_price'
];

// Optimized limits to prevent over-fetching
export const SEARCH_LIMITS = {
  MIN: 1,
  DEFAULT: 20,
  MAX: 100
} as const;

export const listProductQueryConfig = {
  isList: true,
  defaults: defaultStoreSearchProductFields,
  defaultLimit: SEARCH_LIMITS.DEFAULT,
  // Allowed fields that can be requested via query params
  allowed: fullStoreSearchProductFields
};
