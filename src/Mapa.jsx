import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import {
  Download,
  HelpCircle,
  Home,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import SendForAnalysisModal from './SendForAnalysisModal.jsx';
import './Mapa.css';

const STORAGE_KEY = 'colo-clareza-mapa-sistemico-v1';

const CATEGORY_LABELS = {
  babies: 'Bebês',
  children: 'Crianças',
  teens: 'Adolescentes',
  adults: 'Adultos',
  symbols: 'Representantes simbólicos',
};

const CATEGORY_TABS = [
  { id: 'babies', label: 'Bebês' },
  { id: 'children', label: 'Crianças' },
  { id: 'teens', label: 'Adolescentes' },
  { id: 'adults', label: 'Adultos' },
  { id: 'symbols', label: 'Simbólicos' },
];

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

function CharacterCard({ character, onAdd }) {
  const handleDragStart = (event) => {
    event.dataTransfer.setData('application/x-systemic-character', character.id);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <button
      type="button"
      className="library-character"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onAdd(character.id)}
      title="Clique ou arraste para adicionar ao mapa"
    >
      <CharacterAvatar character={character} compact />
      <span>{character.label}</span>
    </button>
  );
}

export default function Mapa() {
  const mapRef = useRef(null);
  const dragMetaRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('babies');
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  const [customCharacters, setCustomCharacters] = useState([]);
  const [placedCharacters, setPlacedCharacters] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.placedCharacters) setPlacedCharacters(saved.placedCharacters);
      if (saved?.customCharacters) setCustomCharacters(saved.customCharacters);
      if (saved?.zoom) setZoom(saved.zoom);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ placedCharacters, customCharacters, zoom }),
    );
  }, [placedCharacters, customCharacters, zoom]);

  const allCharacters = useMemo(
    () => [...BASE_CHARACTERS, ...customCharacters],
    [customCharacters],
  );

  const charactersById = useMemo(
    () => new Map(allCharacters.map((character) => [character.id, character])),
    [allCharacters],
  );

  const visibleCharacters = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return allCharacters.filter((character) => {
      const categoryMatches = character.category === activeCategory;
      const searchMatches =
        !normalizedSearch ||
        character.label.toLocaleLowerCase('pt-BR').includes(normalizedSearch);

      return categoryMatches && searchMatches;
    });
  }, [allCharacters, activeCategory, search]);

  const selectedCharacter = placedCharacters.find(
    (character) => character.instanceId === selectedId,
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

  const addCharacter = (characterId, x = null, y = null) => {
    const character = charactersById.get(characterId);
    if (!character) return;

    const spread = placedCharacters.length % 7;
    const defaultX = 50 + ((spread % 3) - 1) * 10;
    const defaultY = 50 + (Math.floor(spread / 3) - 1) * 10;

    const newCharacter = {
      instanceId: `${character.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      characterId: character.id,
      name: character.label,
      x: Math.max(6, Math.min(94, x ?? defaultX)),
      y: Math.max(7, Math.min(93, y ?? defaultY)),
    };

    setPlacedCharacters((current) => [...current, newCharacter]);
    setSelectedId(newCharacter.instanceId);
  };

  const handleMapDrop = (event) => {
    event.preventDefault();
    const characterId = event.dataTransfer.getData(
      'application/x-systemic-character',
    );
    if (!characterId) return;

    const point = screenPointToCanvas(event.clientX, event.clientY);
    addCharacter(
      characterId,
      (point.x / point.width) * 100,
      (point.y / point.height) * 100,
    );
  };

  const handlePlacedPointerDown = (event, placedCharacter) => {
    event.preventDefault();
    event.stopPropagation();

    const point = screenPointToCanvas(event.clientX, event.clientY);
    const currentX = (placedCharacter.x / 100) * point.width;
    const currentY = (placedCharacter.y / 100) * point.height;

    dragMetaRef.current = {
      instanceId: placedCharacter.instanceId,
      offsetX: point.x - currentX,
      offsetY: point.y - currentY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(placedCharacter.instanceId);
  };

  const handlePlacedPointerMove = (event) => {
    const dragMeta = dragMetaRef.current;
    if (!dragMeta) return;

    const point = screenPointToCanvas(event.clientX, event.clientY);
    const nextX =
      ((point.x - dragMeta.offsetX) / point.width) * 100;
    const nextY =
      ((point.y - dragMeta.offsetY) / point.height) * 100;

    setPlacedCharacters((current) =>
      current.map((character) =>
        character.instanceId === dragMeta.instanceId
          ? {
              ...character,
              x: Math.max(5, Math.min(95, nextX)),
              y: Math.max(6, Math.min(94, nextY)),
            }
          : character,
      ),
    );
  };

  const handlePlacedPointerUp = (event) => {
    dragMetaRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const updateSelectedName = (name) => {
    setPlacedCharacters((current) =>
      current.map((character) =>
        character.instanceId === selectedId
          ? { ...character, name }
          : character,
      ),
    );
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setPlacedCharacters((current) =>
      current.filter((character) => character.instanceId !== selectedId),
    );
    setSelectedId(null);
  };

  const clearMap = () => {
    if (
      placedCharacters.length > 0 &&
      !window.confirm('Deseja remover todos os personagens do mapa?')
    ) {
      return;
    }
    setPlacedCharacters([]);
    setSelectedId(null);
  };

  const restartMap = () => {
    if (
      !window.confirm(
        'Deseja reiniciar o mapa e apagar também os representantes personalizados?',
      )
    ) {
      return;
    }

    setPlacedCharacters([]);
    setCustomCharacters([]);
    setSelectedId(null);
    setSearch('');
    setActiveCategory('babies');
    setZoom(1);
    localStorage.removeItem(STORAGE_KEY);
  };

  const addCustomSymbol = () => {
    const cleanName = customName.trim();
    if (!cleanName) return;

    const customCharacter = {
      id: `custom-symbol-${Date.now()}`,
      label: cleanName,
      category: 'symbols',
      kind: 'symbol',
      symbol: '✦',
      symbolColor: '#a85f4c',
      background: '#f3dfd6',
    };

    setCustomCharacters((current) => [...current, customCharacter]);
    setCustomName('');
    setActiveCategory('symbols');
  };

  const exportMap = async (filename) => {
    if (!mapRef.current) return;

    try {
      setSelectedId(null);
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

  // Gera a mesma captura em PNG usada no download, mas devolve o data URL
  // em vez de disparar o download — usado pelo modal de envio para análise.
  const captureMapImageDataUrl = async () => {
    if (!mapRef.current) return null;

    try {
      setSelectedId(null);
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

      return canvas.toDataURL('image/png');
    } finally {
      setIsExporting(false);
    }
  };

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
          <span>Biblioteca</span>
        </button>

        <button type="button" className="systemic-nav-item disabled">
          <Pencil size={21} />
          <span>Anotações</span>
          <small>Em breve</small>
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

        <div className="systemic-layout">
          <section className="library-panel" aria-label="Biblioteca de personagens">
            <div className="panel-title-row">
              <h1>Biblioteca de Personagens</h1>
              <span aria-hidden="true">♡</span>
            </div>

            <label className="library-search">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar personagem..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </label>

            <div className="category-tabs" role="tablist">
              {CATEGORY_TABS.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={activeCategory === category.id ? 'active' : ''}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="library-category-heading">
              <h2>{CATEGORY_LABELS[activeCategory]}</h2>
              <small>Clique ou arraste</small>
            </div>

            <div className="character-grid">
              {visibleCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onAdd={addCharacter}
                />
              ))}

              {visibleCharacters.length === 0 && (
                <p className="empty-library">
                  Nenhum personagem encontrado nesta categoria.
                </p>
              )}
            </div>

            {activeCategory === 'symbols' && (
              <div className="custom-symbol-box">
                <label htmlFor="custom-symbol-name">
                  Adicionar representante simbólico
                </label>
                <div>
                  <input
                    id="custom-symbol-name"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') addCustomSymbol();
                    }}
                    placeholder="Ex.: escola, distância..."
                  />
                  <button
                    type="button"
                    onClick={addCustomSymbol}
                    aria-label="Adicionar representante"
                  >
                    <Plus size={19} />
                  </button>
                </div>
              </div>
            )}

            <p className="library-quote">
              Aquilo que não é visto continua buscando um lugar para existir.
              <span>♥</span>
            </p>
          </section>

          <section className="map-column">
            <div className="map-instruction">
              <Users size={22} />
              <div>
                <strong>Espaço Sistêmico</strong>
                <span>Arraste os personagens para posicioná-los no mapa</span>
              </div>
            </div>

            <div
              ref={mapRef}
              className={`systemic-map ${isExporting ? 'is-exporting' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleMapDrop}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) setSelectedId(null);
              }}
              style={{ '--map-zoom': zoom }}
            >
              <div className="map-watercolor map-watercolor-one" />
              <div className="map-watercolor map-watercolor-two" />
              <div className="map-watercolor map-watercolor-three" />
              <div className="map-sacred-lines" />

              <div className="systemic-canvas">
                {placedCharacters.map((placedCharacter) => {
                  const character = charactersById.get(
                    placedCharacter.characterId,
                  );
                  if (!character) return null;

                  return (
                    <button
                      key={placedCharacter.instanceId}
                      type="button"
                      className={`placed-character ${
                        selectedId === placedCharacter.instanceId
                          ? 'selected'
                          : ''
                      }`}
                      style={{
                        left: `${placedCharacter.x}%`,
                        top: `${placedCharacter.y}%`,
                      }}
                      onPointerDown={(event) =>
                        handlePlacedPointerDown(event, placedCharacter)
                      }
                      onPointerMove={handlePlacedPointerMove}
                      onPointerUp={handlePlacedPointerUp}
                      onPointerCancel={handlePlacedPointerUp}
                      onDoubleClick={() =>
                        setSelectedId(placedCharacter.instanceId)
                      }
                      aria-label={`${placedCharacter.name}. Arraste para mover.`}
                    >
                      <CharacterAvatar character={character} />
                      <span className="placed-character-name">
                        {placedCharacter.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {placedCharacters.length === 0 && (
                <div className="empty-map-message">
                  <Users size={28} />
                  <strong>Seu mapa está vazio</strong>
                  <span>
                    Clique em um personagem ou arraste-o da biblioteca.
                  </span>
                </div>
              )}
            </div>

            <div className="map-bottom-bar">
              <p>Arraste os personagens e posicione onde desejar</p>

              <div className="zoom-controls" aria-label="Controles de zoom">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((current) =>
                      Math.max(0.75, Number((current - 0.1).toFixed(2))),
                    )
                  }
                  aria-label="Diminuir zoom"
                >
                  <Minus size={18} />
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((current) =>
                      Math.min(1.35, Number((current + 0.1).toFixed(2))),
                    )
                  }
                  aria-label="Aumentar zoom"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </section>

          <aside className="actions-panel">
            <div className="action-buttons">
              <button type="button" className="action-button danger" onClick={clearMap}>
                <Trash2 size={23} />
                <span>Limpar mapa</span>
              </button>

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

              <button type="button" className="action-button lilac" onClick={restartMap}>
                <RotateCcw size={23} />
                <span>Reiniciar mapa</span>
              </button>

              <button
                type="button"
                className="action-button primary"
                onClick={() => setSendModalOpen(true)}
              >
                <Send size={23} />
                <span>Enviar para análise</span>
              </button>
            </div>

            {selectedCharacter ? (
              <section className="selected-editor">
                <div className="selected-editor-title">
                  <strong>Personagem selecionado</strong>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Fechar edição"
                  >
                    <X size={17} />
                  </button>
                </div>

                <label htmlFor="selected-character-name">Nome no mapa</label>
                <div className="name-editor">
                  <Pencil size={17} />
                  <input
                    id="selected-character-name"
                    value={selectedCharacter.name}
                    onChange={(event) =>
                      updateSelectedName(event.target.value)
                    }
                  />
                </div>

                <button
                  type="button"
                  className="delete-selected"
                  onClick={deleteSelected}
                >
                  <Trash2 size={17} />
                  Excluir personagem
                </button>
              </section>
            ) : (
              <div className="map-tip">
                <span>♥</span>
                <p>
                  Você pode mover, reposicionar e excluir personagens no mapa.
                </p>
                <p>
                  Selecione um personagem para editar o nome ou removê-lo.
                </p>
              </div>
            )}

            {showHelp && (
              <div className="help-card">
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  aria-label="Fechar ajuda"
                >
                  <X size={17} />
                </button>
                <strong>Como usar</strong>
                <ol>
                  <li>Escolha uma categoria.</li>
                  <li>Clique ou arraste um personagem.</li>
                  <li>Arraste dentro do círculo para mover.</li>
                  <li>Selecione para renomear ou excluir.</li>
                  <li>Baixe o resultado como imagem PNG.</li>
                </ol>
              </div>
            )}
          </aside>
        </div>
      </main>

      <SendForAnalysisModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onCaptureImage={captureMapImageDataUrl}
      />
    </div>
  );
}