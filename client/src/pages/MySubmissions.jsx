import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString()
}

function AnswerList({ response }) {
  const form = response.form
  const fieldMap = new Map((form?.formfield || []).map(f => [String(f._id), f]))
  // fallback if form not populated with fields: just show raw answers
  if (!form || !form.formfield) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {response.answers.map((a, i) => (
          <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>{a.fieldId}</div>
            <div style={{ fontWeight: 600 }}>{Array.isArray(a.value) ? a.value.join(', ') : String(a.value)}</div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {response.answers.map((a, i) => {
        const meta = fieldMap.get(String(a.fieldId))
        return (
          <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 2 }}>{meta?.title || a.fieldId}</div>
            {meta?.description && <div style={{ fontSize: '0.75rem', color: 'var(--muted-2)', marginBottom: 4 }}>{meta.description}</div>}
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{Array.isArray(a.value) ? a.value.join(', ') : String(a.value ?? '—')}</div>
            {meta && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>{meta.datatype}</div>}
          </div>
        )
      })}
    </div>
  )
}

export default function MySubmissions() {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // separate getMyFormData function (as requested)
  const getMyFormData = async () => {
    setLoading(true)
    setError('')
    try {
      // primary api alias – falls back to getMyResponses
      const fn = api.getMyFormData || api.getMyResponses
      const res = await fn()
      const list = Array.isArray(res.data) ? res.data : []
      setResponses(list)
    } catch (err) {
      if (err.status === 401) {
        navigate('/login')
        return
      }
      setError(err.message || 'Failed to load your submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      // allow guest to see message; redirect after check
    }
    getMyFormData()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--warm-white)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>🦀 Crab Form</Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/dashboard" style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 8 }}>Dashboard</Link>
            <button onClick={getMyFormData} disabled={loading} style={{ padding: '8px 14px', background: 'var(--orange)', color: 'var(--black)', borderRadius: 8, fontWeight: 700 }}>
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>
        </div>
      </nav>

      <main className="container" style={{ padding: '32px 16px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, marginBottom: 6 }}>My Form Data</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>All forms you have submitted (ResponseModel filled with your user data). Separate from owner view.</p>
        </motion.div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🦀</div>
            <p>Loading your submissions via getMyFormData...</p>
          </div>
        ) : responses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No submissions yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 16 }}>When you submit a form as a logged-in user, your ResponseModel is auto-filled with your name & email and appears here.</p>
            <Link to="/dashboard" style={{ background: 'var(--orange)', color: 'var(--black)', padding: '10px 18px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Go to Dashboard</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{responses.length} submission{responses.length !== 1 ? 's' : ''} found</p>
            {responses.map((r) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}
              >
                <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                      {r.form?.title || 'Form ' + String(r.form_id).slice(-6)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {r.form?.slug && <span>/{r.form.slug} · </span>}{formatDate(r.submittedAt || r.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Respondent</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.respondentName || '—'} {r.respondentEmail ? `· ${r.respondentEmail}` : ''}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{r.respondentId ? String(r.respondentId).slice(-6) : 'anon'}</div>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <AnswerList response={r} />
                  {r.form?.slug && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <Link to={`/f/${r.form.slug}`} style={{ fontSize: '0.85rem', color: 'var(--orange)', textDecoration: 'underline' }}>View form →</Link>
                      <span style={{ color: 'var(--border)', fontSize: '0.85rem' }}>|</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Status: {r.form.status}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, padding: 16, background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Developer note</h4>
          <pre style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
{`// Frontend - separate getMyFormData
import { api } from '../utils/api.js'
const res = await api.getMyFormData()   // GET /api/responses/my (auth)
const res2 = await api.getMyResponses() // alias

// Backend - auto-fills ResponseModel on submit
// POST /api/forms/:id/responses
// if Authorization: Bearer <token> present,
// SubmitResponseActivity fetches user data and fills:
// { respondentId, respondentEmail, respondentName }`}
          </pre>
        </div>
      </main>
    </div>
  )
}

// aliases for requested naming variations
export const getMyFormData = () => {}
export const getmyformdata = () => {}
