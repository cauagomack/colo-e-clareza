import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import HeroIllustration from './HeroIllustration.jsx'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__text">
        <h1 className="hero__headline">
          Às vezes, a mãe não precisa de mais julgamento.
          <span className="hero__headline-accent"> Precisa de clareza.</span>
        </h1>
        <p className="hero__lead">
          Aqui, sua história é recebida e lida por uma pessoa real.
        </p>
        <p className="hero__note">
          (Se você é pai ou cuidador, esse espaço também é para você.)
        </p>
        <Link to="/relato" className="botao botao--primario hero__cta">
          Quero clareza sobre o que estou vivendo
          <ArrowRight size={18} strokeWidth={2} />
        </Link>
      </div>
      <div className="hero__figure">
        <HeroIllustration />
      </div>
    </section>
  )
}