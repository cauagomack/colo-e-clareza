import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import './Relato.css'

const ASSUNTOS = [
  'Só preciso de clareza',
  'Diagnóstico Aprofundado',
  'Constelação Individual',
  'Constelação em Grupo',
  'Vivência para Mães',
]

const ESTADO_INICIAL = {
  nome: '',
  contato: '',
  assunto: '',
  relato: '',
}

export default function Relato() {
  const [searchParams] = useSearchParams()
  const assuntoInicial = searchParams.get('assunto') || ''

  const [dados, setDados] = useState({
    ...ESTADO_INICIAL,
    assunto: ASSUNTOS.includes(assuntoInicial) ? assuntoInicial : ASSUNTOS[0],
  })
  const [erros, setErros] = useState({})
  const [enviado, setEnviado] = useState(false)

  function atualizarCampo(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    if (erros[campo]) {
      setErros((atual) => ({ ...atual, [campo]: undefined }))
    }
  }

  function validar() {
    const novosErros = {}
    if (!dados.nome.trim()) novosErros.nome = 'Conte pra mim como posso te chamar.'
    if (!dados.contato.trim()) novosErros.contato = 'Informe um e-mail ou telefone para retorno.'
    if (!dados.relato.trim() || dados.relato.trim().length < 10) {
      novosErros.relato = 'Escreva um pouco mais sobre o que está vivendo.'
    }
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  function aoEnviar(evento) {
    evento.preventDefault()
    if (!validar()) return

    // Sem backend neste momento: os dados ficam apenas neste dispositivo,
    // como comprovante local de envio. Integração real pode ser plugada aqui.
    try {
      const relatos = JSON.parse(localStorage.getItem('relatos-enviados') || '[]')
      relatos.push({ ...dados, enviadoEm: new Date().toISOString() })
      localStorage.setItem('relatos-enviados', JSON.stringify(relatos))
    } catch {
      // Falha silenciosa: localStorage pode estar indisponível.
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="relato relato--confirmacao">
        <div className="relato__cartao relato__confirmacao">
          <CheckCircle2 size={48} strokeWidth={1.4} color="var(--terracota-dark)" />
          <h1>Seu relato chegou até mim.</h1>
          <p>
            Obrigada por confiar sua história a este espaço. Vou ler com cuidado e
            retornar pelo contato que você deixou, {dados.nome.split(' ')[0]}.
          </p>
          <Link to="/" className="botao botao--primario">
            Voltar para o início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relato">
      <div className="relato__cartao">
        <Link to="/" className="relato__voltar">
          <ArrowLeft size={16} strokeWidth={2} />
          Voltar
        </Link>

        <h1>Conte o que está vivendo.</h1>
        <p className="relato__descricao">
          Escreva com suas próprias palavras. Não existe forma certa de contar —
          eu vou ler com atenção e cuidado, sem pressa e sem julgamento.
        </p>

        <form className="relato__form" onSubmit={aoEnviar} noValidate>
          <div className="relato__campo">
            <label htmlFor="assunto">Sobre o que você quer falar?</label>
            <select
              id="assunto"
              value={dados.assunto}
              onChange={(evento) => atualizarCampo('assunto', evento.target.value)}
            >
              {ASSUNTOS.map((assunto) => (
                <option key={assunto} value={assunto}>
                  {assunto}
                </option>
              ))}
            </select>
          </div>

          <div className="relato__campo">
            <label htmlFor="relato">Seu relato</label>
            <textarea
              id="relato"
              rows={7}
              placeholder="Escreva aqui o que está acontecendo, como você está se sentindo e o que gostaria de entender melhor..."
              value={dados.relato}
              onChange={(evento) => atualizarCampo('relato', evento.target.value)}
              aria-invalid={Boolean(erros.relato)}
            />
            {erros.relato && <span className="relato__erro">{erros.relato}</span>}
          </div>

          <div className="relato__linha">
            <div className="relato__campo">
              <label htmlFor="nome">Seu nome</label>
              <input
                id="nome"
                type="text"
                placeholder="Como posso te chamar?"
                value={dados.nome}
                onChange={(evento) => atualizarCampo('nome', evento.target.value)}
                aria-invalid={Boolean(erros.nome)}
              />
              {erros.nome && <span className="relato__erro">{erros.nome}</span>}
            </div>

            <div className="relato__campo">
              <label htmlFor="contato">E-mail ou telefone</label>
              <input
                id="contato"
                type="text"
                placeholder="Onde posso te responder?"
                value={dados.contato}
                onChange={(evento) => atualizarCampo('contato', evento.target.value)}
                aria-invalid={Boolean(erros.contato)}
              />
              {erros.contato && <span className="relato__erro">{erros.contato}</span>}
            </div>
          </div>

          <button type="submit" className="botao botao--primario botao--largo">
            Enviar meu relato
            <Send size={17} strokeWidth={2} />
          </button>

          <p className="relato__privacidade">
            O que você escrever aqui é lido apenas por mim, com respeito e sigilo.
          </p>
        </form>
      </div>
    </div>
  )
}