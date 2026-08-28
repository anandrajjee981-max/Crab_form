import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import '../styles/landing.css'

gsap.registerPlugin(ScrollTrigger)

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }
  })
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

/* ─── Hero Section ─── */
function Hero() {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero__badge', { opacity: 0, y: -20, duration: 0.8, delay: 0.2 })
      gsap.from('.hero__title', { opacity: 0, y: 60, duration: 1, delay: 0.4, ease: 'power3.out' })
      gsap.from('.hero__subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.7 })
      gsap.from('.hero__ctas', { opacity: 0, y: 20, duration: 0.7, delay: 0.9 })
      gsap.from('.hero__right', { opacity: 0, x: 60, duration: 1, delay: 0.5, ease: 'power3.out' })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero__bg" />
      <div className="hero__grid-lines" />
      <div className="glow-orb" style={{ top: '10%', right: '15%', width: 300, height: 300, background: 'rgba(255,95,31,0.18)' }} />
      <div className="glow-orb" style={{ bottom: '15%', left: '10%', width: 250, height: 250, background: 'rgba(108,99,255,0.15)', animationDelay: '-4s' }} />
      <div className="container">
        <div className="hero__inner">
          <div className="hero__left">
            <motion.div
              className="hero__badge"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              THE FORM BUILDER WITH CLAWS 🦀
            </motion.div>
            <h1 className="hero__title">
              Forms that<br />
              move <em>different.</em>
            </h1>
            <p className="hero__subtitle">
              Build forms with your voice, your words, or just your vibe. No boring templates. No corporate UI.
            </p>
            <div className="hero__ctas">
              <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link to="/create" className="btn-primary" id="hero-cta-create">
                  Create a Form →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
                <a href="#how" className="btn-secondary" id="hero-cta-how">
                  See how it works
                </a>
              </motion.div>
            </div>
            <button className="btn-voice" id="hero-voice-btn" aria-label="Talk to Crab">
              <span className="btn-voice__icon">🎤</span>
              Talk to Crab
            </button>
          </div>

          <div className="hero__right">
            <HeroFormPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroFormPreview() {
  return (
    <motion.div
      className="hero__form-preview"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <div className="form-preview__header">
        <div>
          <div className="form-preview__title">Internship Check-in 🦀</div>
        </div>
        <span className="form-preview__tag">Live</span>
      </div>
      <div className="form-preview__fields">
        {[
          { label: "What's your name?", value: "Drop your name here", delay: 0.8 },
          { label: "Rate the experience", isStars: true, delay: 1.0 },
          { label: "What went well?", value: "Tell us everything...", delay: 1.2 },
        ].map((field, i) => (
          <motion.div
            key={i}
            className="preview-field"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: field.delay }}
            whileHover={{ borderColor: 'rgba(255,95,31,0.4)', scale: 1.01 }}
          >
            <div className="preview-field__label">{field.label}</div>
            {field.isStars ? (
              <div className="preview-field__stars">
                {'⭐'.repeat(4)}<span style={{ filter: 'grayscale(1)' }}>⭐</span>
              </div>
            ) : (
              <div className={`preview-field__input ${field.value.includes('...') || field.value.includes('here') ? 'placeholder' : ''}`}>
                {field.value}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── "Boring Forms" vs Crab Section ─── */
function CompareSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section compare-section" id="how" ref={ref}>
      <div className="container">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.p className="section__label" variants={fadeUp}>The difference</motion.p>
          <motion.h2 className="section__title" variants={fadeUp}>
            Why are forms still boring?
          </motion.h2>
          <motion.p className="section__sub" variants={fadeUp}>
            Every other form tool looks the same. We fixed that.
          </motion.p>
        </motion.div>

        <div className="compare__grid">
          <motion.div
            className="compare__card compare__card--boring"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="compare__tag">😴</span>
            <div className="compare__card-label">Boring Form</div>
            {['Name', 'Email', 'Your question', 'Another field'].map((f, i) => (
              <div className="boring-form-field" key={i}>
                <label>{f}:</label>
                <div className="boring-input" />
              </div>
            ))}
          </motion.div>

          <motion.div
            className="compare__card compare__card--crab"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <span className="compare__tag">🦀</span>
            <div className="compare__card-label">Crab Form</div>
            {[
              { label: "What's your name?", val: "Drop it here 👀" },
              { label: "Rate the vibe ⭐", val: "⭐⭐⭐⭐☆" },
              { label: "Best part?", val: "Tell us everything..." },
              { label: "Suggestions?", val: "Make it spicy 🌶" },
            ].map((f, i) => (
              <motion.div
                className="crab-form-field"
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                whileHover={{ borderColor: 'var(--orange)' }}
              >
                <div className="crab-form-field__label">{f.label}</div>
                <div className="crab-form-field__value">{f.val}</div>
              </motion.div>
            ))}
            <motion.p
              style={{ color: 'var(--orange)', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 12, fontSize: '0.9rem' }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              Yeah... we fixed that. 🦀
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Voice Section ─── */
function VoiceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const fields = [
    { emoji: '⭐', label: 'Event Rating' },
    { emoji: '🍜', label: 'Food Experience' },
    { emoji: '📋', label: 'Management Quality' },
    { emoji: '✨', label: 'Best Moment' },
    { emoji: '💬', label: 'Your Suggestions' },
  ]

  return (
    <section className="section voice-section" ref={ref}>
      <div className="container">
        <div className="voice__inner">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.p className="section__label" variants={fadeUp}>Voice creation</motion.p>
            <motion.h2 className="section__title" variants={fadeUp}>
              Don't type it.<br />Just say it.
            </motion.h2>
            <motion.p className="section__sub" variants={fadeUp}>
              Describe your form in plain English. Crab turns it into a real, styled, publish-ready form. No prompting skills required.
            </motion.p>
          </motion.div>

          <motion.div
            className="voice__demo"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.div
              className="voice__mic-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Microphone button"
            >
              🎤
            </motion.div>

            {/* Live voice wave visualizer animation */}
            <div className="voice__waves" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 28, marginBottom: 16 }}>
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.4, 0.85, 0.5, 0.9, 0.3].map((heightScale, idx) => (
                <motion.span
                  key={idx}
                  style={{ width: 3, height: '100%', background: 'var(--orange)', borderRadius: 4, transformOrigin: 'bottom' }}
                  animate={{ scaleY: [0.3, heightScale, 0.2] }}
                  transition={{ duration: 0.8 + (idx % 3) * 0.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: idx * 0.08 }}
                />
              ))}
            </div>

            <div className="voice__transcript">
              "Make me a feedback form for our college fest with ratings and suggestions..."
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 16, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Generated fields
            </p>
            <div className="voice__generated">
              {fields.map((f, i) => (
                <motion.div
                  className="voice__generated-field"
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.12 }}
                >
                  <span className="field-emoji">{f.emoji}</span>
                  <span>{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── AI Section ─── */
const AI_STEPS = [
  'Understanding vibe...',
  'Choosing questions...',
  'Picking theme...',
  'Building form...',
]

function AISection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section ai-section" ref={ref}>
      <div className="container">
        <div className="ai__inner">
          <motion.div
            className="ai__demo"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="ai__user-prompt">
              <div className="prompt-label">You said</div>
              "Create an internship feedback form for college students."
            </div>
            <div className="ai__thinking">
              <div className="ai__thinking-label">🦀 Crab Brain</div>
              {AI_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  className="ai__step done"
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                >
                  <span className="ai__step-dot" />
                  {step}
                </motion.div>
              ))}
            </div>
            <motion.div
              style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,95,31,0.2)', borderRadius: 'var(--radius-md)', padding: 16 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <p style={{ color: 'var(--orange)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Generated Form
              </p>
              {['How was the mentorship?', 'Rate your learning (1-5)', 'Would you recommend?', 'Any suggestions?'].map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 1.1 + i * 0.1 }}
                  style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--muted-2)' }}
                >
                  {q}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.p className="section__label" variants={fadeUp}>AI generation</motion.p>
            <motion.h2 className="section__title" variants={fadeUp}>
              The invisible engine.
            </motion.h2>
            <motion.p className="section__sub" variants={fadeUp}>
              Crab Brain reads your intent, picks the right questions, and builds a form that actually makes sense — in seconds.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Features Grid ─── */
const FEATURES = [
  { icon: '🎤', title: 'Voice to Form', desc: 'Speak naturally. Crab transcribes and generates your form instantly.' },
  { icon: '🧠', title: 'Crab Brain AI', desc: 'Not a chatbot — an invisible engine that reads your vibe and picks the right fields.' },
  { icon: '🎨', title: '8 Bold Themes', desc: 'From Midnight to Chaos. Every theme looks like a design team built it.' },
  { icon: '⚡', title: 'Live Preview', desc: 'See changes in real time. No reload. No lag. Just vibes.' },
  { icon: '📊', title: 'Response Analytics', desc: 'Smart response summaries. Know what your audience is saying at a glance.' },
  { icon: '🚀', title: 'One-click Publish', desc: 'Hit ship. Get a link. Share it everywhere. Done.' },
]

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section features-section" id="features" ref={ref}>
      <div className="container">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <motion.p className="section__label" variants={fadeUp}>What you get</motion.p>
          <motion.h2 className="section__title" variants={fadeUp}>Built different.</motion.h2>
        </motion.div>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Section ─── */
function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section cta-section" ref={ref}>
      <div className="container">
        <motion.div
          className="cta-section__inner"
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span className="cta-section__crab" variants={fadeUp}>🦀</motion.span>
          <motion.h2 className="cta-section__title" variants={fadeUp}>
            Ready to stop making boring forms?
          </motion.h2>
          <motion.p className="cta-section__sub" variants={fadeUp}>
            Create your first form in under 30 seconds. No account required to try.
          </motion.p>
          <motion.div className="cta-section__btns" variants={fadeUp}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/create" className="btn-primary" id="cta-create-btn">
                Create a Form — it's free
              </Link>
            </motion.div>
            <Link to="/dashboard" className="btn-secondary" id="cta-dashboard-btn">
              Go to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <span>🦀</span>
            <span>Crab Form</span>
          </div>
          <p className="footer__copy">© 2025 Crab Form. Forms that move different.</p>
          <ul className="footer__links" role="list">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

/* ─── Landing Page ─── */
export default function Landing() {
  return (
    <div className="noise">
      <Navbar />
      <main>
        <Hero />
        <CompareSection />
        <VoiceSection />
        <AISection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
