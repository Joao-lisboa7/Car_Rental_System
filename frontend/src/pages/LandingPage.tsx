import { Link } from 'react-router-dom'

const highlights = [
  { number: '01', title: 'Escolha o seu carro', text: 'Encontre o modelo ideal para cada caminho.' },
  { number: '02', title: 'Reserve sem complicação', text: 'Tudo o que você precisa, em poucos passos.' },
  { number: '03', title: 'Aproveite a viagem', text: 'Mais liberdade para chegar onde quiser.' },
]

function LandingPage() {
  return (
    <main className="landing-page">
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

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span /> SUA PRÓXIMA VIAGEM COMEÇA AQUI</p>
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
        <div className="hero-art" aria-hidden="true">
          <div className="art-glow" />
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-car">
            <div className="car-roof" />
            <div className="car-window" />
            <div className="car-body" />
            <div className="car-light" />
            <div className="car-wheel wheel-left" />
            <div className="car-wheel wheel-right" />
          </div>
          <div className="art-caption"><span>01 / 03</span><span>LIBERDADE EM CADA QUILÔMETRO</span></div>
        </div>
        <div className="hero-index"><span>01</span><span className="index-line" /><span>03</span></div>
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
