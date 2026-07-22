import './Mapa.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FlipHorizontal,
  HelpCircle,
  Home,
  Minus,
  Pencil,
  Plus,
  Users,
  X,
} from 'lucide-react';
import './Mapa.css';

// Chave de armazenamento do fluxo guiado + campo sistêmico.
const STORAGE_KEY_V2 = 'colo-clareza-mapa-v2';

// TODO: defina aqui o valor real da análise antes de publicar.
const ANALYSIS_PRICE_LABEL = 'R$ XX,XX';

// As 5 perguntas do fluxo guiado. "role" é o texto curto usado na
// confirmação e na etiqueta da bancada; "prompt" é a pergunta em destaque.
const GUIDED_QUESTIONS = [
  { role: 'você', prompt: 'Quem representa você?' },
  { role: 'essa situação', prompt: 'Quem representa essa situação?' },
  {
    role: 'a pessoa mais diretamente ligada a essa situação',
    prompt: 'Quem está mais diretamente ligado a essa situação?',
  },
  {
    role: 'quem também é afetado por essa situação',
    prompt: 'Quem também é afetado por essa situação?',
  },
  {
    role: 'essa trajetória familiar semelhante',
    prompt:
      'Existe alguém da sua história familiar cuja trajetória lhe lembre, de alguma forma, essa situação?',
  },
];

const CATEGORY_TABS_ORDER = ['babies', 'children', 'teens', 'adults', 'symbols'];

const BASE_CHARACTERS = [
  {
    id: 'baby-alert',
    label: 'Bebê vigilante',
    category: 'babies',
    kind: 'baby',
    skin: '#d28a5f',
    hair: '#6f3a24',
    clothes: '#7db6c4',
    background: '#f8ddc9',
  },
  {
    id: 'baby-contact',
    label: 'Bebê em busca de contato',
    category: 'babies',
    kind: 'baby',
    skin: '#bc7047',
    hair: '#4a2d22',
    clothes: '#d69a5f',
    background: '#f6d7c3',
  },
  {
    id: 'baby-calm',
    label: 'Bebê se acalmando',
    category: 'babies',
    kind: 'baby',
    skin: '#d49a70',
    hair: '#8b5a35',
    clothes: '#739c82',
    background: '#ebe1c8',
  },

  {
    id: 'child-spontaneous',
    label: 'Criança espontânea',
    category: 'children',
    kind: 'girl',
    skin: '#8f5138',
    hair: '#3c261f',
    clothes: '#b277a1',
    background: '#e7d5c5',
  },
  {
    id: 'child-observer',
    label: 'Criança observadora',
    category: 'children',
    kind: 'boy',
    skin: '#b86d4d',
    hair: '#2d2928',
    clothes: '#4c8da2',
    background: '#d5e7e8',
  },
  {
    id: 'child-invisible',
    label: 'Criança invisível',
    category: 'children',
    kind: 'girl',
    skin: '#be7d59',
    hair: '#6a4a38',
    clothes: '#8f78a3',
    background: '#e4d8cb',
  },
  {
    id: 'child-caregiver',
    label: 'Criança cuidadora',
    category: 'children',
    kind: 'girl',
    skin: '#c17a55',
    hair: '#4f2b20',
    clothes: '#c26f61',
    background: '#f0d8ca',
  },

  {
    id: 'teen-sensitive',
    label: 'Adolescente sensível',
    category: 'teens',
    kind: 'girl',
    skin: '#c98661',
    hair: '#6a3327',
    clothes: '#8d93bd',
    background: '#e5d9e6',
  },
  {
    id: 'teen-observer',
    label: 'Adolescente observador',
    category: 'teens',
    kind: 'boy',
    skin: '#b76d4c',
    hair: '#322b29',
    clothes: '#61889d',
    background: '#d5e3e3',
  },
  {
    id: 'teen-responsible',
    label: 'Adolescente responsável',
    category: 'teens',
    kind: 'boy',
    skin: '#d0926b',
    hair: '#744a32',
    clothes: '#778b63',
    background: '#dce3cf',
  },
  {
    id: 'teen-rebel',
    label: 'Adolescente rebelde',
    category: 'teens',
    kind: 'girl',
    skin: '#a95d43',
    hair: '#2e2425',
    clothes: '#a75d66',
    background: '#ead4d7',
  },

  {
    id: 'self',
    label: 'Eu',
    category: 'adults',
    kind: 'woman',
    skin: '#c87952',
    hair: '#4e281f',
    clothes: '#4e9471',
    background: '#f1d59f',
  },
  {
    id: 'mother',
    label: 'Mãe',
    category: 'adults',
    kind: 'woman',
    skin: '#c77b58',
    hair: '#6b3426',
    clothes: '#d56f56',
    background: '#f5cfc5',
  },
  {
    id: 'father',
    label: 'Pai',
    category: 'adults',
    kind: 'man',
    skin: '#b56b4a',
    hair: '#292524',
    clothes: '#739070',
    background: '#d7e1cf',
  },
  {
    id: 'partner',
    label: 'Companheiro(a)',
    category: 'adults',
    kind: 'neutral',
    skin: '#c4815e',
    hair: '#594037',
    clothes: '#9a7ba4',
    background: '#e5d9e8',
  },
  {
    id: 'ex-partner',
    label: 'Ex-companheiro(a)',
    category: 'adults',
    kind: 'man',
    skin: '#bd7452',
    hair: '#342825',
    clothes: '#cf7c54',
    background: '#f2d3bb',
  },
  {
    id: 'stepmother',
    label: 'Madrasta',
    category: 'adults',
    kind: 'woman',
    skin: '#d4976f',
    hair: '#d1a34f',
    clothes: '#6f87a5',
    background: '#dfe8df',
  },
  {
    id: 'stepfather',
    label: 'Padrasto',
    category: 'adults',
    kind: 'man',
    skin: '#b66b48',
    hair: '#49342d',
    clothes: '#7f916b',
    background: '#dce2d3',
  },
  {
    id: 'sister',
    label: 'Irmã',
    category: 'adults',
    kind: 'woman',
    skin: '#c9825d',
    hair: '#5d3027',
    clothes: '#b26c78',
    background: '#f2d2cf',
  },
  {
    id: 'brother',
    label: 'Irmão',
    category: 'adults',
    kind: 'man',
    skin: '#c7825c',
    hair: '#332a27',
    clothes: '#79905f',
    background: '#dce4ca',
  },
  {
    id: 'grandmother',
    label: 'Avó',
    category: 'adults',
    kind: 'elder-woman',
    skin: '#d49c78',
    hair: '#d6d2cf',
    clothes: '#8f6d9b',
    background: '#ded5e8',
  },
  {
    id: 'grandfather',
    label: 'Avô',
    category: 'adults',
    kind: 'elder-man',
    skin: '#c78b65',
    hair: '#d1cbc5',
    clothes: '#75869a',
    background: '#d6dfe6',
  },

  {
    id: 'symbol-love',
    label: 'Amor',
    category: 'symbols',
    kind: 'symbol',
    symbol: '♥',
    symbolColor: '#c85f63',
    background: '#f8dfe0',
  },
  {
    id: 'symbol-fear',
    label: 'Medo',
    category: 'symbols',
    kind: 'symbol',
    symbol: '◐',
    symbolColor: '#6f6078',
    background: '#e5dfeb',
  },
  {
    id: 'symbol-guilt',
    label: 'Culpa',
    category: 'symbols',
    kind: 'symbol',
    symbol: '⚖',
    symbolColor: '#8a6a4d',
    background: '#eee2d4',
  },
  {
    id: 'symbol-grief',
    label: 'Luto',
    category: 'symbols',
    kind: 'symbol',
    symbol: '✦',
    symbolColor: '#536174',
    background: '#dfe5eb',
  },
  {
    id: 'symbol-absence',
    label: 'Ausência',
    category: 'symbols',
    kind: 'symbol',
    symbol: '○',
    symbolColor: '#8b776b',
    background: '#ece5df',
  },
  {
    id: 'symbol-secret',
    label: 'Segredo',
    category: 'symbols',
    kind: 'symbol',
    symbol: '…',
    symbolColor: '#754f5d',
    background: '#eadce2',
  },
  {
    id: 'symbol-conflict',
    label: 'Conflito',
    category: 'symbols',
    kind: 'symbol',
    symbol: '↯',
    symbolColor: '#b86a45',
    background: '#f2dfd2',
  },
  {
    id: 'symbol-money',
    label: 'Dinheiro',
    category: 'symbols',
    kind: 'symbol',
    symbol: '$',
    symbolColor: '#6f8963',
    background: '#e1eadc',
  },
  {
    id: 'symbol-work',
    label: 'Trabalho',
    category: 'symbols',
    kind: 'symbol',
    symbol: '◆',
    symbolColor: '#56798a',
    background: '#dce8ec',
  },
  {
    id: 'symbol-illness',
    label: 'Doença',
    category: 'symbols',
    kind: 'symbol',
    symbol: '+',
    symbolColor: '#b76161',
    background: '#f0dede',
  },
];

// Bancada única com todos os personagens misturados (intercala as
// categorias em vez de agrupá-las) — usada nas 5 perguntas do fluxo guiado.
// As categorias continuam existindo nos dados, só não aparecem na tela.
const MIXED_BENCH = (() => {
  const byCategory = CATEGORY_TABS_ORDER.map((categoryId) =>
    BASE_CHARACTERS.filter((character) => character.category === categoryId),
  );
  const maxLength = Math.max(...byCategory.map((list) => list.length));
  const mixed = [];

  for (let index = 0; index < maxLength; index += 1) {
    byCategory.forEach((list) => {
      if (list[index]) mixed.push(list[index]);
    });
  }

  return mixed;
})();

function clampPercent(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function CharacterAvatar({ character, compact = false }) {
  const size = compact ? 62 : 86;

  if (character.kind === 'symbol') {
    return (
      <div
        className="avatar-shell symbol-avatar"
        style={{
          '--avatar-background': character.background,
          '--symbol-color': character.symbolColor,
          width: size,
          height: size,
        }}
        aria-hidden="true"
      >
        <span>{character.symbol || '✦'}</span>
      </div>
    );
  }

  const isBaby = character.kind === 'baby';
  const isWoman = ['woman', 'girl', 'elder-woman'].includes(character.kind);
  const isElder = ['elder-woman', 'elder-man'].includes(character.kind);
  const hasLongHair = isWoman;

  return (
    <svg
      className="character-avatar"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Ilustração de ${character.label}`}
    >
      <circle cx="50" cy="50" r="49" fill={character.background || '#f3ddd0'} />
      <path
        d={isBaby ? 'M24 100 C25 74 35 65 50 65 C65 65 75 74 76 100' : 'M18 100 C21 72 34 63 50 63 C66 63 79 72 82 100'}
        fill={character.clothes || '#9c7b6c'}
      />

      {hasLongHair && (
        <path
          d="M23 53 C18 17 31 8 50 8 C69 8 82 18 77 55 C73 73 64 76 50 76 C35 76 27 70 23 53Z"
          fill={character.hair || '#5a3428'}
        />
      )}

      {!hasLongHair && (
        <path
          d={isBaby
            ? 'M32 36 C35 20 44 17 52 20 C62 13 71 24 68 39Z'
            : 'M25 39 C27 17 38 10 52 11 C68 11 76 23 74 42 C66 31 56 28 44 30 C36 31 31 35 25 39Z'}
          fill={character.hair || '#4b3229'}
        />
      )}

      <ellipse
        cx="50"
        cy={isBaby ? 46 : 43}
        rx={isBaby ? 19 : 20}
        ry={isBaby ? 21 : 23}
        fill={character.skin || '#c9835e'}
      />

      {hasLongHair && (
        <>
          <path d="M30 44 C28 25 37 17 50 17 C63 17 73 26 71 43 C63 32 53 29 42 30 C36 31 32 36 30 44Z" fill={character.hair || '#5a3428'} />
          <path d="M28 42 C24 58 30 70 37 75" stroke={character.hair || '#5a3428'} strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M72 42 C76 58 70 70 63 75" stroke={character.hair || '#5a3428'} strokeWidth="8" strokeLinecap="round" fill="none" />
        </>
      )}

      {isElder && (
        <>
          <path d="M33 22 C40 12 61 12 68 22" stroke="#efefec" strokeWidth="10" strokeLinecap="round" />
          <circle cx="41" cy="43" r="7" fill="none" stroke="#6e5f58" strokeWidth="2" />
          <circle cx="59" cy="43" r="7" fill="none" stroke="#6e5f58" strokeWidth="2" />
          <path d="M48 43 H52" stroke="#6e5f58" strokeWidth="2" />
        </>
      )}

      {!isElder && (
        <>
          <circle cx="42" cy={isBaby ? 44 : 42} r="2.2" fill="#49342d" />
          <circle cx="58" cy={isBaby ? 44 : 42} r="2.2" fill="#49342d" />
        </>
      )}

      <path
        d={isBaby ? 'M45 54 C48 57 52 57 55 54' : 'M43 53 C47 58 53 58 57 53'}
        stroke="#8f4c42"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {character.kind === 'man' && (
        <path d="M34 55 C38 68 62 68 66 55 C62 63 57 68 50 68 C43 68 38 63 34 55Z" fill={character.hair || '#4b3229'} opacity="0.9" />
      )}

      {isBaby && (
        <path d="M48 17 C43 11 47 6 52 9 C56 11 54 16 50 17" stroke={character.hair || '#4b3229'} strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

// Tela inicial: "O que você deseja olhar hoje?"
function ThemeScreen({ theme, onChangeTheme, onContinue }) {
  return (
    <div className="guided-screen guided-screen--tema">
      <div className="guided-card">
        <h1>O que você deseja olhar hoje?</h1>
        <p className="guided-card__subtitulo">
          Escreva, com suas palavras, a situação ou o momento que você quer entender melhor.
        </p>
        <textarea
          className="guided-tema-input"
          rows={5}
          value={theme}
          onChange={(event) => onChangeTheme(event.target.value)}
          placeholder="Descreva livremente o que está vivendo..."
        />
        <button
          type="button"
          className="botao botao--primario guided-continuar"
          onClick={onContinue}
          disabled={!theme.trim()}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// Tela de cada uma das 5 perguntas: bancada única + confirmação.
function GuidedQuestionScreen({
  questionIndex,
  totalQuestions,
  prompt,
  role,
  benchCharacters,
  pendingCharacter,
  onSelectCharacter,
  onConfirm,
  onCancelPending,
}) {
  return (
    <div className="guided-screen">
      <span className="guided-progresso">
        Pergunta {questionIndex + 1} de {totalQuestions}
      </span>
      <h1 className="guided-pergunta">{prompt}</h1>
      <p className="guided-instrucao">Toque em um personagem para escolhê-lo.</p>

      <div className="guided-bancada">
        {benchCharacters.map((character) => (
          <button
            type="button"
            key={character.id}
            className="guided-bancada__item"
            onClick={() => onSelectCharacter(character.id)}
          >
            <CharacterAvatar character={character} compact />
            <span>{character.label}</span>
          </button>
        ))}
      </div>

      {pendingCharacter && (
        <div className="guided-confirmacao-fundo" role="dialog" aria-modal="true">
          <div className="guided-confirmacao">
            <CharacterAvatar character={pendingCharacter} />
            <p>
              Você escolheu este personagem para representar <strong>{role}</strong>.
              <br />
              É realmente este personagem que deseja escolher?
            </p>
            <div className="guided-confirmacao__botoes">
              <button type="button" className="botao botao--primario" onClick={onConfirm}>
                Sim, confirmar escolha
              </button>
              <button type="button" className="guided-confirmacao__voltar" onClick={onCancelPending}>
                Voltar e continuar observando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Mapa() {
  const mapRef = useRef(null);

  // --- Fluxo guiado ---
  const [theme, setTheme] = useState('');
  const [flowStage, setFlowStage] = useState('tema'); // 'tema' | 'perguntas' | 'campo'
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pendingCharacterId, setPendingCharacterId] = useState(null);

  // --- Campo sistêmico ---
  const [zoom, setZoom] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Os 5 representantes escolhidos. Cada um: { instanceId, characterId,
  // role, name, x, y, facing, inField }. inField=false enquanto ainda
  // está na bancada, esperando ser arrastado para dentro do círculo.
  const [fieldCharacters, setFieldCharacters] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [benchDrag, setBenchDrag] = useState(null); // { instanceId, startX, startY, currentX, currentY }
  const fieldDragMetaRef = useRef(null);

  // --- Conclusão ---
  const [mapCompleted, setMapCompleted] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  // Carrega tudo da chave v2.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_V2));
      if (saved) {
        if (typeof saved.theme === 'string') setTheme(saved.theme);
        if (saved.flowStage) setFlowStage(saved.flowStage);
        if (typeof saved.questionIndex === 'number') setQuestionIndex(saved.questionIndex);
        if (Array.isArray(saved.answers)) setAnswers(saved.answers);
        if (Array.isArray(saved.fieldCharacters)) setFieldCharacters(saved.fieldCharacters);
        if (typeof saved.zoom === 'number') setZoom(saved.zoom);
        if (typeof saved.mapCompleted === 'boolean') setMapCompleted(saved.mapCompleted);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_V2);
    }
  }, []);

  // Salva tudo junto sempre que qualquer parte do estado muda.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        theme,
        flowStage,
        questionIndex,
        answers,
        fieldCharacters,
        zoom,
        mapCompleted,
      }),
    );
  }, [theme, flowStage, questionIndex, answers, fieldCharacters, zoom, mapCompleted]);

  const charactersById = useMemo(
    () => new Map(BASE_CHARACTERS.map((character) => [character.id, character])),
    [],
  );

  // Assim que as 5 perguntas terminam, inicializa os 5 representantes na
  // bancada (uma única vez — se já existir progresso salvo, não mexe).
  useEffect(() => {
    if (
      flowStage === 'campo' &&
      fieldCharacters.length === 0 &&
      answers.length === GUIDED_QUESTIONS.length
    ) {
      setFieldCharacters(
        answers.map((answer) => ({
          instanceId: answer.instanceId,
          characterId: answer.characterId,
          role: answer.role,
          name: answer.name,
          x: 50,
          y: 50,
          facing: 'right',
          inField: false,
        })),
      );
    }
  }, [flowStage, answers, fieldCharacters.length]);

  const selectedFieldCharacter = fieldCharacters.find(
    (character) => character.instanceId === selectedFieldId,
  );

  const screenPointToCanvas = (clientX, clientY) => {
    const rect = mapRef.current.getBoundingClientRect();

    return {
      x: (clientX - rect.left - rect.width / 2) / zoom + rect.width / 2,
      y: (clientY - rect.top - rect.height / 2) / zoom + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  };

  const isPointInsideCircle = (clientX, clientY) => {
    if (!mapRef.current) return false;
    const rect = mapRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= radius;
  };

  // --- Handlers do fluxo guiado (perguntas) ---
  const handleSelectBenchCharacter = (characterId) => {
    setPendingCharacterId(characterId);
  };

  const handleCancelPending = () => {
    setPendingCharacterId(null);
  };

  const handleConfirmPending = () => {
    const character = charactersById.get(pendingCharacterId);
    if (!character) return;

    const currentQuestion = GUIDED_QUESTIONS[questionIndex];
    const newAnswer = {
      role: currentQuestion.role,
      prompt: currentQuestion.prompt,
      characterId: character.id,
      // instanceId próprio: o mesmo personagem pode ser escolhido de novo
      // em outra pergunta e vira uma instância independente.
      instanceId: `${character.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: character.label,
    };

    setAnswers((current) => [...current, newAnswer]);
    setPendingCharacterId(null);

    if (questionIndex + 1 < GUIDED_QUESTIONS.length) {
      setQuestionIndex((current) => current + 1);
    } else {
      setFlowStage('campo');
    }
  };

  // --- Handlers da bancada -> campo (arrastar para dentro do círculo) ---
  const handleBenchPointerDown = (event, item) => {
    if (mapCompleted) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setBenchDrag({
      instanceId: item.instanceId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
    });
  };

  const handleBenchPointerMove = (event) => {
    setBenchDrag((current) =>
      current ? { ...current, currentX: event.clientX, currentY: event.clientY } : current,
    );
  };

  const handleBenchPointerUp = (event, item) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (isPointInsideCircle(event.clientX, event.clientY)) {
      const point = screenPointToCanvas(event.clientX, event.clientY);
      const xPercent = clampPercent((point.x / point.width) * 100, 6, 94);
      const yPercent = clampPercent((point.y / point.height) * 100, 7, 93);

      setFieldCharacters((current) =>
        current.map((character) =>
          character.instanceId === item.instanceId
            ? { ...character, inField: true, x: xPercent, y: yPercent }
            : character,
        ),
      );
      setSelectedFieldId(item.instanceId);
    }

    setBenchDrag(null);
  };

  // --- Handlers de reposicionamento dentro do campo ---
  const handleFieldPointerDown = (event, character) => {
    if (mapCompleted) return;
    event.preventDefault();
    event.stopPropagation();

    const point = screenPointToCanvas(event.clientX, event.clientY);
    const currentX = (character.x / 100) * point.width;
    const currentY = (character.y / 100) * point.height;

    fieldDragMetaRef.current = {
      instanceId: character.instanceId,
      offsetX: point.x - currentX,
      offsetY: point.y - currentY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedFieldId(character.instanceId);
  };

  const handleFieldPointerMove = (event) => {
    const drag = fieldDragMetaRef.current;
    if (!drag) return;

    const point = screenPointToCanvas(event.clientX, event.clientY);
    const nextX = ((point.x - drag.offsetX) / point.width) * 100;
    const nextY = ((point.y - drag.offsetY) / point.height) * 100;

    setFieldCharacters((current) =>
      current.map((character) =>
        character.instanceId === drag.instanceId
          ? {
              ...character,
              x: clampPercent(nextX, 5, 95),
              y: clampPercent(nextY, 6, 94),
            }
          : character,
      ),
    );
  };

  const handleFieldPointerUp = (event) => {
    fieldDragMetaRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const updateFieldName = (name) => {
    setFieldCharacters((current) =>
      current.map((character) =>
        character.instanceId === selectedFieldId ? { ...character, name } : character,
      ),
    );
  };

  const toggleFieldFacing = () => {
    setFieldCharacters((current) =>
      current.map((character) =>
        character.instanceId === selectedFieldId
          ? { ...character, facing: character.facing === 'left' ? 'right' : 'left' }
          : character,
      ),
    );
  };

  // --- Exportação (inalterada em relação ao que já funcionava) ---
  const exportMap = async (filename) => {
    if (!mapRef.current) return;

    try {
      setSelectedFieldId(null);
      setIsExporting(true);
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const canvas = await html2canvas(mapRef.current, {
        backgroundColor: '#fffaf4',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  // --- Conclusão ---
  const handleConfirmComplete = () => {
    setMapCompleted(true);
    setShowCompleteConfirm(false);
    setSelectedFieldId(null);
  };

  // --- Etapa 1: telas do fluxo guiado, antes do círculo ---

  if (flowStage === 'tema') {
    return (
      <ThemeScreen
        theme={theme}
        onChangeTheme={setTheme}
        onContinue={() => setFlowStage('perguntas')}
      />
    );
  }

  if (flowStage === 'perguntas') {
    const currentQuestion = GUIDED_QUESTIONS[questionIndex];
    const pendingCharacter = pendingCharacterId
      ? charactersById.get(pendingCharacterId)
      : null;

    return (
      <GuidedQuestionScreen
        questionIndex={questionIndex}
        totalQuestions={GUIDED_QUESTIONS.length}
        prompt={currentQuestion.prompt}
        role={currentQuestion.role}
        benchCharacters={MIXED_BENCH}
        pendingCharacter={pendingCharacter}
        onSelectCharacter={handleSelectBenchCharacter}
        onConfirm={handleConfirmPending}
        onCancelPending={handleCancelPending}
      />
    );
  }

  // --- flowStage === 'campo': campo sistêmico restrito (Etapa 2) ---

  const bench = fieldCharacters.filter((character) => !character.inField);
  const placedInField = fieldCharacters.filter((character) => character.inField);

  return (
    <div className="systemic-page">
      <aside className="systemic-nav" aria-label="Navegação lateral">
        <Link to="/" className="nav-brand" aria-label="Voltar para o início">
          <span className="brand-mark">C</span>
        </Link>

        <Link to="/" className="systemic-nav-item">
          <Home size={22} />
          <span>Início</span>
        </Link>

        <button type="button" className="systemic-nav-item active">
          <Users size={22} />
          <span>Campo</span>
        </button>
      </aside>

      <main className="systemic-workspace">
        <header className="systemic-topbar">
          <div>
            <Link to="/" className="systemic-logo">
              <span className="systemic-logo-symbol">◈</span>
              <span>
                <strong>Colo &amp; Clareza</strong>
                <small>Mapa Sistêmico Familiar Interativo</small>
              </span>
            </Link>
          </div>

          <p className="systemic-motto">
            Cada lugar revela uma história. <span>♥</span>
          </p>

          <button
            type="button"
            className="soft-button"
            onClick={() => setShowHelp((current) => !current)}
          >
            <HelpCircle size={19} />
            Como usar
          </button>
        </header>

        <div className="systemic-layout systemic-layout--campo">
          <section className="map-column">
            <div className="map-instruction">
              <Users size={22} />
              <div>
                <strong>Campo Sistêmico</strong>
                <span>Arraste os representantes da bancada para posicioná-los no campo</span>
              </div>
            </div>

            <div
              ref={mapRef}
              className={`systemic-map ${isExporting ? 'is-exporting' : ''}`}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget && !mapCompleted) {
                  setSelectedFieldId(null);
                }
              }}
              style={{ '--map-zoom': zoom }}
            >
              <div className="map-watercolor map-watercolor-one" />
              <div className="map-watercolor map-watercolor-two" />
              <div className="map-watercolor map-watercolor-three" />
              <div className="map-sacred-lines" />

              <div className="systemic-canvas">
                {placedInField.map((placedCharacter) => {
                  const character = charactersById.get(placedCharacter.characterId);
                  if (!character) return null;

                  return (
                    <button
                      key={placedCharacter.instanceId}
                      type="button"
                      className={`placed-character field-character ${
                        placedCharacter.facing === 'left' ? 'facing-left' : ''
                      } ${selectedFieldId === placedCharacter.instanceId ? 'selected' : ''}`}
                      style={{
                        left: `${placedCharacter.x}%`,
                        top: `${placedCharacter.y}%`,
                      }}
                      disabled={mapCompleted}
                      onPointerDown={(event) => handleFieldPointerDown(event, placedCharacter)}
                      onPointerMove={handleFieldPointerMove}
                      onPointerUp={handleFieldPointerUp}
                      onPointerCancel={handleFieldPointerUp}
                      aria-label={`${placedCharacter.name} (${placedCharacter.role}). Arraste para mover.`}
                    >
                      <CharacterAvatar character={character} />
                      <span className="placed-character-name">{placedCharacter.name}</span>
                    </button>
                  );
                })}
              </div>

              {placedInField.length === 0 && (
                <div className="empty-map-message">
                  <Users size={28} />
                  <strong>Seu campo está vazio</strong>
                  <span>Arraste os representantes da bancada abaixo para começar.</span>
                </div>
              )}
            </div>

            {!mapCompleted && bench.length > 0 && (
              <div className="field-bench" aria-label="Representantes para posicionar">
                {bench.map((character) => {
                  const isDragging = benchDrag?.instanceId === character.instanceId;
                  const style = isDragging
                    ? {
                        transform: `translate(${benchDrag.currentX - benchDrag.startX}px, ${
                          benchDrag.currentY - benchDrag.startY
                        }px)`,
                        position: 'relative',
                        zIndex: 30,
                      }
                    : undefined;

                  return (
                    <button
                      key={character.instanceId}
                      type="button"
                      className="field-bench__item"
                      style={style}
                      onPointerDown={(event) => handleBenchPointerDown(event, character)}
                      onPointerMove={handleBenchPointerMove}
                      onPointerUp={(event) => handleBenchPointerUp(event, character)}
                      onPointerCancel={() => setBenchDrag(null)}
                    >
                      <CharacterAvatar
                        character={charactersById.get(character.characterId)}
                        compact
                      />
                      <span className="field-bench__nome">{character.name}</span>
                      <span className="field-bench__papel">{character.role}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="map-bottom-bar">
              <p>
                {mapCompleted
                  ? 'Seu mapa está concluído.'
                  : 'Arraste os representantes e posicione onde desejar'}
              </p>

              <div className="zoom-controls" aria-label="Controles de zoom">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((current) => Math.max(0.75, Number((current - 0.1).toFixed(2))))
                  }
                  aria-label="Diminuir zoom"
                >
                  <Minus size={18} />
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((current) => Math.min(1.35, Number((current + 0.1).toFixed(2))))
                  }
                  aria-label="Aumentar zoom"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </section>

          <aside className="actions-panel">
            {!mapCompleted && (
              <div className="action-buttons action-buttons--campo">
                <button
                  type="button"
                  className="action-button green"
                  onClick={() => exportMap('mapa-sistemico.png')}
                >
                  <Download size={23} />
                  <span>Salvar imagem</span>
                </button>

                <button
                  type="button"
                  className="action-button sand"
                  onClick={() => exportMap('mapa-sistemico-exportado.png')}
                >
                  <Download size={23} />
                  <span>Exportar mapa</span>
                </button>

                <button
                  type="button"
                  className="action-button primary"
                  onClick={() => setShowCompleteConfirm(true)}
                >
                  <CheckCircle2 size={23} />
                  <span>Concluir meu mapa</span>
                </button>
              </div>
            )}

            {!mapCompleted && selectedFieldCharacter && (
              <section className="selected-editor">
                <div className="selected-editor-title">
                  <strong>Representante selecionado</strong>
                  <button
                    type="button"
                    onClick={() => setSelectedFieldId(null)}
                    aria-label="Fechar edição"
                  >
                    <X size={17} />
                  </button>
                </div>

                <label htmlFor="selected-field-name">Nome no mapa</label>
                <div className="name-editor">
                  <Pencil size={17} />
                  <input
                    id="selected-field-name"
                    value={selectedFieldCharacter.name}
                    onChange={(event) => updateFieldName(event.target.value)}
                  />
                </div>

                <button type="button" className="flip-selected" onClick={toggleFieldFacing}>
                  <FlipHorizontal size={17} />
                  Virar para {selectedFieldCharacter.facing === 'left' ? 'a direita' : 'a esquerda'}
                </button>
              </section>
            )}

            {!mapCompleted && !selectedFieldCharacter && (
              <div className="map-tip">
                <span>♥</span>
                <p>Você pode arrastar, virar e renomear os representantes no campo.</p>
                <p>Selecione um representante para editar o nome ou espelhá-lo.</p>
              </div>
            )}

            {mapCompleted && (
              <section className="completion-card">
                <h2>Seu mapa está pronto.</h2>
                <p>Você construiu uma representação da forma como percebe essa situação hoje.</p>
                <p>
                  A partir dele será realizada uma análise sistêmica individual, observando a
                  posição dos personagens, as relações construídas e os movimentos presentes no
                  campo.
                </p>
                <p>
                  Você receberá sua devolutiva em até 24 horas pelo WhatsApp ou e-mail informado.
                </p>
                <p className="completion-card__preco">
                  Valor da análise: {ANALYSIS_PRICE_LABEL}
                </p>
                <button
                  type="button"
                  className="botao botao--primario"
                  onClick={() => setShowPaymentNotice(true)}
                >
                  Solicitar análise
                  <ArrowRight size={17} strokeWidth={2} />
                </button>
                {showPaymentNotice && (
                  <p className="completion-card__aviso">
                    O pagamento e o envio para análise serão habilitados na próxima etapa desta
                    implementação.
                  </p>
                )}
              </section>
            )}

            {showHelp && (
              <div className="help-card">
                <button type="button" onClick={() => setShowHelp(false)} aria-label="Fechar ajuda">
                  <X size={17} />
                </button>
                <strong>Como usar</strong>
                <ol>
                  <li>Arraste um representante da bancada para dentro do círculo.</li>
                  <li>Arraste dentro do campo para reposicionar.</li>
                  <li>Selecione para renomear ou virar (espelhar).</li>
                  <li>Quando terminar, clique em "Concluir meu mapa".</li>
                  <li>Depois de concluído, o mapa não pode mais ser alterado.</li>
                </ol>
              </div>
            )}
          </aside>
        </div>
      </main>

      {showCompleteConfirm && (
        <div className="guided-confirmacao-fundo" role="dialog" aria-modal="true">
          <div className="guided-confirmacao">
            <p>
              Depois da confirmação, não será mais possível alterar personagens, nomes, posições
              ou direções.
            </p>
            <div className="guided-confirmacao__botoes">
              <button type="button" className="botao botao--primario" onClick={handleConfirmComplete}>
                Sim, concluir meu mapa
              </button>
              <button
                type="button"
                className="guided-confirmacao__voltar"
                onClick={() => setShowCompleteConfirm(false)}
              >
                Ainda quero revisar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}