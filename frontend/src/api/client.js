const TOKEN_KEY = 'ps_token';
const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* almacenamiento no disponible */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
  },
};

/** Se dispara cuando el backend responde 401 con una sesión iniciada. */
export const SESSION_EXPIRED_EVENT = 'ps:session-expired';

function buildUrl(path, params) {
  const url = `${BASE}${path}`;
  if (!params) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== false) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

async function request(method, path, { body, params, auth = true } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisá que la API esté encendida.');
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = data?.error?.message || `Error ${res.status}`;
    if (res.status === 401 && auth && token) {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(res.status, message, data?.error?.details);
  }
  return data;
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};
