// Familia Google: Nano Banana 2, Nano Banana Pro e Imagen 4.
// Docs: https://docs.kie.ai/market/google/nanobanana2
//       https://docs.kie.ai/market/google/pro-image-to-image
//       https://docs.kie.ai/market/google/imagen4
import { resolutions } from '../helpers.js';

// Nano Banana (2 y Pro) usan el mismo formato: referencias en "image_input"
const buildNanoBanana = (kieModel) => (p) => {
  const input = { prompt: p.prompt, aspect_ratio: p.ratio, resolution: p.quality, output_format: 'png' };
  if (p.refs.length) input.image_input = p.refs;
  return { kieModel, input };
};

export const GOOGLE_IMAGE_MODELS = [
  {
    id: 'nano-banana-2',
    kieModel: 'nano-banana-2',
    name: 'Nano Banana 2',
    creator: 'Google',
    desc: 'Imágenes de alta calidad con buen texto dentro de la imagen. Acepta foto de referencia.',
    ratios: ['1:1', '16:9', '9:16', '4:5'],
    qualities: resolutions('1K', '2K'),
    maxRefs: 4,
    maxPrompt: 2500,
    build: buildNanoBanana('nano-banana-2'),
  },
  {
    id: 'nano-banana-pro',
    kieModel: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    creator: 'Google',
    desc: 'La versión más fiel y detallada de Nano Banana, hasta 4K. Acepta hasta 8 referencias.',
    ratios: ['1:1', '16:9', '9:16', '4:5', '5:4', '3:2', '2:3', '4:3', '3:4', '21:9'],
    qualities: resolutions('1K', '2K', '4K'),
    maxRefs: 4,
    maxPrompt: 5000,
    build: buildNanoBanana('nano-banana-pro'),
  },
  {
    id: 'imagen-4',
    kieModel: 'google/imagen4',
    name: 'Imagen 4',
    creator: 'Google',
    desc: 'Imágenes fotorrealistas de Google a partir de texto. No usa fotos de referencia.',
    ratios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    qualities: [{ id: 'standard', label: 'Estándar' }],
    maxRefs: 0,
    maxPrompt: 5000,
    build: (p) => ({ kieModel: 'google/imagen4', input: { prompt: p.prompt, aspect_ratio: p.ratio } }),
  },
];
