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
  // Prefer server-enriched answers (question instead of just que id)
  const enriched = response.answersEnriched || response.answersWithQuestion
  if (Array.isArray(enriched) && enriched.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {enriched.map((a, i) => (
          <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 2 }}>{a.question || a.fieldId}</div>
            {a.description && <div style={{ fontSize: '0.75rem', color: 'var(--muted-2)', marginBottom: 4 }}>{a.description}</div>}
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{Array.isArray(a.value) ? a.value.join(', ') : String(a.value ?? '—')}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>{a.datatype || ''} {a.required ? '· required' : ''}</div>
          </div>
        ))}
      </div>
    )
  }
  const form = response.form
  const fieldMap = new Map((form?.formfield || []).map(f => [String(f._id), f]))
  // fallback if form not populated with fields: show raw answers but try to show question if present on answer
  if (!form || !form.formfield) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {response.answers.map((a, i) => (
          <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>{a.question || a.fieldId}</div>
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
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 2 }}>{a.question || meta?.title || a.fieldId}</div>
            {(a.description || meta?.description) && <div style={{ fontSize: '0.75rem', color: 'var(--muted-2)', marginBottom: 4 }}>{a.description || meta.description}</div>}
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{Array.isArray(a.value) ? a.value.join(', ') : String(a.value ?? '—')}</div>
            {(a.datatype || meta) && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>{a.datatype || meta.datatype}</div>}
          </div>
        )
      })}
    </div>
  )
}

export default function MySubmissions() {
  const [responses, setResponses] = useState([])
  const [ownerResponses, setOwnerResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [ownerLoading, setOwnerLoading] = useState(false)
  const [error, setError] = useState('')
  const [ownerError, setOwnerError] = useState('')
  const [tab, setTab] = useState('owner') // owner shows 2 docs (anon+auth), respondent shows 1
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // separate getMyFormData function (as requested) — RESPONDENT view (1 doc)
  const getMyFormData = async () => {
    setLoading(true)
    setError('')
    try {
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

  // OWNER view — all responses for forms owned by me via shipped link ?owner= (2 docs)
  const getOwnerData = async () => {
    setOwnerLoading(true)
    setOwnerError('')
    try {
      const res = await api.getOwnerResponses()
      const list = Array.isArray(res.data) ? res.data : []
      setOwnerResponses(list)
    } catch (err) {
      if (err.status === 401) navigate('/login')
      else setOwnerError(err.message || 'Failed to load owner data')
    } finally {
      setOwnerLoading(false)
    }
  }

  useEffect(() => {
    getMyFormData()
    getOwnerData()
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
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Respondent vs Owner — shipped link now embeds <code style={{ background:'var(--surface-2)', padding:'2px 6px', borderRadius:4 }}> ?owner=ownerId</code> so anonymous fills still link to owner. “My Submissions” = where you are respondent (1 doc). “Owner Data” = where you are owner (2 docs: anon + auth).</p>
        </motion.div>

        {/* Tabs: Owner (2 docs) vs Respondent (1 doc) */}
        <div style={{ display:'flex', gap:8, marginBottom:16, borderBottom:'1px solid var(--border)', paddingBottom:12 }}>
          <button onClick={()=>setTab('owner')} style={{ padding:'8px 16px', borderRadius:8, fontWeight:700, background: tab==='owner'?'var(--orange)':'var(--surface-2)', color: tab==='owner'?'var(--black)':'var(--muted)', border:'1px solid var(--border)' }}>Owner Data ({ownerResponses.length}) — 2 expected</button>
          <button onClick={()=>setTab('respondent')} style={{ padding:'8px 16px', borderRadius:8, fontWeight:700, background: tab==='respondent'?'var(--orange)':'var(--surface-2)', color: tab==='respondent'?'var(--black)':'var(--muted)', border:'1px solid var(--border)' }}>My Submissions ({responses.length}) — 1 expected</button>
          <button onClick={()=>{getMyFormData(); getOwnerData();}} style={{ marginLeft:'auto', padding:'8px 14px', border:'1px solid var(--border)', borderRadius:8 }}>↻ Refresh</button>
        </div>

        {tab==='respondent' && error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {tab==='owner' && ownerError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            {ownerError}
          </div>
        )}

        {tab==='respondent' ? (
          loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🦀</div>
            <p>Loading your submissions via getMyFormData...</p>
          </div>
        ) : responses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No submissions yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 16 }}>When you submit a form as a logged-in user, your ResponseModel is auto-filled with your name & email and appears here. Anonymous ?owner= fills appear in Owner Data.</p>
            <Link to="/dashboard" style={{ background: 'var(--orange)', color: 'var(--black)', padding: '10px 18px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Go to Dashboard</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{responses.length} submission{responses.length !== 1 ? 's' : ''} found (respondent)</p>
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
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{r.respondentId ? String(r.respondentId).slice(-6) : 'anon'} · owner:{r.ownerId ? String(r.ownerId).slice(-6) : '—'}</div>
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
        )
        ) : (
          ownerLoading ? (
            <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>🦀 Loading owner data (should show 2 docs: anon + anandrajjee981@gmail.com)...</div>
          ) : ownerResponses.length===0 ? (
            <div style={{ textAlign:'center', padding:48, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
              <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📭</div>
              <h3 style={{ fontFamily:'var(--font-display)', marginBottom:8 }}>No owner data yet</h3>
              <p style={{ color:'var(--muted)', marginBottom:8 }}>Share your shipped link <code style={{ background:'var(--surface-2)', padding:'2px 6px', borderRadius:4 }}>/f/:slug?owner=YOUR_ID</code> — anonymous + authenticated fills both store ownerId and appear here.</p>
              <p style={{ color:'var(--muted)', fontSize:'0.85rem' }}>Past docs without ownerId are also returned via fallback lookup of Form.owner_id.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <p style={{ color:'var(--muted)', fontSize:'0.9rem' }}>{ownerResponses.length} submission{ownerResponses.length!==1?'s':''} found (owner) — includes anonymous null respondent + authenticated</p>
              {ownerResponses.map((r)=>(
                <motion.div key={r._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
                  <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{r.form?.title || 'Form '+String(r.form_id).slice(-6)}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{r.form?.slug && <span>/{r.form.slug} · </span>}{formatDate(r.submittedAt||r.createdAt)}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>Respondent → Owner</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{r.respondentName || 'Anonymous (null)'} {r.respondentEmail?`· ${r.respondentEmail}`:''} → {r.ownerId?String(r.ownerId).slice(-6):'via form lookup'}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--muted)' }}>respondentId:{r.respondentId?String(r.respondentId).slice(-6):'null'} | ownerId:{r.ownerId?String(r.ownerId).slice(-6):'null'}</div>
                    </div>
                  </div>
                  <div style={{ padding:16 }}><AnswerList response={r} /></div>
                </motion.div>
              ))}
            </div>
          )
        )}

        <div style={{ marginTop: 32, padding: 16, background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Developer note — shipped link + ownerId ref</h4>
          <pre style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
{`// Shipped link now: /f/:slug?owner=OWNER_ID  (Builder generates it)
// Frontend: PublicForm reads ?owner= and POSTs it
// POST /api/forms/:id/responses  (no auth) — body: { answers, ownerId }
// Backend: SubmitResponseActivity stores ownerId = body.ownerId || form.owner_id
// Schema: response { form_id ref Form, ownerId ref User, respondentId ref User, answers:[{fieldId, value, question}] }

// Respondent view (1 doc): GET /api/responses/my  -> where respondentId==me
// Owner view (2 docs: anon+auth): GET /api/responses/owner -> where form_id in (forms where owner_id==me) OR ownerId==me
// Builder → Responses tab: GET /api/forms/:id/responses (owner check) also shows 2 docs with actual que via snapshot`}
          </pre>
        </div>
      </main>
    </div>
  )
}

// aliases for requested naming variations
export const getMyFormData = () => {}
export const getmyformdata = () => {}
