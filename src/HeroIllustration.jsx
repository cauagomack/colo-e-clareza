// Ilustração provisória (linha orgânica) representando acolhimento maternal.
// Substitua por uma foto real quando disponível: troque este componente
// pela tag <img src="/sua-imagem.jpg" alt="..." /> em Hero.jsx.
export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustração de uma mãe segurando seu bebê no colo, em traço suave"
    >
      <ellipse cx="210" cy="240" rx="190" ry="200" fill="var(--blush-soft)" />
      <path
        d="M210 60c58 0 104 52 104 122 0 52-24 92-58 116 30 10 66 34 82 78 8 22 12 46 12 62H70c0-16 4-40 12-62 16-44 52-68 82-78-34-24-58-64-58-116C106 112 152 60 210 60Z"
        fill="var(--terracota-light)"
        opacity="0.9"
      />
      <path
        d="M210 90c-46 0-82 42-82 96 0 46 24 82 58 98l6 3-5 4c-30 16-64 40-78 82-6 18-9 36-10 50h222c-1-14-4-32-10-50-14-42-48-66-78-82l-5-4 6-3c34-16 58-52 58-98 0-54-36-96-82-96Z"
        fill="var(--terracota)"
      />
      <circle cx="182" cy="112" r="7" fill="var(--marrom)" opacity="0.55" />
      <circle cx="238" cy="112" r="7" fill="var(--marrom)" opacity="0.55" />
      <path
        d="M186 138c8 8 22 8 30 0"
        stroke="var(--marrom)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <ellipse cx="222" cy="330" rx="46" ry="40" fill="var(--cream)" />
      <circle cx="222" cy="316" r="20" fill="var(--rosa)" />
      <path
        d="M120 420c10-60 46-96 90-96s80 36 90 96"
        stroke="var(--paper)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}