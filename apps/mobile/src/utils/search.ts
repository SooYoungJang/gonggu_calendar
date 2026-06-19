import type { Influencer } from '../types';

/**
 * Search influencers by Instagram username or display name.
 * Normalizes the query by stripping a leading @ and comparing case-insensitively.
 * Returns influencers that match any part of their username or display name.
 */
export function searchInfluencers(influencers: Influencer[], query: string) {
  const normalizedQuery = query.replace(/^@/, '').trim().toLowerCase();

  if (!normalizedQuery) return [];

  return influencers.filter((influencer) => {
    const username = influencer.instagramUsername.toLowerCase();
    const displayName = influencer.displayName?.toLowerCase() ?? '';
    return username.includes(normalizedQuery) || displayName.includes(normalizedQuery);
  });
}
