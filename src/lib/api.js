import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
})

// ── Request interceptor: inject JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stedad_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stedad_token')
      localStorage.removeItem('stedad_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (data) => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
}

// ── Sales ─────────────────────────────────────────────────────────────────────
export const salesApi = {
  list:           (params)     => api.get('/sales', { params }),
  byId:           (id)         => api.get(`/sales/${id}`),
  create:         (data)       => api.post('/sales', data),
  update:         (id, data)   => api.patch(`/sales/${id}`, data),
  daily:          (params)     => api.get('/sales/daily', { params }),
  eod:            (params)     => api.get('/sales/eod', { params }),
  searchCustomer: (name)       => api.get('/sales/search-customer', { params: { name } }),
  receipt:        (id)         => api.get(`/sales/${id}/receipt`, { responseType: 'text' }),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list:   (params) => api.get('/products', { params }),
  byId:   (id)     => api.get(`/products/${id}`),
  create: (data)   => api.post('/products', data),
  update: (id, d)  => api.patch(`/products/${id}`, d),
  delete: (id)     => api.delete(`/products/${id}`),
}

// ── Staff ─────────────────────────────────────────────────────────────────────
export const staffApi = {
  list:         ()        => api.get('/staff'),
  byId:         (id)      => api.get(`/staff/${id}`),
  create:       (data)    => api.post('/staff', data),
  update:       (id, d)   => api.patch(`/staff/${id}`, d),
  delete:       (id)      => api.delete(`/staff/${id}`),
  toggleStatus: (id)      => api.patch(`/staff/${id}/toggle-status`),
}
