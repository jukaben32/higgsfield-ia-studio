// Familia Seedance (ByteDance).
// Docs: https://docs.kie.ai/market/bytedance/seedance-2
//       https://docs.kie.ai/market/bytedance/seedance-2-fast
//       https://docs.kie.ai/market/bytedance/seedance-1-5-pro
import { resolutions } from '../helpers.js';

// Seedance 2.0 y 2.0 Fast comparten el mismo formato de pedido
const buildSeedance2 = (kieModel) => (p) => {
  const input = { prompt: p.prompt, aspect_ratio: p.ratio, duration: p.duration, resolution: p.quality, generate_audio: p.sound };
  if (p.imageUrl) input.first_frame_url = p.imageUrl;
  return { kieModel, input };
};

export const SEEDANCE_MODELS = [
  {
    id: 'seedance-2-fast',
    kieModel: 'bytedance/seedance-2-fast',
    name: 'Seedance 2.0 Fast',
    creator: 'ByteDance',
    desc: 'Rápido y económico, con mucha acción y cámara dinámica. Hasta 15 s.',
    ratios: ['16:9', '9:16', '1:1'],
    minDuration: 4,
    maxDuration: 15,
    qualities: [
      { id: '480p', label: 'Borrador 480p' },
      { id: '720p', label: 'Final 720p' },
    ],
    sound: true,
    image: 'optional',
    maxPrompt: 2500,
    build: buildSeedance2('bytedance/seedance-2-fast'),
  },
  {
    id: 'seedance-2',
    kieModel: 'bytedance/seedance-2',
    name: 'Seedance 2.0',
    creator: 'ByteDance',
    desc: 'Máxima calidad de Seedance, hasta 4K. Hasta 15 s con sonido sincronizado.',
    ratios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
    minDuration: 4,
    maxDuration: 15,
    qualities: [
      { id: '480p', label: 'Borrador 480p' },
      { id: '720p', label: '720p' },
      { id: '1080p', label: 'Pro 1080p' },
      { id: '4k', label: '4K (más caro)' },
    ],
    sound: true,
    image: 'optional',
    maxPrompt: 5000,
    build: buildSeedance2('bytedance/seedance-2'),
  },
  {
    id: 'seedance-1-5-pro',
    kieModel: 'bytedance/seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    creator: 'ByteDance',
    desc: 'Generación anterior, estable y con buen manejo de cámara. 4 a 12 s.',
    ratios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
    minDuration: 4,
    maxDuration: 12,
    qualities: resolutions('480p', '720p', '1080p'),
    sound: true,
    image: 'optional',
    maxPrompt: 5000,
    build: (p) => {
      const input = {
        prompt: p.prompt,
        aspect_ratio: p.ratio,
        resolution: p.quality,
        duration: p.duration,
        fixed_lens: false,
        generate_audio: p.sound,
      };
      if (p.imageUrl) input.input_urls = [p.imageUrl];
      return { kieModel: 'bytedance/seedance-1.5-pro', input };
    },
  },
];
