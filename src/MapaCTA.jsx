import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import './MapaCTA.css';

export default function MapaCTA() {
  return (
    <section className="mapa-cta" aria-label="Mapa Sistêmico Familiar">
      <div className="mapa-cta__icone">
        <Sparkles size={22} strokeWidth={1.8} />
      </div>
      <h2 className="mapa-cta__titulo">Quer enxergar seu momento em um mapa?</h2>
      <p className="mapa-cta__texto">
        Uma ferramenta visual e interativa para posicionar as pessoas e os
        sentimentos que fazem parte da sua história — no seu tempo, do seu jeito.
      </p>
      <Link to="/mapa" className="botao botao--primario mapa-cta__botao">
        Criar meu Mapa Sistêmico
        <ArrowRight size={18} strokeWidth={2} />
      </Link>
    </section>
  );
}