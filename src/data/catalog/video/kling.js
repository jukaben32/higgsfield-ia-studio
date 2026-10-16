// Familia Kling (Kuaishou). Docs: https://docs.kie.ai/market/kling/kling-3-0
// y https://docs.kie.ai/market/kling/v25-turbo-text-to-video-pro
import { resolutions } from '../helpers.js';

export const KLING_MODELS = [
  {
    id: 'kling-3',
    kieModel: 'kling-3.0/video',
    name: 'Kling 3.0',
    creator: 'Kuaishou',
    desc: 'Personas y movimientos muy realistas. Hasta 15 s. Puede generar sonido.',
    ratios: ['16:9', '9:16', '1:1'],
    ratioWithImage: false, // con foto, Kling usa el formato de la foto
    minDuration: 3,
    maxDuration: 15,
    qualities: [
      { id: 'std', label: 'Estándar 720p' },
      { id: 'pro', label: 'Pro 1080p' },
    ],
    sound: true,
    image: 'optional',
    maxPrompt: 2500,
    build: (p) => {
      const input = { prompt: p.prompt, sound: p.sound, duration: String(p.duration), mode: p.quality, multi_shots: false };
      if (p.imageUrl) input.image_urls = [p.imageUrl];
      else input.aspect_ratio = p.ratio;
      return { kieModel: 'kling-3.0/video', input };
    },
  },
  {
    id: 'kling-2-5-turbo',
    name: 'Kling 2.5 Turbo Pro',
    creator: 'Kuaishou',
    desc: 'Versión anterior, rápida y estable. 5 o 10 s, sin sonido.',
    ratios: ['16:9', '9:16', '1:1'],
    ratioWithImage: false,
    durations: [5, 10],
    qualities: resolutions('Pro'),
    sound: false,
    image: 'optional',
    maxPrompt: 2500,
    build: (p) => {
      if (p.imageUrl) {
        return {
          kieModel: 'kling/v2-5-turbo-image-to-video-pro',
          input: { prompt: p.prompt, image_url: p.imageUrl, duration: String(p.duration) },
        };
      }
      return {
        kieModel: 'kling/v2-5-turbo-text-to-video-pro',
        input: { prompt: p.prompt, duration: String(p.duration), aspect_ratio: p.ratio },
      };
    },
  },
];
