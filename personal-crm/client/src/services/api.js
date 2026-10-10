const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function request(path, options = {}) {
  const token = localStorage.getItem('crm-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith('/auth')) {
      localStorage.removeItem('crm-token');
      localStorage.removeItem('crm-user');
      window.dispatchEvent(new Event('crm:unauthorized'));
    }
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload;
}

export const api = {
  login: body => request('/auth/login', { method: 'POST', body }),
  register: body => request('/auth/register', { method: 'POST', body }),
  me: () => request('/auth/me'),
  updateProfile: body => request('/auth/profile', { method: 'PATCH', body }),
  dashboard: () => request('/dashboard'),
  reports: () => request('/reports'),
  list: (resource, search = '', filters = {}) => {
    const params = new URLSearchParams(filters);
    if (search) params.set('search', search);
    const query = params.toString();
    return request(`/${resource}${query ? `?${query}` : ''}`);
  },
  get: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, body) => request(`/${resource}`, { method: 'POST', body }),
  update: (resource, id, body) => request(`/${resource}/${id}`, { method: 'PATCH', body }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' })
};
