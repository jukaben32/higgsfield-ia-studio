// Hailuo 2.3 (MiniMax). Solo anima una foto (imagen → video).
// Docs: https://docs.kie.ai/market/hailuo/2-3-image-to-video-pro
//       https://docs.kie.ai/market/hailuo/2-3-image-to-video-standard

// Los dos comparten reglas: el video de 10 s no existe en 1080P
const validateHailuo = (p) => (
  p.quality === '1080P' && Number(p.duration) === 10
    ? 'Hailuo no permite 10 segundos en 1080P. Elige 6 segundos o la calidad 768P.'
    : null
);

const buildHailuo = (kieModel) => (p) => ({
  kieModel,
  input: { prompt: p.prompt, image_url: p.imageUrl, duration: String(p.duration), resolution: p.quality },
});

const common = {
  creator: 'MiniMax',
  ratios: [], // el formato lo decide la foto
  ratioWithImage: false,
  durations: [6, 10],
  qualities: [
    { id: '768P', label: '768P' },
    { id: '1080P', label: '1080P (solo 6 s)' },
  ],
  sound: false,
  image: 'required',
  maxPrompt: 5000,
  validate: validateHailuo,
};

export const HAILUO_MODELS = [
  {
    ...common,
    id: 'hailuo-2-3-pro',
    name: 'Hailuo 2.3 Pro',
    desc: 'Anima una foto con movimiento fluido y detalle alto. Requiere imagen.',
    build: buildHailuo('hailuo/2-3-image-to-video-pro'),
  },
  {
    ...common,
    id: 'hailuo-2-3-standard',
    name: 'Hailuo 2.3 Standard',
    desc: 'Versión más económica de Hailuo 2.3. Requiere imagen.',
    build: buildHailuo('hailuo/2-3-image-to-video-standard'),
  },
];
