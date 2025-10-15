// Utility for fetching and caching the API access token
import { useGetTokenApiV1TokenPost } from './authentication';

const CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID || process.env.VITE_API_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_API_CLIENT_SECRET || process.env.VITE_API_CLIENT_SECRET;

// Use internal API for token requests, fallback to external API
const API_BASE_URL = import.meta.env.VITE_INTERNAL_API_ORIGIN || process.env.VITE_INTERNAL_API_ORIGIN || import.meta.env.VITE_API_ORIGIN || process.env.VITE_API_ORIGIN;

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

  const fetchToken = async (clientId: string, clientSecret: string) => {
    const tokenRequest = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    };

    const res = await fetch(`${API_BASE_URL}api/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequest),
    });

    return res;
  };

  // Always use the configured credentials
  const tokenResponse = await fetchToken(CLIENT_ID, CLIENT_SECRET);

  if (!tokenResponse.ok) {
    throw new Error(`Token request failed: ${tokenResponse.status}`);
  }

  const data = await tokenResponse.json();
  if (!data.access_token || !data.expires_in) {
    throw new Error('Malformed token response');
  }

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000) - 10000; // 10s buffer
  return cachedToken;
}
