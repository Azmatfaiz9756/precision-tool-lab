// API Client — Firebase Auth + PHP/MySQL Backend
// 
// MODES:
//   MOCK MODE  (default): all data stored in localStorage. No backend needed.
//                          Set VITE_API_MODE=mock  OR leave VITE_API_BASE_URL blank.
//   LIVE MODE:             Connects to your PHP/MySQL REST API.
//                          Set VITE_API_BASE_URL=https://yourdomain.com/api
//                          Auth uses Firebase ID token sent as Bearer token.

import initialProducts from './products.json';
import { getCurrentIdToken } from '@/lib/firebaseAuth';

const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL || '/api';
const IS_MOCK_MODE  = import.meta.env.VITE_API_MODE === 'mock';

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

async function apiRequest(method, url, data = null) {
  const headers = { 'Content-Type': 'application/json' };

  // Attach Firebase ID token as Bearer token for every authenticated request
  try {
    const token = await getCurrentIdToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Not logged in — proceed without token (public endpoints will still work)
  }

  const options = { method, headers };
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

// ─── Mock Database ─────────────────────────────────────────────────────────────

// Clean up old large product keys to free localStorage quota
try { localStorage.removeItem('mock_db_Product'); } catch (e) {}

const getMockData = (entityName) => {
  if (entityName === 'Product') {
    let customProducts = [];
    try {
      const d = localStorage.getItem('mock_db_Product_custom');
      if (d) customProducts = JSON.parse(d);
    } catch (e) { customProducts = []; }

    let deletedIds = [];
    try {
      const d = localStorage.getItem('mock_db_Product_deleted');
      if (d) deletedIds = JSON.parse(d);
    } catch (e) { deletedIds = []; }

    const activeInitial = initialProducts.filter(p => !deletedIds.includes(p.id));
    const merged = [...customProducts];
    for (const p of activeInitial) {
      if (!merged.some(m => m.id === p.id)) merged.push(p);
    }
    return merged;
  }

  const key  = `mock_db_${entityName}`;
  const data = localStorage.getItem(key);
  if (!data) { localStorage.setItem(key, JSON.stringify([])); return []; }
  try { return JSON.parse(data); } catch (e) { localStorage.setItem(key, JSON.stringify([])); return []; }
};

const saveMockData = (entityName, data) => {
  if (entityName === 'Product') {
    const custom = data.filter(p => {
      const initial = initialProducts.find(i => i.id === p.id);
      if (!initial) return true;
      return JSON.stringify(initial) !== JSON.stringify(p);
    });
    localStorage.setItem('mock_db_Product_custom', JSON.stringify(custom));
    const currentIds = data.map(p => p.id);
    const deleted    = initialProducts.filter(p => !currentIds.includes(p.id)).map(p => p.id);
    localStorage.setItem('mock_db_Product_deleted', JSON.stringify(deleted));
    return;
  }
  localStorage.setItem(`mock_db_${entityName}`, JSON.stringify(data));
};

const mockRequest = {
  list: (entityName, order, limit) => {
    let items = getMockData(entityName);
    if (order && order.startsWith('-')) {
      const field = order.substring(1);
      items = [...items].sort((a, b) => (a[field] < b[field] ? 1 : a[field] > b[field] ? -1 : 0));
    }
    return limit ? items.slice(0, limit) : items;
  },
  get: (entityName, id) => {
    const item = getMockData(entityName).find(i => i.id === id);
    if (!item) throw new Error(`${entityName} with id ${id} not found`);
    return item;
  },
  create: (entityName, values) => {
    const items   = getMockData(entityName);
    const newItem = { id: `${entityName.toLowerCase()}-${Math.random().toString(36).substr(2,9)}`, created_date: new Date().toISOString(), ...values };
    items.unshift(newItem);
    saveMockData(entityName, items);
    return newItem;
  },
  update: (entityName, id, values) => {
    const items = getMockData(entityName);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`${entityName} with id ${id} not found`);
    items[index] = { ...items[index], ...values };
    saveMockData(entityName, items);
    return items[index];
  },
  delete: (entityName, id) => {
    let items = getMockData(entityName);
    const len = items.length;
    items = items.filter(i => i.id !== id);
    if (items.length === len) throw new Error(`${entityName} with id ${id} not found`);
    saveMockData(entityName, items);
    return { success: true };
  },
};

// ─── Mock User (for mock mode only) ─────────────────────────────────────────
// NOTE: In LIVE MODE, user identity comes from Firebase Auth (see AuthContext).
//       The mock_user key is only used for the mock auth.me() call.

const getMockUser = () => {
  const u = localStorage.getItem('mock_user');
  return u ? JSON.parse(u) : null;
};

// ─── Entity Factory ────────────────────────────────────────────────────────────

function makeEntity(name) {
  return {
    list:   async (order, limit) => IS_MOCK_MODE ? mockRequest.list(name, order, limit)   : apiRequest('GET',    `/entities/${name}?order=${order||''}&limit=${limit||''}`),
    filter: async (filters, order, limit) => {
      if (IS_MOCK_MODE) {
        let items = mockRequest.list(name, order, limit);
        for (const [k, v] of Object.entries(filters)) {
          items = items.filter(i => i[k] === v);
        }
        return items;
      }
      const params = new URLSearchParams();
      if (order) params.append('order', order);
      if (limit) params.append('limit', limit);
      for (const [k, v] of Object.entries(filters)) params.append(k, v);
      return apiRequest('GET', `/entities/${name}?${params.toString()}`);
    },
    get:    async (id)           => IS_MOCK_MODE ? mockRequest.get(name, id)               : apiRequest('GET',    `/entities/${name}/${id}`),
    create: async (values)       => IS_MOCK_MODE ? mockRequest.create(name, values)        : apiRequest('POST',   `/entities/${name}`, values),
    update: async (id, values)   => IS_MOCK_MODE ? mockRequest.update(name, id, values)    : apiRequest('PUT',    `/entities/${name}/${id}`, values),
    delete: async (id)           => IS_MOCK_MODE ? mockRequest.delete(name, id)             : apiRequest('DELETE', `/entities/${name}/${id}`),
  };
}

// ─── Exported API Client ───────────────────────────────────────────────────────

export const apiClient = {
  /**
   * Auth — In LIVE MODE, Firebase handles auth directly (see firebaseAuth.js).
   * The methods below are kept for mock mode compatibility and the AuthContext.
   * In live mode they are largely unused; Firebase SDK is called directly.
   */
  auth: {
    me: async () => {
      if (IS_MOCK_MODE) {
        const user = getMockUser();
        if (!user) throw { status: 401, message: 'Unauthorized' };
        return user;
      }
      // In live mode — fetch user profile from PHP backend
      return apiRequest('GET', '/auth/me');
    },

    logout: async (redirectUrl = null) => {
      if (IS_MOCK_MODE) {
        localStorage.removeItem('mock_user');
        if (redirectUrl) window.location.href = '/login';
        return;
      }
      // Firebase logout is handled by AuthContext; optionally call PHP to invalidate session
      try { await apiRequest('POST', '/auth/logout'); } catch (e) { /* ignore */ }
      if (redirectUrl) window.location.href = '/login';
    },

    redirectToLogin: (redirectUrl = null) => {
      window.location.href = `/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
    },

    // Legacy mock-only methods kept to avoid breaking any remaining callers
    loginViaEmailPassword: async (email, password) => {
      if (!IS_MOCK_MODE) throw new Error('Use firebaseAuth.loginWithEmail() in live mode');
      if (password.length < 4) throw new Error('Password must be at least 4 characters');
      const mockUser = { id: 'usr-mock', email, name: email.split('@')[0], role: email.startsWith('admin') ? 'admin' : 'user', created_date: new Date().toISOString() };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      return { user: mockUser };
    },
    registerViaEmailPassword: async ({ email, password, name }) => {
      if (!IS_MOCK_MODE) throw new Error('Use firebaseAuth.registerWithEmail() in live mode');
      const mockUser = { id: 'usr-mock', email, name: name || email.split('@')[0], role: 'user', created_date: new Date().toISOString() };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      return { user: mockUser };
    },
  },

  entities: {
    Product:        makeEntity('Product'),
    Order:          makeEntity('Order'),
    Review:         makeEntity('Review'),
    WishlistItem:   makeEntity('WishlistItem'),
    Address:        makeEntity('Address'),
    CartItem:       makeEntity('CartItem'),
    Coupon:         makeEntity('Coupon'),
    Newsletter:     makeEntity('Newsletter'),
    ContactMessage: makeEntity('ContactMessage'),
    User:           makeEntity('User'),
  },
  settings: {
    get: async () => {
      if (IS_MOCK_MODE) {
        const str = localStorage.getItem("tsttools_settings");
        return str ? JSON.parse(str) : {};
      }
      return apiRequest('GET', '/settings');
    },
    update: async (values) => {
      if (IS_MOCK_MODE) {
        localStorage.setItem("tsttools_settings", JSON.stringify(values));
        return { success: true };
      }
      return apiRequest('POST', '/settings', values);
    }
  },
  chat: {
    send: (message) => apiRequest('POST', '/chat', { message })
  }
};
