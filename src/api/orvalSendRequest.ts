import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getCachedAccessToken } from './authentication/tokenCache';

// Use Vite env variable if available, fallback to default
const API_ORIGIN =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_ORIGIN
    ? import.meta.env.VITE_API_ORIGIN
    : process.env.VITE_API_ORIGIN || 'http://0.0.0.0:8000/';


export function useSendRequest<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  // Prepend API_ORIGIN if the URL is relative
  const url = config.url?.startsWith('http') ? config.url : `${API_ORIGIN}${config.url?.startsWith('/') ? config.url.slice(1) : config.url}`;
  const instance = axios.create({ baseURL: API_ORIGIN });

  // Add response/error interceptors if needed (example: refresh token, logging)
  instance.interceptors.response.use(
    response => response,
    error => {
      // Optionally handle errors globally
      return Promise.reject(error);
    }
  );

  // Return a Promise, not an async function
  return getCachedAccessToken().then(token => {
    const headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
    const requestConfig = { ...config, url, headers };
    console.log('About to send API request:', requestConfig);
    return instance.request<T>(requestConfig).then(resp => {
      console.log('API response:', resp);
      return resp;
    }).catch(err => {
      console.error('API error:', err);
      throw err;
    });
  });
}

