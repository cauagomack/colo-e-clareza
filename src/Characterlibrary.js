// Biblioteca de personagens do Mapa Sistêmico Familiar.
// Cada categoria tem uma cor e um ícone (nome do componente do lucide-react,
// resolvido em components/mapa/CharacterAvatar.jsx).

export const CATEGORIAS = [
  { id: 'bebes', titulo: 'Bebês', icone: 'Baby', cor: '#E7A9A0' },
  { id: 'criancas', titulo: 'Crianças', icone: 'Smile', cor: '#E3B563' },
  { id: 'adolescentes', titulo: 'Adolescentes', icone: 'UserRound', cor: '#8FA68E' },
  { id: 'adultos', titulo: 'Adultos', icone: 'User', cor: '#7C9CB5' },
  { id: 'simbolicos', titulo: 'Representantes Simbólicos', icone: 'Sparkles', cor: '#B79AC9' },
]

export const PERSONAGENS_BASE = [
  // Bebês
  { id: 'bebe-vigilante', categoria: 'bebes', label: 'Bebê vigilante' },
  { id: 'bebe-contato', categoria: 'bebes', label: 'Bebê em busca de contato' },
  { id: 'bebe-autoacalmando', categoria: 'bebes', label: 'Bebê autoacalmando-se' },

  // Crianças
  { id: 'crianca-espontanea', categoria: 'criancas', label: 'Criança espontânea' },
  { id: 'crianca-observadora', categoria: 'criancas', label: 'Criança observadora' },
  { id: 'crianca-invisivel', categoria: 'criancas', label: 'Criança invisível' },
  { id: 'crianca-cuidadora', categoria: 'criancas', label: 'Criança cuidadora' },

  // Adolescentes
  { id: 'adolescente-idealista', categoria: 'adolescentes', label: 'Adolescente idealista' },
  { id: 'adolescente-retraido', categoria: 'adolescentes', label: 'Adolescente retraído' },
  { id: 'adolescente-rebelde', categoria: 'adolescentes', label: 'Adolescente rebelde' },
  { id: 'adolescente-responsavel', categoria: 'adolescentes', label: 'Adolescente responsável' },

  // Adultos
  { id: 'mae', categoria: 'adultos', label: 'Mãe' },
  { id: 'pai', categoria: 'adultos', label: 'Pai' },
  { id: 'madrasta', categoria: 'adultos', label: 'Madrasta' },
  { id: 'padrasto', categoria: 'adultos', label: 'Padrasto' },
  { id: 'avo', categoria: 'adultos', label: 'Avó' },
  { id: 'avo-m', categoria: 'adultos', label: 'Avô' },
  { id: 'irma', categoria: 'adultos', label: 'Irmã' },
  { id: 'irmao', categoria: 'adultos', label: 'Irmão' },
  { id: 'ex-companheiro', categoria: 'adultos', label: 'Ex-companheiro(a)' },
  { id: 'eu', categoria: 'adultos', label: 'Eu' },

  // Representantes simbólicos
  { id: 'segredo', categoria: 'simbolicos', label: 'Segredo familiar' },
  { id: 'perda', categoria: 'simbolicos', label: 'Perda / Luto' },
  { id: 'doenca', categoria: 'simbolicos', label: 'Doença' },
  { id: 'vinculo-cortado', categoria: 'simbolicos', label: 'Vínculo cortado' },
  { id: 'heranca-emocional', categoria: 'simbolicos', label: 'Herança emocional' },
  { id: 'luz', categoria: 'simbolicos', label: 'Luz / Recurso interno' },
]

export function categoriaPorId(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)
}