import { Link } from 'react-router-dom'
import './SiteHeader.css'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="site-header__brand">
        <span className="site-header__mark" aria-hidden="true" />
        Colo &amp; Clareza
      </Link>
      <nav className="site-header__nav" aria-label="Navegação principal">
        <a href="#como-funciona">Como funciona</a>
        <a href="#aprofundar">Serviços</a>
      </nav>
    </header>
  )
}