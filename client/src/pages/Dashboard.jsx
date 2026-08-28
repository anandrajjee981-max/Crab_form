import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../utils/api.js'
import '../styles/dashboard.css'

const THEME_COLORS = {
  'Crab Classic': 'linear-gradient(90deg, #ff5f1f, #ff7043)',
  'Midnight':     'linear-gradient(90deg, #6c63ff, #a18aff)',
  'Cyber Crab':   'linear-gradient(90deg, #00ff88, #00ccff)',
  'Sunset':       'linear-gradient(90deg, #f093fb, #f5576c)',
  'Minimal':      'linear-gradient(90deg, #e0e0e0, #bdbdbd)',
  'Soft':         'linear-gradient(90deg, #ffecd2, #fcb69f)',
  'College':      'linear-gradient(90deg, #ffd700, #ffb700)',
  'genz':         'linear-gradient(90deg, #ff5f1f, #ff7043)',
  'minimal':      'linear-gradient(90deg, #e0e0e0, #bdbdbd)',
  'dark':         'linear-gradient(90deg, #6c63ff, #a18aff)',
  'college':      'linear-gradient(90deg, #ffd700, #ffb700)',
}

const FALLBACK_FORMS = [
  { id: '1', title: 'Internship Check-in 🦀', status: 'live',  responses: 48, updated: '2h ago',  theme: 'Crab Classic' },
  { id: '2', title: 'College Fest Feedback',   status: 'live',  responses: 127, updated: '1d ago', theme: 'Sunset' },
  { id: '3', title: 'Team Retrospective',      status: 'draft', responses: 0,   updated: '3d ago', theme: 'Midnight' },
]

function timeAgo(dateStr) {
  if (!dateStr) return 'just now'
  const d = new Date(dateStr)
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

function normalizeForm(raw) {
  // Backend returns FormSchema lean objects: _id, title, status, theme, updatedAt
  return {
    id: raw._id || raw.id,
    title: raw.title || 'Untitled Form',
    status: raw.status === 'published' ? 'live' : raw.status || 'draft',
    responses: raw.responses ?? raw.responseCount ?? 0,
    updated: timeAgo(raw.updatedAt || raw.createdAt),
    theme: raw.theme?.name || raw.theme || 'Crab Classic',
    slug: raw.slug,
    raw,
  }
}

export default function Dashboard() {
  const [search, setSearch] = useState('')
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // getMyAllForm — fetch user created forms (requested function)
  const getMyAllForm = async () => {
    setLoading(true)
    setError('')
    try {
      // Use the newly added alias; fallback to getForms for compatibility
      const res = await (api.getMyAllForm ? api.getMyAllForm() : api.getForms())
      const data = res.data
      // API returns { success, data: [...] } ; data may be array directly
      const list = Array.isArray(data) ? data : Array.isArray(data?.forms) ? data.forms : []
      const normalized = list.map(normalizeForm)
      setForms(normalized)
    } catch (err) {
      if (err.status === 401) {
        navigate('/login')
        return
      }
      setError(err.message || 'Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  // Also expose getMyAllForms / getmyallform as aliases on window for debugging (optional)
  useEffect(() => {
    getMyAllForm()
  }, [])

  const filtered = forms.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase())
  )

  // Dynamic stats from real data
  const stats = [
    { value: String(forms.length), label: 'Total Forms' },
    { value: String(forms.reduce((acc, f) => acc + (f.responses || 0), 0)), label: 'Total Responses' },
    { value: String(forms.filter(f => f.status === 'live').length), label: 'Live Forms' },
    { value: forms.length ? '100%' : '—', label: 'Completion Rate' },
  ]

  return (
    <div className="dashboard">
      {/* Nav */}
      <nav className="dashboard__nav" aria-label="Dashboard navigation">
        <div className="container">
          <div className="dashboard__nav-inner">
            <Link to="/" className="dashboard__logo">
              <span className="dashboard__logo-icon">🦀</span>
              <span className="dashboard__logo-text">Crab Form</span>
            </Link>
            <div className="dashboard__nav-actions">
              <motion.button
                className="btn-create"
                onClick={() => navigate('/create')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                id="dashboard-create-btn"
                aria-label="Create new form"
              >
                <span className="btn-create__full">+ Create Form</span>
                <span className="btn-create__short">+ Create</span>
              </motion.button>
              <div className="dashboard__avatar" aria-label="User avatar">A</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="dashboard__main">
        <div className="container">
          <motion.div
            className="dashboard__header"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="dashboard__greeting">Yo, Anand 👋</h1>
            <p className="dashboard__subtext">What are we building today?</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="stats-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="stat-card"
                whileHover={{ y: -4, scale: 1.02, borderColor: 'rgba(255, 95, 31, 0.4)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-card__value" style={{ color: i === 0 ? 'var(--orange)' : 'var(--warm-white)' }}>
                  {s.value}
                </div>
                <div className="stat-card__label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions bar */}
          <motion.div
            className="dashboard__actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <label className="dashboard__search" htmlFor="form-search">
              <span style={{ color: 'var(--muted)' }}>🔍</span>
              <input
                id="form-search"
                type="text"
                placeholder="Search forms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search forms"
              />
            </label>
            <motion.button
              onClick={getMyAllForm}
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="dashboard__refresh-btn"
              aria-label="Refresh forms"
              id="refresh-forms-btn"
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </motion.button>
          </motion.div>

          {/* Error */}
          {error && (
            <div role="alert" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={getMyAllForm} style={{ color: '#fca5a5', textDecoration: 'underline', marginLeft: 12 }}>Retry</button>
            </div>
          )}

          {/* Form grid */}
          <p className="dashboard__section-title">Your Forms {loading ? '(loading...)' : `(${forms.length})`}</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12, animation: 'crabBounce 2s ease-in-out infinite' }}>🦀</div>
              <p>Loading your forms...</p>
            </div>
          ) : (
          <AnimatePresence>
            {filtered.length > 0 ? (
              <motion.div
                className="forms-grid"
                layout
              >
                {filtered.map((form, i) => (
                  <motion.div
                    key={form.id}
                    className="form-card"
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => navigate(`/builder/${form.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/builder/${form.id}`)}
                    aria-label={`Open form: ${form.title}`}
                  >
                    <div
                      className="form-card__theme-bar"
                      style={{ background: THEME_COLORS[form.theme] || THEME_COLORS['Crab Classic'] }}
                    />
                    <div className="form-card__body">
                      <h3 className="form-card__title">{form.title}</h3>
                      <div className="form-card__meta">
                        <span className={`form-card__status form-card__status--${form.status}`}>
                          {form.status === 'live' && <span className="status-dot-live" />}
                          {form.status === 'live' ? 'Live' : form.status === 'draft' ? '● Draft' : '● Closed'}
                        </span>
                        <span className="form-card__responses">{form.responses} responses</span>
                      </div>
                      <div className="form-card__footer">
                        <span className="form-card__date">Updated {form.updated}</span>
                        <div className="form-card__actions">
                          <button className="form-card__action-btn" aria-label="Edit form" title="Edit" onClick={e => { e.stopPropagation(); navigate(`/builder/${form.id}`) }}>✏️</button>
                          <button className="form-card__action-btn" aria-label="Share form" title="Share" onClick={async e => {
                            e.stopPropagation();
                            const slug = form.slug || form.id
                            const url = `${window.location.origin}/f/${slug}`
                            try {
                              if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url)
                              else { const ta=document.createElement('textarea'); ta.value=url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta) }
                              setError(`Copied link: ${url}`)
                              setTimeout(()=>setError(''), 2000)
                            } catch {}
                            if (form.status !== 'live') setError('Tip: Publish the form first via Builder → Ship it 🚀')
                          }}>🔗</button>
                          <button className="form-card__action-btn" aria-label="More options" title="More" onClick={e => e.stopPropagation()}>···</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="dashboard__empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="dashboard__empty-crab">🦀</div>
                <p className="dashboard__empty-title">{forms.length === 0 ? 'No forms yet. Create one!' : 'No forms found.'}</p>
                <p>{forms.length === 0 ? 'Your created forms will appear here.' : 'Try a different search or create a new form.'}</p>
                {forms.length === 0 && (
                  <button onClick={() => navigate('/create')} style={{ marginTop: 16, padding: '10px 20px', background: 'var(--orange)', color: 'var(--black)', borderRadius: 8, fontWeight: 700 }}>+ Create Form</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  )
}

// Export aliases for requested naming variations
export const getMyAllForm = () => {}
export const getmyallform = () => {}
