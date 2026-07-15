import { Link } from 'react-router-dom'
import { MessageCircle, HeartHandshake, ClipboardCheck, Route, ArrowRight } from 'lucide-react'
import './HowItWorks.css'

const passos = [
  {
    icone: MessageCircle,
    titulo: 'Você compartilha o que está vivendo.',
  },
  {
    icone: HeartHandshake,
    titulo: 'Eu leio pessoalmente o seu relato.',
  },
  {
    icone: ClipboardCheck,
    titulo: 'Você recebe uma devolutiva clara.',
  },
  {
    icone: Route,
    titulo: 'Se fizer sentido, pode aprofundar depois.',
    italico: true,
  },
]

export default function HowItWorks() {
  return (
    <section className="como-funciona" id="como-funciona">
      <div className="secao__cabecalho">
        <span className="secao__eyebrow">O caminho</span>
        <h2>Como funciona</h2>
      </div>

      <ol className="como-funciona__lista">
        {passos.map((passo, indice) => {
          const Icone = passo.icone
          return (
            <li className="como-funciona__passo" key={passo.titulo}>
              <div className="como-funciona__icone">
                <Icone size={26} strokeWidth={1.6} />
              </div>
              <p className={passo.italico ? 'como-funciona__texto--italico' : ''}>
                {passo.titulo}
              </p>
              {indice < passos.length - 1 && (
                <ArrowRight
                  className="como-funciona__seta"
                  size={20}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      <Link to="/relato" className="botao botao--primario como-funciona__cta">
        Quero relatar minha situação
      </Link>
    </section>
  )
}