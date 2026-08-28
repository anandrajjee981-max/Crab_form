import { useEffect, useState } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { api } from '../utils/api.js'
import '../styles/builder.css'

/* ─── Field Types ─── */
const FIELD_TYPES = [
  { type: 'text',     icon: 'Aa',  label: 'Text' },
  { type: 'textarea', icon: '¶',   label: 'Long text' },
  { type: 'email',    icon: '@',   label: 'Email' },
  { type: 'number',   icon: '123', label: 'Number' },
  { type: 'rating',   icon: '⭐',  label: 'Rating' },
  { type: 'select',   icon: '▼',   label: 'Dropdown' },
  { type: 'radio',    icon: '◉',   label: 'Choice' },
  { type: 'checkbox', icon: '☑',   label: 'Multi' },
  { type: 'slider',   icon: '⟷',   label: 'Slider' },
  { type: 'date',     icon: '📅',  label: 'Date' },
]

const THEMES = {
  'Crab Classic': { accent: '#ff5f1f', bg: '#0a0908', card: '#161614' },
  'Midnight':     { accent: '#6c63ff', bg: '#0d0d1a', card: '#12121f' },
  'Cyber Crab':   { accent: '#00ff88', bg: '#050f0a', card: '#0a1a10' },
  'Sunset':       { accent: '#f5576c', bg: '#0f0a0b', card: '#1a0f11' },
  'Soft':         { accent: '#fcb69f', bg: '#0f0e0e', card: '#1a1615' },
  'Minimal':      { accent: '#d0d0d0', bg: '#111',    card: '#1a1a1a' },
  'College':      { accent: '#ffd700', bg: '#0d0b00', card: '#1a1600' },
  'Chaos':        { accent: '#ff00ff', bg: '#050505', card: '#100510' },
}

/* ─── Default form state ─── */
const DEFAULT_FIELDS = [
  { id: 'f1', type: 'text',     label: "What's your name?",  required: true,  placeholder: 'Drop your name here' },
  { id: 'f2', type: 'rating',   label: 'Rate the experience', required: false },
  { id: 'f3', type: 'textarea', label: 'What went well?',     required: false, placeholder: 'Tell us everything...' },
  { id: 'f4', type: 'text',     label: 'Any suggestions?',    required: false, placeholder: 'Make it spicy 🌶' },
]

/* ─── Field renderer on canvas ─── */
function CanvasField({ field, selected, onSelect, onDelete, onUpdate }) {
  const [stars, setStars] = useState(0)
  const [sliderVal, setSliderVal] = useState(50)

  return (
    <motion.div
      layout
      className={`canvas-field ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(field.id)}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      role="button"
      tabIndex={0}
      aria-label={`Field: ${field.label}`}
      onKeyDown={e => e.key === 'Enter' && onSelect(field.id)}
    >
      <div className="canvas-field__label">
        {field.label}
        {field.required && <span className="canvas-field__required" aria-label="Required">*</span>}
      </div>

      {field.type === 'text' && (
        <input className="cf-text-input" placeholder={field.placeholder || 'Your answer...'} aria-label={field.label} />
      )}
      {field.type === 'textarea' && (
        <textarea className="cf-text-input" style={{ resize: 'vertical', minHeight: 80 }} placeholder={field.placeholder || 'Your answer...'} aria-label={field.label} />
      )}
      {field.type === 'email' && (
        <input className="cf-text-input" type="email" placeholder="your@email.com" aria-label={field.label} />
      )}
      {field.type === 'number' && (
        <input className="cf-text-input" type="number" placeholder="0" aria-label={field.label} />
      )}
      {field.type === 'rating' && (
        <div className="cf-stars" role="group" aria-label="Star rating">
          {[1,2,3,4,5].map(n => (
            <motion.span
              key={n}
              className={`cf-star ${n <= stars ? 'filled' : ''}`}
              onClick={e => { e.stopPropagation(); setStars(n) }}
              whileHover={{ scale: 1.25, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              role="button"
              aria-label={`${n} star`}
              tabIndex={0}
            >
              {n <= stars ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>
      )}
      {field.type === 'slider' && (
        <div style={{ padding: '8px 0' }}>
          <input
            className="cf-slider"
            type="range"
            min={0} max={100}
            value={sliderVal}
            onChange={e => setSliderVal(e.target.value)}
            aria-label={field.label}
            aria-valuenow={sliderVal}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
            <span>0</span><span style={{ color: 'var(--orange)', fontWeight: 700 }}>{sliderVal}</span><span>100</span>
          </div>
        </div>
      )}
      {field.type === 'radio' && (
        <div className="cf-radio-group" role="radiogroup" aria-label={field.label}>
          {(field.options?.length ? field.options : ['Option A', 'Option B', 'Option C']).map(o => (
            <label key={o} className="cf-option">
              <input type="radio" name={field.id} value={o} /> {o}
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && (
        <div className="cf-checkbox-group" role="group" aria-label={field.label}>
          {(field.options?.length ? field.options : ['Option A', 'Option B', 'Option C']).map(o => (
            <label key={o} className="cf-option">
              <input type="checkbox" value={o} /> {o}
            </label>
          ))}
        </div>
      )}
      {field.type === 'select' && (
        <select className="cf-text-input" aria-label={field.label} style={{ cursor: 'pointer' }}>
          <option value="">Choose an option...</option>
          {(field.options?.length ? field.options : ['Option A', 'Option B', 'Option C']).map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )}
      {field.type === 'date' && (
        <input className="cf-text-input" type="date" aria-label={field.label} />
      )}

      <button
        className="canvas-field__delete"
        onClick={e => { e.stopPropagation(); onDelete(field.id) }}
        aria-label={`Delete field: ${field.label}`}
        title="Delete field"
      >
        ✕
      </button>
    </motion.div>
  )
}

const THEME_MAP = { genz: 'Crab Classic', minimal: 'Minimal', dark: 'Midnight', college: 'College' }

function mapAIToBuilderFields(aiFields) {
  return aiFields.map((f, idx) => ({
    id: `f${Date.now()}_${idx}`,
    type: f.datatype,
    label: f.title,
    required: !!f.required,
    placeholder: f.placeholder || '',
    options: f.options || [],
    description: f.description || '',
  }))
}

/* ─── Left Panel ─── */
function LeftPanel({ fields, selectedId, onSelectField, onAddField, onDeleteField }) {
  return (
    <aside className="builder__left" aria-label="Field types and form structure">
      <p className="builder__left-title">Add Field</p>
      <div className="field-types-grid">
        {FIELD_TYPES.map(ft => (
          <motion.button
            key={ft.type}
            className="field-type-btn"
            onClick={() => onAddField(ft.type)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            aria-label={`Add ${ft.label} field`}
          >
            <span className="field-type-btn__icon">{ft.icon}</span>
            {ft.label}
          </motion.button>
        ))}
      </div>

      <p className="builder__left-title" style={{ marginTop: 8 }}>Structure</p>
      <div className="builder__fields-list">
        {fields.map((f, i) => (
          <div
            key={f.id}
            className={`builder__field-item ${selectedId === f.id ? 'selected' : ''}`}
            onClick={() => onSelectField(f.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelectField(f.id)}
            aria-label={`Select field: ${f.label}`}
          >
            <span className="builder__field-item__icon">
              {FIELD_TYPES.find(t => t.type === f.type)?.icon || 'Aa'}
            </span>
            <span className="builder__field-item__name">{f.label}</span>
            <span className="builder__field-item__drag" aria-hidden="true">⠿</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

/* ─── Right Panel ─── */
function RightPanel({ field, onUpdate, theme, onThemeChange }) {
  const [toggle, setToggle] = useState({ required: field?.required ?? false })

  const toggleRequired = () => {
    const next = !toggle.required
    setToggle({ required: next })
    if (field) onUpdate(field.id, { required: next })
  }

  return (
    <aside className="builder__right" aria-label="Field properties">
      {field ? (
        <>
          <p className="builder__right-title">Properties</p>

          <div className="prop-group">
            <p className="prop-group__label">Question</p>
            <input
              className="prop-input"
              value={field.label}
              onChange={e => onUpdate(field.id, { label: e.target.value })}
              aria-label="Question label"
            />
          </div>

          {(field.type === 'text' || field.type === 'textarea') && (
            <div className="prop-group">
              <p className="prop-group__label">Placeholder</p>
              <input
                className="prop-input"
                value={field.placeholder || ''}
                onChange={e => onUpdate(field.id, { placeholder: e.target.value })}
                aria-label="Placeholder text"
              />
            </div>
          )}

          <div className="prop-toggle">
            <span className="prop-toggle__label">Required</span>
            <button
              className={`toggle-switch ${toggle.required ? 'on' : ''}`}
              onClick={toggleRequired}
              role="switch"
              aria-checked={toggle.required}
              aria-label="Toggle required"
            >
              <span className="toggle-switch__thumb" />
            </button>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Select a field to edit properties.</p>
      )}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 24 }}>
        <p className="builder__right-title">Theme</p>
        <div className="theme-grid">
          {Object.keys(THEMES).map(t => (
            <motion.button
              key={t}
              className={`theme-option ${theme === t ? 'active' : ''}`}
              style={{
                background: THEMES[t].card,
                color: THEMES[t].accent,
                borderColor: theme === t ? THEMES[t].accent : 'var(--border)',
              }}
              onClick={() => onThemeChange(t)}
              whileHover={{ scale: 1.04 }}
              aria-label={`Theme: ${t}`}
              aria-pressed={theme === t}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </div>
    </aside>
  )
}

/* ─── Publish Modal ─── */
function PublishModal({ onClose, link }) {
  const [copied, setCopied] = useState(false)
  const displayLink = link || `${window.location.origin}/f/demo`

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(displayLink)
      } else {
        // Fallback for http / older browsers
        const ta = document.createElement('textarea')
        ta.value = displayLink
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback still shows copied to avoid confusion
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleOpen = () => {
    window.open(displayLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.85)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Publish form dialog"
    >
      <motion.div
        style={{ background: 'var(--surface)', border: '1px solid rgba(255,95,31,0.3)', borderRadius: 'var(--radius-xl)', padding: 'clamp(20px, 5vw, 40px)', maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'center', position: 'relative' }}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, color: 'var(--muted)', fontSize: '1.2rem', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
          aria-label="Close"
        >✕</button>

        <motion.div
          style={{ fontSize: '2.5rem', marginBottom: 12 }}
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1.1, 1.1, 1.1, 1] }}
          transition={{ duration: 0.8 }}
          aria-hidden="true"
        >🦀</motion.div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800, marginBottom: 8 }}>
          Your form is live.
        </h2>
        <p style={{ color: 'var(--muted-2)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.5 }}>
          Share this link anywhere. Crab's got it. 🚀
        </p>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <a href={displayLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--orange)', wordBreak: 'break-all', textAlign: 'left', textDecoration: 'underline', lineHeight: 1.4 }}>
            {displayLink}
          </a>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button
              style={{ flex: 1, background: copied ? 'var(--neon-green)' : 'var(--orange)', color: 'var(--black)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}
              onClick={handleCopy}
              whileTap={{ scale: 0.96 }}
              aria-label="Copy link"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={copied ? 'copied' : 'copy'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {copied ? 'Copied 🦀' : 'Copy link'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <motion.button
              style={{ flex: 1, background: 'var(--surface-3)', color: 'var(--warm-white)', border: '1px solid var(--border-light)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}
              onClick={handleOpen}
              whileTap={{ scale: 0.96 }}
              aria-label="Open link"
            >
              Open ↗
            </motion.button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => { handleCopy(); }} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '0.8rem', color: 'var(--muted-2)' }}>Share via...</button>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '0.8rem', color: 'var(--muted-2)' }}>Done</button>
        </div>

        {/* QR area - now generates real QR via API */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'inline-block', marginBottom: 8 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>QR Code</div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(displayLink)}`}
            alt={`QR for ${displayLink}`}
            width={140}
            height={140}
            style={{ borderRadius: 8, background: 'white', padding: 6, display: 'block' }}
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
          />
          <div style={{ width: 140, height: 140, background: 'var(--surface-3)', borderRadius: 8, display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🦀</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8 }}>Scan to open</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Builder Page ─── */
export default function Builder() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const generatedForm = location.state?.generatedForm
  const justCreated = location.state?.justCreated

  const [fields, setFields] = useState(() => {
    if (generatedForm?.formfield?.length) return mapAIToBuilderFields(generatedForm.formfield)
    return DEFAULT_FIELDS
  })
  const [selectedId, setSelectedId] = useState(null)
  const [formTitle, setFormTitle] = useState(() => generatedForm?.title || 'Internship Check-in 🦀')
  const [formDesc, setFormDesc] = useState(() => generatedForm?.description || 'Tell us how it actually went.')
  const [theme, setTheme] = useState(() => THEME_MAP[generatedForm?.theme?.name] || 'Crab Classic')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [activeTab, setActiveTab] = useState('Build')
  const [publishError, setPublishError] = useState('')
  const [publishLink, setPublishLink] = useState('')
  const [loadingForm, setLoadingForm] = useState(false)
  const [existingForm, setExistingForm] = useState(null)
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  // Load existing form when editing (id !== "new") and no generatedForm provided
  useEffect(() => {
    if (!id || id === 'new') return
    if (generatedForm && justCreated) return // already have data from CreateForm auto-save
    if (generatedForm?.formfield?.length) return // preview mode, don't overwrite
    let cancelled = false
    const load = async () => {
      setLoadingForm(true)
      try {
        const res = await api.getForm(id)
        const data = res.data
        if (cancelled) return
        setExistingForm(data)
        setFormTitle(data.title || 'Untitled Form')
        setFormDesc(data.description || '')
        if (data.theme?.name && THEME_MAP[data.theme.name]) {
          setTheme(THEME_MAP[data.theme.name])
        } else if (data.theme?.name) {
          setTheme(data.theme.name)
        }
        if (Array.isArray(data.formfield) && data.formfield.length) {
          const mapped = data.formfield.map((f, idx) => ({
            id: `f${data._id || id}_${idx}_${Date.now()}`,
            type: f.datatype,
            label: f.title,
            required: !!f.required,
            placeholder: f.placeholder || '',
            options: f.options || [],
            description: f.description || '',
          }))
          setFields(mapped)
        }
        if (data.status === 'published') setPublished(true)
      } catch (err) {
        if (!cancelled) {
          setPublishError(err.message || 'Failed to load form')
          if (err.status === 401) navigate('/login')
          if (err.status === 404) {
            // Form not found (maybe 'new' id that was auto-saved with different id)
            // fall back to generatedForm or defaults
          }
        }
      } finally {
        if (!cancelled) setLoadingForm(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // When generatedForm arrives (from AI), populate builder state
  useEffect(() => {
    if (generatedForm?.formfield?.length) {
      setFields(mapAIToBuilderFields(generatedForm.formfield))
      setFormTitle(generatedForm.title || 'Untitled Form')
      setFormDesc(generatedForm.description || '')
      if (generatedForm.theme?.name && THEME_MAP[generatedForm.theme.name]) {
        setTheme(THEME_MAP[generatedForm.theme.name])
      }
      // If id is "new" and we didn't auto-save in CreateForm (e.g. unauthenticated generation),
      // try to auto-save now so getMyAllForm will list it
      if (id === 'new' && !justCreated) {
        const token = localStorage.getItem('crab_token')
        if (token) {
          (async () => {
            try {
              const saveRes = await api.createForm(generatedForm)
              const saved = saveRes.data
              const savedId = saved?._id || saved?.id
              if (savedId) {
                // Replace URL without adding history entry, keep state
                navigate(`/builder/${savedId}`, { replace: true, state: { generatedForm, justCreated: true } })
              }
            } catch (e) {
              console.warn('Builder auto-save failed:', e.message)
            }
          })()
        }
      }
    }
  }, [generatedForm, id, justCreated])

  const selectedField = fields.find(f => f.id === selectedId) || null

  const addField = (type) => {
    const newField = {
      id: `f${Date.now()}`,
      type,
      label: FIELD_TYPES.find(t => t.type === type)?.label + ' question',
      required: false,
      placeholder: 'Your answer...',
    }
    setFields(prev => [...prev, newField])
    setSelectedId(newField.id)
  }

  const deleteField = (id) => {
    setFields(prev => prev.filter(f => f.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const updateField = (id, patch) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f))
  }

  const handlePublish = async () => {
    setPublishing(true)
    setPublishError('')
    try {
      // Map builder fields back to backend schema
      const formfield = fields.map((f, idx) => ({
        title: f.label,
        datatype: f.type,
        placeholder: f.placeholder || '',
        description: f.description || '',
        required: !!f.required,
        order: idx + 1,
        options: f.options || [],
        validation: {},
      }))
      const payload = {
        title: formTitle,
        description: formDesc,
        theme: { name: Object.keys(THEME_MAP).find(k => THEME_MAP[k] === theme) || 'genz' },
        formfield,
      }
      let saved
      // If editing existing form (id !== "new"), update then publish
      if (id && id !== 'new') {
        try {
          // Update first to save latest edits
          const updateRes = await api.updateForm(id, payload)
          saved = updateRes.data
        } catch (updateErr) {
          // If update fails with 404 (form was preview-only), fallback to create
          if (updateErr.status === 404) {
            const createRes = await api.createForm(payload)
            saved = createRes.data
            const newId = saved?._id || saved?.id
            if (newId) navigate(`/builder/${newId}`, { replace: true })
          } else {
            throw updateErr
          }
        }
        // Then publish
        try {
          const pubRes = await api.publishForm(saved?._id || saved?.id || id)
          saved = pubRes.data || saved
        } catch (pubErr) {
          console.warn('Publish step failed, but form is saved:', pubErr.message)
        }
      } else {
        // New form (should have been auto-saved, but fallback)
        const res = await api.createForm(payload)
        saved = res.data
        // Also publish immediately
        const newId = saved?._id || saved?.id
        if (newId) {
          try {
            const pubRes = await api.publishForm(newId)
            saved = pubRes.data || saved
            navigate(`/builder/${newId}`, { replace: true })
          } catch {}
        }
      }
      const slug = saved?.slug || existingForm?.slug
      setPublishLink(slug ? `${window.location.origin}/f/${slug}` : saved?.shareUrl || 'https://crabform.io/f/published')
      setPublished(true)
      setShowPublishModal(true)
    } catch (err) {
      setPublishError(err.message || 'Failed to publish. Please login first.')
      if (err.status === 401) {
        navigate('/login')
      }
    } finally {
      setPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    setPublishing(true)
    setPublishError('')
    try {
      const formfield = fields.map((f, idx) => ({
        title: f.label,
        datatype: f.type,
        placeholder: f.placeholder || '',
        description: f.description || '',
        required: !!f.required,
        order: idx + 1,
        options: f.options || [],
        validation: {},
      }))
      const payload = {
        title: formTitle,
        description: formDesc,
        theme: { name: Object.keys(THEME_MAP).find(k => THEME_MAP[k] === theme) || 'genz' },
        formfield,
      }
      let saved
      if (id && id !== 'new') {
        const res = await api.updateForm(id, payload)
        saved = res.data
      } else {
        const res = await api.createForm(payload)
        saved = res.data
        const newId = saved?._id || saved?.id
        if (newId) navigate(`/builder/${newId}`, { replace: true })
      }
      setPublishError('')
      // brief success feedback
      setPublished(false)
      // could show toast; for now navigate to dashboard so getMyAllForm refreshes
      navigate('/dashboard')
    } catch (err) {
      setPublishError(err.message || 'Failed to save draft')
      if (err.status === 401) navigate('/login')
    } finally {
      setPublishing(false)
    }
  }

  const currentTheme = THEMES[theme]

  return (
    <div className="builder" style={{ '--theme-accent': currentTheme.accent }}>
      {/* Nav */}
      <nav className="builder__nav" aria-label="Builder navigation">
        <div className="builder__nav-inner">
          <div className="builder__nav-top-row">
            <div className="builder__nav-left">
              <button className="builder__mobile-toggle" onClick={() => setLeftOpen(!leftOpen)} aria-label="Toggle fields panel" aria-expanded={leftOpen}>☰</button>
              <Link to="/dashboard" className="builder__back" aria-label="Back to dashboard">←</Link>
              <input
                className="builder__form-name-input"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                aria-label="Form name"
              />
            </div>

            <div className="builder__nav-actions">
              <button className="builder__action-btn" aria-label="Save draft" id="builder-save-btn" onClick={handleSaveDraft} disabled={publishing}>Save</button>
              <motion.button
                className="builder__publish-btn"
                onClick={handlePublish}
                disabled={publishing || loadingForm}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                id="builder-publish-btn"
                aria-label="Publish form"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={publishing ? 'loading' : published ? 'done' : 'idle'}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    {publishing ? 'Shipping...' : published ? 'Shipped 🚀' : 'Ship it 🚀'}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <button className="builder__mobile-toggle" onClick={() => setRightOpen(!rightOpen)} aria-label="Toggle properties panel" aria-expanded={rightOpen}>⚙️</button>
            </div>
          </div>

          <div className="builder__nav-center" role="tablist" aria-label="Builder tabs">
            {['Build', 'Preview', 'Settings'].map(tab => (
              <button
                key={tab}
                className={`builder__tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                id={`builder-tab-${tab.toLowerCase()}`}
                style={{ position: 'relative' }}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="builderTabPill"
                    className="builder__tab-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 2 }}>{tab}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="builder__layout">
        {/* Mobile overlay */}
        {(leftOpen || rightOpen) && <div className="builder__overlay" onClick={() => { setLeftOpen(false); setRightOpen(false) }} aria-hidden="true" />}
        <div className={`builder__left-wrap ${leftOpen ? 'open' : ''}`}>
          <LeftPanel
            fields={fields}
            selectedId={selectedId}
            onSelectField={(fid) => { setSelectedId(fid); setLeftOpen(false) }}
            onAddField={(t) => { addField(t); setLeftOpen(false) }}
            onDeleteField={deleteField}
          />
        </div>

        {/* Center Canvas */}
        <main className="builder__center" role="main" aria-label="Form canvas">
          <div
            className="form-canvas"
            style={{
              background: currentTheme.card,
              borderColor: `${currentTheme.accent}30`,
            }}
          >
            {activeTab === 'Build' && (
              <>
                <div className="form-canvas__header">
                  <input
                    className="form-canvas__form-title-input"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    style={{ '--accent': currentTheme.accent, borderBottomColor: `${currentTheme.accent}50` }}
                    aria-label="Form title"
                  />
                  <textarea
                    className="form-canvas__desc-input"
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    rows={2}
                    aria-label="Form description"
                    placeholder="Add form description..."
                  />
                </div>
                <div className="form-canvas__fields">
                  <AnimatePresence>
                    {fields.map(field => (
                      <CanvasField
                        key={field.id}
                        field={field}
                        selected={selectedId === field.id}
                        onSelect={setSelectedId}
                        onDelete={deleteField}
                        onUpdate={updateField}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Add field prompt */}
                  <motion.button
                    style={{
                      border: `2px dashed ${currentTheme.accent}40`,
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      width: '100%',
                      color: 'var(--muted)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'border-color 0.2s, color 0.2s',
                      background: 'transparent',
                    }}
                    whileHover={{ borderColor: `${currentTheme.accent}80`, color: 'var(--muted-2)' }}
                    onClick={() => addField('text')}
                    aria-label="Add a new field"
                  >
                    + Add a question
                  </motion.button>
                </div>
              </>
            )}

            {activeTab === 'Preview' && (
              <div style={{ padding: '28px 20px' }}>
                <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,95,31,0.15)', color: 'var(--orange)', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
                    RESPONDENT PREVIEW
                  </span>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginTop: 12, marginBottom: 6 }}>
                    {formTitle}
                  </h1>
                  {formDesc && <p style={{ color: 'var(--muted-2)', fontSize: '0.9rem' }}>{formDesc}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {fields.map(f => (
                    <div key={f.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8, fontSize: '0.9rem' }}>
                        {f.label} {f.required && <span style={{ color: 'var(--orange)' }}>*</span>}
                      </div>
                      <input className="cf-text-input" placeholder={f.placeholder || 'Answer...'} readOnly style={{ cursor: 'default' }} />
                    </div>
                  ))}
                  <button style={{ background: currentTheme.accent, color: 'var(--black)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: 8 }}>
                    Submit Response →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Settings' && (
              <div style={{ padding: '28px 20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 16, color: 'var(--warm-white)' }}>
                  Form Settings & Theme ⚙️
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="prop-group">
                    <p className="prop-group__label">Form Title</p>
                    <input className="prop-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                  </div>
                  <div className="prop-group">
                    <p className="prop-group__label">Description</p>
                    <textarea className="prop-input" style={{ minHeight: 70, resize: 'vertical' }} value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                  </div>

                  <div>
                    <p className="prop-group__label" style={{ marginBottom: 12 }}>Choose Theme</p>
                    <div className="theme-grid">
                      {Object.keys(THEMES).map(t => (
                        <motion.button
                          key={t}
                          className={`theme-option ${theme === t ? 'active' : ''}`}
                          style={{
                            background: THEMES[t].card,
                            color: THEMES[t].accent,
                            borderColor: theme === t ? THEMES[t].accent : 'var(--border)',
                            padding: '14px 10px',
                          }}
                          onClick={() => setTheme(t)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {t}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <div className={`builder__right-wrap ${rightOpen ? 'open' : ''}`}>
          <RightPanel
            field={selectedField}
            onUpdate={updateField}
            theme={theme}
            onThemeChange={setTheme}
          />
        </div>
      </div>

      {publishError && (
        <div className="auth-error" role="alert" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, maxWidth: 400 }}>
          {publishError}
        </div>
      )}

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <PublishModal onClose={() => setShowPublishModal(false)} link={publishLink} />
        )}
      </AnimatePresence>
    </div>
  )
}
