import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { GroupBuy, Influencer, Submission } from './types';
export { searchInfluencers } from './utils/search';

export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

export const fallbackGroupBuys: GroupBuy[] = [
  {
    id: 'sample-1',
    productName: '비건 선크림 공구',
    brandName: 'Sample Beauty',
    endDate: '2026-06-15T23:59:59+09:00',
    purchaseUrl: 'https://example.com',
    discountInfo: '20% 할인',
    summary: '인플루언서 게시물에서 감지된 공동구매 후보입니다.',
    confidence: 0.82,
    rawPost: {
      postUrl: 'https://www.instagram.com/',
      influencer: {
        instagramUsername: 'sample_influencer',
      },
    },
  },
];

export async function fetchGroupBuys() {
  const response = await fetch(`${API_BASE_URL}/group-buys`);

  if (!response.ok) {
    throw new Error('API unavailable');
  }

  return (await response.json()) as GroupBuy[];
}

export async function fetchInfluencers() {
  const response = await fetch(`${API_BASE_URL}/influencers`);

  if (!response.ok) {
    throw new Error('Influencers API unavailable');
  }

  return (await response.json()) as Influencer[];
}

export async function fetchGroupBuysByInfluencer(instagramUsername: string) {
  const normalizedUsername = instagramUsername.replace(/^@/, '').toLowerCase();
  const groupBuys = await fetchGroupBuys();

  return groupBuys.filter(
    (item) => item.rawPost.influencer.instagramUsername.replace(/^@/, '').toLowerCase() === normalizedUsername,
  );
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('gonggu.authToken');
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync('gonggu.authToken', token);
  } catch {
    // ignore
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('gonggu.authToken');
  } catch {
    // ignore
  }
}

export function getAdminHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Note: In actual implementation, this would be async and we'd need to handle it differently
  // For now, we'll use a synchronous approach for web (localStorage) and async for native
  if (Platform.OS === 'web') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (typeof window !== 'undefined' && window.localStorage?.getItem('gonggu.authToken')) as string | null;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage not available (e.g., SSR)
    }
  }

  return headers;
}

export async function fetchAdminJson<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Admin API failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchAdminSubmissions() {
  const statuses: Submission['status'][] = ['REVIEW_REQUIRED', 'APPROVED', 'REJECTED'];
  const groups = await Promise.all(
    statuses.map((status) => fetchAdminJson<Submission[]>(`/admin/submissions?status=${status}&limit=50`)),
  );

  return groups.flat();
}

export async function patchAdminJson<T>(path: string, body: unknown) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Admin API failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function deleteAdminJson<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Admin API failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function postAdminJson<T>(path: string, body?: unknown) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Admin API failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function postPublicJson<T>(path: string, body: unknown) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Public API failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
