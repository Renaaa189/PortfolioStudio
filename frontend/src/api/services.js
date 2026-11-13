import { http } from './client.js';

/** Fábrica de servicios CRUD para no repetir el mismo código por entidad. */
const crud = (resource) => ({
  list: (params) => http.get(`/${resource}`, { params }),
  get: (id) => http.get(`/${resource}/${id}`),
  create: (data) => http.post(`/${resource}`, data),
  update: (id, data) => http.put(`/${resource}/${id}`, data),
  patch: (id, data) => http.patch(`/${resource}/${id}`, data),
  remove: (id) => http.delete(`/${resource}/${id}`),
});

export const projectsApi = { ...crud('projects'), filters: () => http.get('/projects/filters') };
export const skillsApi = { ...crud('skills'), categories: () => http.get('/skills/categories') };
export const certificatesApi = crud('certificates');

export const authApi = {
  register: (data) => http.post('/auth/register', data, { auth: false }),
  login: (email, password) => http.post('/auth/login', { email, password }, { auth: false }),
  me: () => http.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => http.put('/auth/password', { currentPassword, newPassword }),
};

export const profileApi = {
  get: () => http.get('/profile'),
  update: (data) => http.put('/profile', data),
  setPublished: (published) => http.patch('/profile/publish', { published }),
  updateDesign: (design) => http.put('/profile/design', design),
};

export const dashboardApi = { stats: () => http.get('/dashboard/stats') };

export const portfolioApi = {
  public: (username) => http.get(`/public/portfolios/${encodeURIComponent(username)}`, { auth: false }),
  preview: () => http.get('/portfolio/preview'),
};

export const uploadsApi = {
  upload: (kind, file) => {
    const form = new FormData();
    form.append('file', file);
    return http.post(`/uploads/${kind}`, form);
  },
};
