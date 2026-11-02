import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import carVideo from '../assets/Black_car_scroll.mp4'
import './LandingPage.css'

const highlights = [
  { number: '01', title: 'Escolha o seu carro', text: 'Encontre o modelo ideal para cada caminho.' },
  { number: '02', title: 'Reserve sem complicação', text: 'Tudo o que você precisa, em poucos passos.' },
  { number: '03', title: 'Aproveite a viagem', text: 'Mais liberdade para chegar onde quiser.' },
]

function LandingPage() {
  const storyRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const story = storyRef.current
    const video = videoRef.current
    if (!story || !video) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let desiredTime = 0
    let isSeeking = false
    let lastFrameTime = 0

    const updateFromScroll = () => {
      const duration = video.duration
      if (!Number.isFinite(duration) || duration <= 0) return

      const scrollableDistance = story.offsetHeight - window.innerHeight
      const progress = reducedMotion.matches || scrollableDistance <= 0
        ? 0
        : Math.min(1, Math.max(0, -story.getBoundingClientRect().top / scrollableDistance))

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`
      }

      desiredTime = progress * duration
      scheduleFrame()
    }

    const renderFrame = (timestamp: number) => {
      frameId = 0
      if (isSeeking || video.readyState < HTMLMediaElement.HAVE_METADATA) return

      const difference = desiredTime - video.currentTime
      if (Math.abs(difference) < 0.025) return

      const elapsed = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1000, 0.05) : 1 / 60
      lastFrameTime = timestamp
      const nextTime = video.currentTime + difference * (1 - Math.exp(-16 * elapsed))

      isSeeking = true
      try {
        video.currentTime = nextTime
      } catch {
        isSeeking = false
      }
    }

    const scheduleFrame = () => {
      if (!frameId) frameId = window.requestAnimationFrame(renderFrame)
    }

    const handleSeeked = () => {
      isSeeking = false
      if (Math.abs(desiredTime - video.currentTime) >= 0.015) {
        scheduleFrame()
      } else {
        lastFrameTime = 0
      }
    }

    const scheduleUpdate = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        if (!frameId) frameId = window.requestAnimationFrame(() => {
          frameId = 0
          updateFromScroll()
        })
      }
    }

    const handleMotionChange = () => scheduleUpdate()

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    video.addEventListener('loadedmetadata', scheduleUpdate)
    video.addEventListener('durationchange', scheduleUpdate)
    video.addEventListener('seeked', handleSeeked)
    reducedMotion.addEventListener('change', handleMotionChange)

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) scheduleUpdate()

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      video.removeEventListener('loadedmetadata', scheduleUpdate)
      video.removeEventListener('durationchange', scheduleUpdate)
      video.removeEventListener('seeked', handleSeeked)
      reducedMotion.removeEventListener('change', handleMotionChange)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <main className="landing-page">
      <section className="drive-story" ref={storyRef} aria-label="Conheça a Veloce">
        <div className="drive-sticky">
          <video
            ref={videoRef}
            className="drive-video"
            src={carVideo}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="video-shade" aria-hidden="true" />
          <header className="site-header">
            <Link className="wordmark" to="/" aria-label="Veloce, início">
              <span className="wordmark-mark">V</span>
              <span>VELOCE<small>CAR RENTAL</small></span>
            </Link>
            <nav className="site-nav" aria-label="Navegação principal">
              <a href="#how-it-works">Como funciona</a>
              <a href="#benefits">Vantagens</a>
            </nav>
            <div className="header-actions">
              <Link className="text-link" to="/login">Entrar</Link>
              <Link className="button-link" to="/register">Criar conta</Link>
            </div>
          </header>
          <div className="hero-copy">
            <h1>O caminho é seu.<br /><em>Vá mais longe.</em></h1>
            <p className="hero-description">
              Liberdade para descobrir novos lugares, no seu ritmo e com o carro perfeito para cada jornada.
            </p>
            <div className="hero-actions">
              <Link className="button-link button-link-large" to="/register">Encontre seu próximo carro <span aria-hidden="true">↗</span></Link>
              <a className="subtle-link" href="#how-it-works">Descubra como funciona <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-proof">
              <span className="proof-stars" aria-label="5 estrelas">★★★★★</span>
              <span>Uma nova forma de viajar, feita para você.</span>
            </div>
          </div>
          <div className="scroll-progress" aria-hidden="true">
            <div ref={progressRef} />
          </div>
        </div>
      </section>

      <section className="intro-strip" id="benefits">
        <p>VIAJAR BEM<br />MUDA TUDO.</p>
        <p>Uma experiência de aluguel simples, transparente e pensada para quem não abre mão de ir além.</p>
        <span className="strip-arrow" aria-hidden="true">↘</span>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow"><span /> SEM COMPLICAÇÃO</p>
          <h2>Três passos.<br /><em>Novos destinos.</em></h2>
        </div>
        <div className="steps-grid">
          {highlights.map((item) => (
            <article className="step-card" key={item.number}>
              <span className="step-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-cta">
        <p className="eyebrow"><span /> A ESTRADA ESTÁ ESPERANDO</p>
        <h2>Seu próximo destino<br /><em>começa agora.</em></h2>
        <Link className="button-link button-link-large" to="/register">Comece sua jornada <span aria-hidden="true">↗</span></Link>
      </section>

      <footer className="site-footer">
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <span>Liberdade em cada quilômetro.</span>
        <Link to="/login">Acesse sua conta <span aria-hidden="true">↗</span></Link>
      </footer>
    </main>
  )
}

export default LandingPage
