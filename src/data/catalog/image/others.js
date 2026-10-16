// Otros modelos de imagen: Flux 2, Ideogram V3, Qwen 2, Grok Imagine, Z-Image y Wan 2.7.
// Docs: https://docs.kie.ai/market/flux2/pro-text-to-image
//       https://docs.kie.ai/market/ideogram/v3-text-to-image
//       https://docs.kie.ai/market/qwen2/text-to-image
//       https://docs.kie.ai/market/grok-imagine/text-to-image
//       https://docs.kie.ai/market/z-image/z-image
//       https://docs.kie.ai/market/wan/2-7-image
import { resolutions } from '../helpers.js';

// Ideogram no usa "aspect_ratio": pide un tamaño con nombre. Traducimos cada formato.
const IDEOGRAM_SIZES = {
  '1:1': 'square_hd',
  '4:3': 'landscape_4_3',
  '16:9': 'landscape_16_9',
  '3:4': 'portrait_4_3',
  '9:16': 'portrait_16_9',
};

export const OTHER_IMAGE_MODELS = [
  {
    id: 'flux-2-pro',
    kieModel: 'flux-2/pro-text-to-image',
    name: 'Flux 2 Pro',
    creator: 'Black Forest Labs',
    desc: 'Fotorrealismo y detalle fino. Muy bueno para retratos y producto.',
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3'],
    qualities: resolutions('1K', '2K'),
    maxRefs: 0,
    maxPrompt: 5000,
    build: (p) => ({
      kieModel: 'flux-2/pro-text-to-image',
      input: { prompt: p.prompt, aspect_ratio: p.ratio, resolution: p.quality },
    }),
  },
  {
    id: 'ideogram-v3',
    kieModel: 'ideogram/v3-text-to-image',
    name: 'Ideogram V3',
    creator: 'Ideogram',
    desc: 'El mejor para logos, carteles y texto dentro de la imagen.',
    ratios: Object.keys(IDEOGRAM_SIZES),
    qualities: [
      { id: 'TURBO', label: 'Rápida' },
      { id: 'BALANCED', label: 'Equilibrada' },
      { id: 'QUALITY', label: 'Máxima calidad' },
    ],
    maxRefs: 0,
    maxPrompt: 5000,
    build: (p) => ({
      kieModel: 'ideogram/v3-text-to-image',
      input: { prompt: p.prompt, rendering_speed: p.quality, image_size: IDEOGRAM_SIZES[p.ratio], expand_prompt: true },
    }),
  },
  {
    id: 'qwen-2',
    kieModel: 'qwen2/text-to-image',
    name: 'Qwen 2',
    creator: 'Alibaba',
    desc: 'Texto en varios idiomas (incluido chino y español) y composiciones limpias.',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    qualities: [{ id: 'standard', label: 'Estándar' }],
    maxRefs: 0,
    maxPrompt: 5000,
    build: (p) => ({
      kieModel: 'qwen2/text-to-image',
      input: { prompt: p.prompt, image_size: p.ratio, output_format: 'png' },
    }),
  },
  {
    id: 'grok-imagine-image',
    kieModel: 'grok-imagine/text-to-image',
    name: 'Grok Imagine',
    creator: 'xAI',
    desc: 'Imágenes creativas y expresivas de xAI.',
    ratios: ['1:1', '16:9', '9:16', '3:2', '2:3'],
    qualities: [{ id: 'standard', label: 'Estándar' }],
    maxRefs: 0,
    maxPrompt: 4000,
    build: (p) => ({
      kieModel: 'grok-imagine/text-to-image',
      input: { prompt: p.prompt, aspect_ratio: p.ratio },
    }),
  },
  {
    id: 'z-image',
    kieModel: 'z-image',
    name: 'Z-Image',
    creator: 'Alibaba',
    desc: 'Muy rápido y barato, bueno para borradores. Descripción de hasta 1000 caracteres.',
    ratios: ['1:1', '4:3', '3:4', '16:9', '9:16'],
    qualities: [{ id: 'standard', label: 'Estándar' }],
    maxRefs: 0,
    maxPrompt: 1000,
    build: (p) => ({
      kieModel: 'z-image',
      input: { prompt: p.prompt, aspect_ratio: p.ratio },
    }),
  },
  {
    id: 'wan-2-7-image',
    kieModel: 'wan/2-7-image',
    name: 'Wan 2.7 Imagen',
    creator: 'Alibaba',
    desc: 'Imágenes con formatos muy anchos o muy altos. Acepta referencias.',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'],
    qualities: resolutions('1K', '2K'),
    maxRefs: 4,
    maxPrompt: 5000,
    build: (p) => {
      const input = { prompt: p.prompt, aspect_ratio: p.ratio, resolution: p.quality };
      if (p.refs.length) input.input_urls = p.refs;
      return { kieModel: 'wan/2-7-image', input };
    },
  },
];
