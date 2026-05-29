// Property text search.
//
// We deliberately use a tokenized regex filter rather than MongoDB `$text`.
// `$text` is OR-based (any term matches) and can't match partial words or the
// reference number (it isn't in the text index), so a full-title search returns
// hundreds of loosely-related listings. This builds an AND-of-OR filter: every
// typed token must appear in at least one searchable field, so multi-word
// queries narrow the result set instead of widening it.
//
// Field set mirrors the old `property_text_search` index plus `referenceNumber`.
// `features` is a string array — a regex matches if any element matches.
const SEARCH_FIELDS = [
  "title",
  "description",
  "referenceNumber",
  "city",
  "district",
  "country",
  "propertyType",
  "features",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a tokenized, case-insensitive AND-of-OR regex filter for a search query.
 * Returns null when the query has no usable tokens.
 */
export function buildSearchFilter(q: string) {
  const tokens = q.trim().split(/[\s,]+/).filter(Boolean);
  if (tokens.length === 0) return null;
  return {
    $and: tokens.map((token) => {
      const rx = new RegExp(escapeRegex(token), "i");
      return { $or: SEARCH_FIELDS.map((field) => ({ [field]: rx })) };
    }),
  };
}
