import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:8000' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
}

export const projectsAPI = {
  list:   ()           => API.get('/projects/'),
  create: (data)       => API.post('/projects/', data),
  get:    (id)         => API.get(`/projects/${id}`),
  delete: (id)         => API.delete(`/projects/${id}`),
}

export const predictionsAPI = {
  predict:        (projectId) => API.post(`/predictions/predict/${projectId}`),
  predictInstant: (data)      => API.post('/predictions/predict-instant', data),
  history:        (projectId) => API.get(`/predictions/history/${projectId}`),
  summary:        ()          => API.get('/predictions/summary/all'),
}

export default API
