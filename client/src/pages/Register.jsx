import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/auth.css'

export default function Register() {
  const { register, login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('All fields are required')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    try {
      await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password })
      setSuccess('Account created! Logging you in...')
      // auto-login after register
      await login({ email: form.email.trim().toLowerCase(), password: form.password })
      setTimeout(() => navigate('/dashboard'), 600)
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <Link to="/" className="auth-logo"><span>🦀</span> Crab Form</Link>
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Join Crab Form — forms that move different.</p>

          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && <div className="auth-success" role="status">{success}</div>}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="field-group">
              <label htmlFor="reg-name" className="field-label">Name</label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                className="auth-input"
                placeholder="Anand Raj"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="reg-email" className="field-label">Email</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                className="auth-input"
                placeholder="you@crabform.io"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="reg-password" className="field-label">Password</label>
              <div className="password-wrap">
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="auth-input"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)} aria-label="Toggle password">
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="field-hint">Min 8 characters. Use a strong password.</p>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account →'}
            </button>
          </form>

          <p className="auth-foot">
            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
