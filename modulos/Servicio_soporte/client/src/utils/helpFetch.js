// src/utils/helpFetch.js - Versión limpia JS (sin TS)
/**
 * HELP FETCH - Utilidad centralizada API (inspirado backend MVC pattern)
 * Features: proxy /api, cookies auth, timeout, retry, logging emojis 🟢🔴
 */

// Config global (como tu .env)
const API_CONFIG = {
  baseURL: '/api',
  credentials: 'include',
  timeout: 10000,
  retries: 2
}

async function baseFetch(input, init) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(input, {
      ...init,
      credentials: API_CONFIG.credentials,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry solo errores recuperables
    if (error.name === 'AbortError' && init?.retriesUsed < API_CONFIG.retries) {
      init.retriesUsed = (init.retriesUsed || 0) + 1;
      console.warn(`🔄 Retry ${input} (${init.retriesUsed}/${API_CONFIG.retries})`);
      return baseFetch(input, init);
    }
    throw error;
  }
}

export async function apiGET(endpoint, params) {
  const url = new URL(`${API_CONFIG.baseURL}${endpoint}`, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.append(k, String(v)));
  
  console.log(`📡 GET ${url}`);
  const res = await baseFetch(url);
  return res.json();
}

export async function apiPOST(endpoint, data) {
  console.log(`📤 POST ${API_CONFIG.baseURL}${endpoint}`, data);
  const res = await baseFetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: data ? JSON.stringify(data) : undefined
  });
  return res.json();
}

export async function apiDELETE(endpoint) {
  console.log(`🗑️ DELETE ${API_CONFIG.baseURL}${endpoint}`);
  const res = await baseFetch(`${API_CONFIG.baseURL}${endpoint}`, {method: 'DELETE'});
  return res.ok;
}

export async function apiPATCH(endpoint, data) {
  console.log(`🛠️ PATCH ${API_CONFIG.baseURL}${endpoint}`, data);
  const res = await baseFetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: data ? JSON.stringify(data) : undefined
  });
  return res.json();
}

export async function apiPUT(endpoint, data) {
  console.log(`🔄 PUT ${API_CONFIG.baseURL}${endpoint}`, data);
  const res = await baseFetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: data ? JSON.stringify(data) : undefined
  });
  return res.json();
}

// API simple
export default {
  GET: apiGET,
  POST: apiPOST,
  DELETE: apiDELETE,
  PATCH: apiPATCH,
  PUT: apiPUT
}

