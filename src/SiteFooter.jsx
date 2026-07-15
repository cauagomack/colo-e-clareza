import { Link } from 'react-router-dom';
import './SiteFooter.css';

export default function SiteFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p className="site-footer__frase">
        Cada história merece ser recebida com cuidado.
      </p>
      <div className="site-footer__linhas">
        <span>© {ano} Colo &amp; Clareza</span>
        <Link to="/mapa">Mapa Sistêmico Familiar</Link>
      </div>
    </footer>
  );
}
