// Música con Suno. Se envía por el formato estándar de KIE con model = "ai-music-api/generate";
// la versión de Suno (V6...) va dentro de input.model.
// Docs: https://docs.kie.ai/suno-api/generate-music
// Las versiones V4 a V5.5 figuran como descontinuadas, por eso solo ofrecemos V6.

export const MUSIC_KIE_MODEL = 'ai-music-api/generate';

export const MUSIC_MODELS = [
  { id: 'V6', label: 'Suno V6', desc: 'Voces más naturales y más detalle. La mejor opción general.' },
  { id: 'V6_MINI', label: 'Suno V6 Mini', desc: 'Ligero y rápido, equilibrio entre calidad y velocidad.' },
  { id: 'V6_WILD', label: 'Suno V6 Wild', desc: 'Más atrevido y experimental.' },
];

// Límites de la documentación (V6)
export const MUSIC_LIMITS = {
  promptMax: 3000, // idea general (modo sencillo)
  lyricsMax: 5000, // letra completa (modo personalizado)
  styleMax: 1000,
  titleMax: 80,
  durationMin: 10, // solo en modo personalizado
  durationMax: 360,
};

export const MUSIC_VOCALS = [
  { id: '', label: 'Automática' },
  { id: 'f', label: 'Voz de mujer' },
  { id: 'm', label: 'Voz de hombre' },
];
