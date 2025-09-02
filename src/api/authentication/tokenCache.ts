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

  let currentClientId = CLIENT_ID;
  let currentClientSecret = CLIENT_SECRET;
  
  const fetchToken = async (clientId: string, clientSecret: string) => {
    const tokenRequest = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    };

    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || process.env.VITE_API_ORIGIN}api/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequest),
    });

    return { response: res, usedDefaultCredentials: clientId === CLIENT_ID };
  };

  // First try with current credentials
  let tokenResponse = await fetchToken(currentClientId, currentClientSecret);
  
  // If unauthorized, try to get new client credentials
  if (tokenResponse.response.status === 401 && tokenResponse.usedDefaultCredentials) {
    try {
      const clientRes = await fetch(`${import.meta.env.VITE_API_ORIGIN || process.env.VITE_API_ORIGIN}api/v1/clients`, {
        method: 'POST',
        headers: { 
          'accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          name: 'Stockfolio Web Client',
          description: 'Automatically generated client for Stockfolio web application'
        })
      });
      
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        if (clientData.client_id && clientData.client_secret) {
          // Update environment variables for future use
          process.env.VITE_CLIENT_ID = clientData.client_id;
          process.env.VITE_CLIENT_SECRET = clientData.client_secret;
          
          // Retry with new credentials
          tokenResponse = await fetchToken(clientData.client_id, clientData.client_secret);
        }
      }
    } catch (error) {
      console.error('Failed to refresh client credentials:', error);
    }
  }

  if (!tokenResponse.response.ok) {
    throw new Error(`Token request failed: ${tokenResponse.response.status}`);
  }

  const data = await tokenResponse.response.json();
  if (!data.access_token || !data.expires_in) {
    throw new Error('Malformed token response');
  }

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000) - 10000; // 10s buffer
  return cachedToken;
}
