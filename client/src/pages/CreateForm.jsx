import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../utils/api.js'
import '../styles/create-form.css'

const LOADING_MESSAGES = [
  { msg: 'Crab is thinking... 🦀', sub: 'Reading your request' },
  { msg: 'Finding the vibe...', sub: 'Understanding the context' },
  { msg: 'Picking the questions...', sub: 'Crafting the right fields' },
  { msg: 'Making it look good...', sub: 'Choosing theme and layout' },
  { msg: 'Almost caught... 🦀', sub: 'Putting it all together' },
]

const SUGGESTIONS = [
  'Internship feedback',
  'College event RSVP',
  'Job application',
  'Customer feedback',
  'Party RSVP',
  'Team check-in',
]

export default function CreateForm() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadStep, setLoadStep] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleGenerate = async () => {
    const trimmed = prompt.trim()
    if (!trimmed) {
      setError('Please describe your form first')
      return
    }
    setLoading(true)
    setLoadStep(0)
    setError('')

    // Animate loading messages while waiting for API
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step < LOADING_MESSAGES.length) {
        setLoadStep(step)
      }
    }, 900)

    // Safety timeout: if AI takes too long, show error but fallback will still provide mock
    const timeoutId = setTimeout(() => {
      if (step >= LOADING_MESSAGES.length - 1) setLoadStep(LOADING_MESSAGES.length - 1)
    }, 15000)

    try {
      const res = await api.generateForm(trimmed)
      clearInterval(interval)
      clearTimeout(timeoutId)
      const generated = res.data
      if (!generated || !generated.formfield) {
        throw new Error('AI returned invalid form structure')
      }
      // Auto-persist generated form as draft so getMyAllForm shows it immediately
      // If user is authenticated, save to DB; otherwise fall back to state-only
      const token = localStorage.getItem('crab_token')
      if (token) {
        try {
          const saveRes = await api.createForm(generated)
          const saved = saveRes.data
          const savedId = saved?._id || saved?.id
          if (savedId) {
            navigate(`/builder/${savedId}`, { state: { generatedForm: generated, justCreated: true } })
            return
          }
        } catch (saveErr) {
          console.warn('Auto-save draft failed (will fallback to preview):', saveErr.message)
          // fall through to preview-only navigation — Builder will retry save
        }
      }
      // Fallback: preview without DB (Builder will try to save)
      navigate('/builder/new', { state: { generatedForm: generated } })
    } catch (err) {
      clearInterval(interval)
      clearTimeout(timeoutId)
      console.error('Generate failed:', err)
      // Provide more helpful message for network/connection issues
      const msg = err.message || 'Failed to generate form'
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Unable to connect')) {
        setError('Cannot reach AI server. Is the backend running on ' + (import.meta.env.VITE_API_URL || '/api') + '?')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  const handleSuggestion = (s) => {
    setPrompt(s)
  }

  return (
    <div className="create-form-page">
      <div className="glow-orb" style={{ top: '20%', left: '15%', width: 280, height: 280, background: 'rgba(255,95,31,0.15)' }} />
      <div className="glow-orb" style={{ bottom: '15%', right: '15%', width: 260, height: 260, background: 'rgba(108,99,255,0.12)', animationDelay: '-3s' }} />

      <Link to="/dashboard" className="create-form__back">
        ← Back to Dashboard
      </Link>

      <motion.div
        className="create-form__inner"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="create-form__crab" aria-hidden="true">🦀</span>
        <h1 className="create-form__title">What are we making?</h1>
        <p className="create-form__subtitle">
          Describe your form. Crab will handle the rest.
        </p>

        {/* Input area */}
        <div className="create-form__input-area">
          <textarea
            className="create-form__textarea"
            placeholder="Describe your form... e.g. 'A feedback form for our college hackathon with ratings and suggestions'"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
            }}
            rows={4}
            aria-label="Form description"
            id="form-prompt"
          />
          <div className="create-form__input-actions">
            <button className="create-form__voice-btn" aria-label="Use voice input" id="voice-input-btn">
              <span className="create-form__voice-icon">🎤</span>
              Talk instead
            </button>
            <motion.button
              className="create-form__generate-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              id="generate-form-btn"
              aria-label="Generate form"
            >
              {loading ? 'Generating...' : 'Generate →'}
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="auth-error" role="alert" style={{ marginTop: 16, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            {error}
          </div>
        )}

        {/* Suggestions */}
        <div className="create-form__suggestions">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={i}
              className="suggestion-chip"
              onClick={() => handleSuggestion(s)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              aria-label={`Quick suggestion: ${s}`}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
          >
            <motion.div
              className="loading-crab"
              key={loadStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              🦀
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={loadStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ textAlign: 'center' }}
              >
                <p className="loading-message">{LOADING_MESSAGES[loadStep].msg}</p>
                <p className="loading-sub">{LOADING_MESSAGES[loadStep].sub}</p>
              </motion.div>
            </AnimatePresence>

            <div className="loading-progress">
              <motion.div
                className="loading-progress__bar"
                initial={{ width: '0%' }}
                animate={{ width: `${((loadStep + 1) / LOADING_MESSAGES.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
