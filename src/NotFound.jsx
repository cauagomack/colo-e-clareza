import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <p className="notfound__eyebrow">Página não encontrada</p>
      <h1>Esse caminho ainda não foi mapeado.</h1>
      <p className="notfound__text">
        O endereço que você tentou acessar não existe. Que tal voltar para o início?
      </p>
      <Link to="/" className="notfound__link">
        <Home size={18} strokeWidth={1.8} />
        Voltar para o início
      </Link>
    </div>
  )
}