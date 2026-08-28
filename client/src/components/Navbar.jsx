import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  const close = () => setOpen(false)

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo" onClick={close}>
            <span className="navbar__logo-icon">🦀</span>
            <span>Crab Form</span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar__links" role="list">
            <li><a href="#features" onClick={close}>Features</a></li>
            <li><a href="#how" onClick={close}>How it works</a></li>
            <li><a href="#themes" onClick={close}>Themes</a></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>

          <div className="navbar__actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="navbar__login">Log in</Link>
                <Link to="/register" className="navbar__register">Sign up</Link>
              </>
            ) : (
              <>
                <span className="navbar__user" title={user?.email}>{user?.name?.split(' ')[0] || 'Account'}</span>
                <button className="navbar__logout" onClick={handleLogout}>Logout</button>
              </>
            )}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="navbar__cta-wrap">
              <Link to="/create" className="navbar__cta">Create a Form →</Link>
            </motion.div>
          </div>

          <button
            className={`navbar__hamburger ${open ? 'open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="navbar__backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
              aria-hidden="true"
            />
            <motion.div
              className="navbar__drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              role="dialog" aria-modal="true" aria-label="Mobile menu"
            >
              <div className="navbar__drawer-head">
                <Link to="/" className="navbar__logo" onClick={close}><span>🦀</span> Crab Form</Link>
                <button className="navbar__close" onClick={close} aria-label="Close menu">✕</button>
              </div>
              <ul className="navbar__drawer-links" role="list">
                <li><a href="#features" onClick={close}>Features</a></li>
                <li><a href="#how" onClick={close}>How it works</a></li>
                <li><a href="#themes" onClick={close}>Themes</a></li>
                <li><Link to="/dashboard" onClick={close}>Dashboard</Link></li>
                <li><Link to="/create" onClick={close}>Create a Form</Link></li>
              </ul>
              <div className="navbar__drawer-auth">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="drawer-btn drawer-btn--ghost" onClick={close}>Log in</Link>
                    <Link to="/register" className="drawer-btn drawer-btn--primary" onClick={close}>Sign up →</Link>
                  </>
                ) : (
                  <>
                    <div className="drawer-user">Hi, {user?.name || user?.email} 👋</div>
                    <button className="drawer-btn drawer-btn--ghost" onClick={handleLogout}>Logout</button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
