// Seedream (ByteDance). Solo texto → imagen en este catálogo.
// Docs: https://docs.kie.ai/market/seedream/5-lite-text-to-image
//       https://docs.kie.ai/market/seedream/4-5-text-to-image

const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'];

export const SEEDREAM_MODELS = [
  {
    id: 'seedream-5-lite',
    kieModel: 'seedream/5-lite-text-to-image',
    name: 'Seedream 5 Lite',
    creator: 'ByteDance',
    desc: 'Imágenes nítidas y de estilo muy cuidado, con tres niveles de calidad.',
    ratios: RATIOS,
    qualities: [
      { id: 'basic', label: 'Básica' },
      { id: 'high', label: 'Alta' },
      { id: 'ultra', label: 'Ultra' },
    ],
    maxRefs: 0,
    maxPrompt: 2900,
    build: (p) => ({
      kieModel: 'seedream/5-lite-text-to-image',
      input: { prompt: p.prompt, aspect_ratio: p.ratio, quality: p.quality, output_format: 'png' },
    }),
  },
  {
    id: 'seedream-4-5',
    kieModel: 'seedream/4.5-text-to-image',
    name: 'Seedream 4.5',
    creator: 'ByteDance',
    desc: 'Generación anterior de Seedream, muy buena para retratos y producto.',
    ratios: RATIOS,
    qualities: [
      { id: 'basic', label: 'Básica' },
      { id: 'high', label: 'Alta' },
    ],
    maxRefs: 0,
    maxPrompt: 3000,
    build: (p) => ({
      kieModel: 'seedream/4.5-text-to-image',
      input: { prompt: p.prompt, aspect_ratio: p.ratio, quality: p.quality },
    }),
  },
];
