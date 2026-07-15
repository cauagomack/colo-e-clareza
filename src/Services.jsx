import { Link } from 'react-router-dom'
import './Services.css'

const servicos = [
  {
    titulo: 'Diagnóstico Aprofundado',
    descricao: 'Uma leitura mais completa do momento que você está vivendo.',
  },
  {
    titulo: 'Constelação Individual',
    descricao: 'Um encontro só seu, para olhar para as dinâmicas da sua família.',
  },
  {
    titulo: 'Constelação em Grupo',
    descricao: 'Vivência coletiva, acolhida junto a outras mães em jornadas parecidas.',
  },
  {
    titulo: 'Vivência para Mães',
    descricao: 'Um espaço para respirar, trocar e se reconhecer em outras histórias.',
  },
]

export default function Services() {
  return (
    <section className="servicos" id="aprofundar">
      <div className="secao__cabecalho">
        <span className="secao__eyebrow">Próximos passos</span>
        <h2>Aprofunde-se mais</h2>
      </div>

      <div className="servicos__grade">
        {servicos.map((servico) => (
          <Link
            to={`/relato?assunto=${encodeURIComponent(servico.titulo)}`}
            className="servicos__cartao"
            key={servico.titulo}
          >
            <h3>{servico.titulo}</h3>
            <p>{servico.descricao}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}