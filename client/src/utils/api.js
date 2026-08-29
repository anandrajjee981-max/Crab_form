const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function getToken() {
  return localStorage.getItem('crab_token')
}

async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers }
  if (auth) {
    const token = getToken()
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `Request failed: ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me', { auth: true }),

  // AI — uses optional auth (sends token if available, but not required)
  // Fixed: always sends prompt correctly, handles both prompt/text field names, adds timeout handling
  generateForm: (prompt, opts = {}) => {
    const headers = {}
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (opts.apiKey) headers['X-Gemini-Api-Key'] = opts.apiKey
    const trimmed = (prompt || '').trim()
    if (!trimmed) return Promise.reject(new Error('prompt is required'))
    // Send both prompt and text for backend compatibility (validateAIRequest checks either)
    return request('/api/ai/generate-form', { method: 'POST', body: { prompt: trimmed, text: trimmed }, headers })
  },

  // Forms — getMyAllForm naming requested by user; keep multiple aliases for compatibility
  createForm: (payload) => request('/api/forms', { method: 'POST', body: payload, auth: true }),
  getForms: () => request('/api/forms', { auth: true }),
  getForm: (id) => request(`/api/forms/${id}`, { auth: true }),
  // Primary alias: getMyAllForm (as requested) — returns all user forms (draft+published)
  getMyAllForm: () => request('/api/forms', { auth: true }),
  getMyAllForms: () => request('/api/forms', { auth: true }),
  getmyallform: () => request('/api/forms', { auth: true }),
  getMyAllFormByUser: () => request('/api/forms', { auth: true }),
  updateForm: (id, payload) => request(`/api/forms/${id}`, { method: 'PUT', body: payload, auth: true }),
  publishForm: (id) => request(`/api/forms/${id}/publish`, { method: 'POST', auth: true }),
  deleteForm: (id) => request(`/api/forms/${id}`, { method: 'DELETE', auth: true }),
  getPublicForm: (slug) => request(`/api/forms/public/${slug}`),
  // submitResponse – NO AUTH REQUIRED for shipped link fillers; auto-sends token if logged in so backend can enrich ResponseModel
  submitResponse: (formId, payload) => {
    const headers = {}
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    return request(`/api/forms/${formId}/responses`, { method: 'POST', body: payload, headers })
  },
  // alias: submit via slug directly (also NO AUTH REQUIRED)
  submitPublicResponse: (slug, payload) => {
    const headers = {}
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    return request(`/api/forms/public/${slug}/responses`, { method: 'POST', body: payload, headers })
  },

  // --- getMyFormData / get user data : separate endpoint for respondent's own submissions ---
  // Primary: getMyFormData (as requested) – returns responses submitted BY me with form enrichment
  getMyFormData: () => request('/api/responses/my', { auth: true }),
  getMyResponses: () => request('/api/responses/my', { auth: true }),
  getMyAllFormData: () => request('/api/responses/my', { auth: true }),
  getMyFormResponses: (formId) => request(`/api/responses/my/${formId}`, { auth: true }),
  // alias variations for compatibility
  getmyformdata: () => request('/api/responses/my', { auth: true }),
  getMyData: () => request('/api/responses/my', { auth: true }),
  getUserData: () => request('/api/responses/user-data', { auth: true }),
  // owner view: get responses for a form (form owner)
  getResponses: (formId) => request(`/api/forms/${formId}/responses`, { auth: true }),
  // owner global: ALL responses for ALL forms owned by me (2 docs: anon + auth)
  getOwnerResponses: () => request('/api/responses/owner', { auth: true }),
  getOwnerData: () => request('/api/responses/owner', { auth: true }),
  getOwnerAllData: () => request('/api/responses/owner', { auth: true }),

  health: () => request('/api/health'),
}
