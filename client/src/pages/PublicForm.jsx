import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../utils/api.js'
import '../styles/builder.css'

function FieldInput({ field, value, onChange }) {
  const handleChange = (val) => onChange(field._id, val)
  if (field.datatype === 'text') return <input className="cf-text-input" placeholder={field.placeholder} value={value || ''} onChange={e => handleChange(e.target.value)} required={field.required} />
  if (field.datatype === 'textarea') return <textarea className="cf-text-input" style={{ minHeight: 80, resize: 'vertical' }} placeholder={field.placeholder} value={value || ''} onChange={e => handleChange(e.target.value)} required={field.required} />
  if (field.datatype === 'email') return <input className="cf-text-input" type="email" placeholder="you@example.com" value={value || ''} onChange={e => handleChange(e.target.value)} required={field.required} />
  if (field.datatype === 'number') return <input className="cf-text-input" type="number" placeholder={field.placeholder || '0'} value={value || ''} onChange={e => handleChange(e.target.value)} required={field.required} />
  if (field.datatype === 'phone') return <input className="cf-text-input" type="tel" placeholder={field.placeholder || '+91 ...'} value={value || ''} onChange={e => handleChange(e.target.value)} required={field.required} />
  if (field.datatype === 'date') return <input className="cf-text-input" type="date" value={value || ''} onChange={e => handleChange(e.target.value)} required={field.required} />
  if (field.datatype === 'rating') return (
    <div className="cf-stars" role="group" aria-label={field.title}>
      {[1,2,3,4,5].map(n => (
        <motion.span
          key={n}
          className={`cf-star ${n <= (value||0) ? 'filled' : ''}`}
          onClick={() => handleChange(n)}
          whileHover={{ scale: 1.3, rotate: 12 }}
          whileTap={{ scale: 0.85 }}
          role="button"
          tabIndex={0}
          aria-label={`${n} stars`}
          style={{ cursor: 'pointer', display: 'inline-block', padding: '4px' }}
        >
          {n <= (value||0) ? '⭐' : '☆'}
        </motion.span>
      ))}
    </div>
  )
  if (field.datatype === 'slider') return (
    <div>
      <input className="cf-slider" type="range" min={field.validation?.min ?? 0} max={field.validation?.max ?? 100} value={value ?? 50} onChange={e => handleChange(Number(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}><span>{field.validation?.min ?? 0}</span><span style={{ color: 'var(--orange)', fontWeight: 700 }}>{value ?? 50}</span><span>{field.validation?.max ?? 100}</span></div>
    </div>
  )
  if (field.datatype === 'select') return (
    <select className="cf-text-input" value={value || ''} onChange={e => handleChange(e.target.value)} required={field.required}>
      <option value="">Choose an option...</option>
      {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
  if (field.datatype === 'radio') return (
    <div className="cf-radio-group">
      {(field.options || []).map(o => (
        <label key={o} className="cf-option"><input type="radio" name={field._id} value={o} checked={value===o} onChange={() => handleChange(o)} /> {o}</label>
      ))}
    </div>
  )
  if (field.datatype === 'checkbox') {
    const arr = Array.isArray(value) ? value : []
    const toggle = (opt) => {
      const next = arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt]
      handleChange(next)
    }
    return (
      <div className="cf-checkbox-group">
        {(field.options || []).map(o => (
          <label key={o} className="cf-option"><input type="checkbox" checked={arr.includes(o)} onChange={() => toggle(o)} /> {o}</label>
        ))}
      </div>
    )
  }
  return <input className="cf-text-input" value={value || ''} onChange={e => handleChange(e.target.value)} />
}

export default function PublicForm() {
  const { slug } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [values, setValues] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.getPublicForm(slug)
        if (!cancelled) setForm(res.data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Form not found or not published')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  const handleChange = (fieldId, val) => {
    setValues(prev => ({ ...prev, [fieldId]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const answers = (form.formfield || []).map(f => ({
        fieldId: f._id,
        value: values[f._id] ?? (f.datatype === 'checkbox' ? [] : ''),
      }))
      // Filter out empty non-required? But validation backend checks required, so send all
      await api.submitResponse(form._id, { answers })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: 12 }}>🦀</div><p>Loading form...</p></div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🦀</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 8 }}>{error}</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>This form may not be published or the link is incorrect.</p>
          <Link to="/" style={{ background: 'var(--orange)', color: 'var(--black)', padding: '10px 20px', borderRadius: 8, fontWeight: 700 }}>Go Home</Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 48, maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 8 }}>Response submitted!</h2>
          <p style={{ color: 'var(--muted-2)', marginBottom: 24 }}>Thanks for filling <b>{form.title}</b>. Crab appreciates you 🦀</p>
          <Link to="/" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 8, display: 'inline-block' }}>Back to Home</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-black)', padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>🦀 Crab Form</Link>
        </div>
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>{form.title}</h1>
            {form.description && <p style={{ color: 'var(--muted-2)', fontSize: '0.95rem' }}>{form.description}</p>}
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {(form.formfield || []).sort((a,b)=>a.order-b.order).map(field => (
              <div key={field._id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 10, display: 'flex', gap: 6 }}>
                  {field.title} {field.required && <span style={{ color: 'var(--orange)' }}>*</span>}
                </div>
                {field.description && <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 10 }}>{field.description}</p>}
                <FieldInput field={field} value={values[field._id]} onChange={handleChange} />
              </div>
            ))}
            {submitError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8 }}>{submitError}</div>}
            <button type="submit" disabled={submitting} style={{ background: 'var(--orange)', color: 'var(--black)', padding: '14px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontFamily: 'var(--font-display)', width: '100%', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting...' : 'Submit →'}
            </button>
          </div>
        </form>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', marginTop: 16 }}>Powered by 🦀 Crab Form</p>
      </motion.div>
    </div>
  )
}
