import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const EmployeeService = {
  getAll: () => api.get('/employees').then(res => res.data),
  getById: (id: string) => api.get(`/employees/${id}`).then(res => res.data),
  create: (data: any) => api.post('/employees', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/employees/${id}`).then(res => res.data),
};

export const EstimateService = {
  getAll: () => api.get('/estimates').then(res => res.data),
  getById: (id: string) => api.get(`/estimates/${id}`).then(res => res.data),
  create: (data: any) => api.post('/estimates', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/estimates/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/estimates/${id}`).then(res => res.data),
};

export const ProductService = {
  getAll: () => api.get('/products').then(res => res.data),
  getById: (id: string) => api.get(`/products/${id}`).then(res => res.data),
  create: (data: any) => api.post('/products', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/products/${id}`).then(res => res.data),
};

export const KhatabookService = {
  getAll: () => api.get('/khatabook').then(res => res.data),
  getById: (id: string) => api.get(`/khatabook/${id}`).then(res => res.data),
  create: (data: any) => api.post('/khatabook', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/khatabook/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/khatabook/${id}`).then(res => res.data),
};

export const CustomerService = {
  getAll: () => api.get('/customers').then(res => res.data),
  getById: (id: string) => api.get(`/customers/${id}`).then(res => res.data),
  create: (data: any) => api.post('/customers', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then(res => res.data),
};

export const CuttingService = {
  getAll: () => api.get('/cutting').then(res => res.data),
  getById: (id: string) => api.get(`/cutting/${id}`).then(res => res.data),
  create: (data: any) => api.post('/cutting', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/cutting/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/cutting/${id}`).then(res => res.data),
};

export const ChallanService = {
  getAll: () => api.get('/challans').then(res => res.data),
  getById: (id: string) => api.get(`/challans/${id}`).then(res => res.data),
  create: (data: any) => api.post('/challans', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/challans/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/challans/${id}`).then(res => res.data),
};

export const SettingsService = {
  get: () => api.get('/settings').then(res => res.data),
  update: (data: any) => api.put('/settings', data).then(res => res.data),
};

export default api;
