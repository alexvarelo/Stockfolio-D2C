// Utility for fetching and caching the API access token
import { useGetTokenApiV1TokenPost } from './authentication';

const CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID || process.env.VITE_API_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_API_CLIENT_SECRET || process.env.VITE_API_CLIENT_SECRET;

// In-memory cache (module scope)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Get a valid access token, refreshing if expired.
 * Returns a Promise that resolves to the token string.
 */
export async function getCachedAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  // Fetch a new token
  const tokenRequest = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  };

  // Use fetch instead of react-query for low-level utility
  const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || process.env.VITE_API_ORIGIN}api/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokenRequest),
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token || !data.expires_in) throw new Error('Malformed token response');

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000) - 10000; // 10s buffer
  return cachedToken;
}
