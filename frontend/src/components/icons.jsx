// Conjunto de ícones em SVG puro (sem dependência externa), no estilo outline
// usado nas telas de referência: sidebar, botões de ação e coluna de edição.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconUser({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

export function IconIdCard({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <circle cx="8.5" cy="12" r="2" />
      <path d="M13.2 10h4.3M13.2 14h4.3" />
    </svg>
  );
}

export function IconBuilding({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <rect x="4.5" y="3" width="15" height="18" rx="1.2" />
      <path d="M9 7.5h1M14 7.5h1M9 11.5h1M14 11.5h1M9 15.5h1M14 15.5h1" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

export function IconEdit({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconDownload({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3v12" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function IconPlus({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconClose({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconCheck({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconSave({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-7H7v7" />
      <path d="M7 3v5h7" />
    </svg>
  );
}

export function IconInfo({ size = 14, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8.2" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconChevronDown({ size = 14, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}