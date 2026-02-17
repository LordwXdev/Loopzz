import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth/login') window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const videosAPI = {
  upload: (formData: FormData) => api.post('/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (page = 1) => api.get(`/videos?page=${page}`),
  getOne: (id: string) => api.get(`/videos/${id}`),
  like: (id: string) => api.post(`/videos/${id}/like`),
  getByUser: (userId: string) => api.get(`/videos/user/${userId}`),
};

export const tracksAPI = {
  upload: (formData: FormData) => api.post('/tracks', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (page = 1) => api.get(`/tracks?page=${page}`),
  getOne: (id: string) => api.get(`/tracks/${id}`),
};

export const liveAPI = {
  start: (title: string) => api.post('/live/start', { title }),
  end: (id: string) => api.post(`/live/${id}/end`),
  getActive: () => api.get('/live'),
  getSession: (id: string) => api.get(`/live/${id}`),
};

export const tipsAPI = {
  send: (data: { toArtistId: string; amount: number; message?: string }) => api.post('/tips', data),
  getForArtist: (artistId: string) => api.get(`/tips/artist/${artistId}`),
  getMy: () => api.get('/tips/my'),
};

export const feedAPI = {
  get: (page = 1) => api.get(`/feed?page=${page}`),
  trending: () => api.get('/feed/trending'),
};

export const transactionsAPI = {
  getMy: (page = 1) => api.get(`/transactions?page=${page}`),
  getEarnings: () => api.get('/transactions/earnings'),
};

export const referralsAPI = {
  getMy: () => api.get('/referrals'),
  getCode: () => api.get('/referrals/code'),
};

export const usersAPI = {
  getOne: (id: string) => api.get(`/users/${id}`),
  getArtists: () => api.get('/users/artists'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
};
