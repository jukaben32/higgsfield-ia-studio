// Grok Imagine (xAI). El audio se genera siempre junto con el video y no se puede apagar.
// Docs: https://docs.kie.ai/market/grok-imagine/text-to-video
//       https://docs.kie.ai/market/grok-imagine/image-to-video
//       https://docs.kie.ai/market/grok-imagine/1-5-preview
import { resolutions } from '../helpers.js';

export const GROK_MODELS = [
  {
    id: 'grok-imagine-video',
    name: 'Grok Imagine',
    creator: 'xAI',
    desc: 'Video creativo con audio incluido (los diálogos del texto se hablan). 6 a 15 s.',
    ratios: ['16:9', '9:16', '1:1', '3:2', '2:3'],
    ratioWithImage: false,
    minDuration: 6,
    maxDuration: 15, // la documentación permite hasta 30 s; dejamos un rango seguro para ambos modos
    qualities: resolutions('480p', '720p', '1080p'),
    sound: false,
    image: 'optional',
    maxPrompt: 4000,
    build: (p) => {
      // "mode: normal" = equilibrio entre creatividad y calidad de movimiento
      if (p.imageUrl) {
        return {
          kieModel: 'grok-imagine/image-to-video',
          input: { prompt: p.prompt, image_urls: [p.imageUrl], mode: 'normal', duration: String(p.duration), resolution: p.quality },
        };
      }
      return {
        kieModel: 'grok-imagine/text-to-video',
        input: { prompt: p.prompt, aspect_ratio: p.ratio, mode: 'normal', duration: String(p.duration), resolution: p.quality },
      };
    },
  },
  {
    id: 'grok-imagine-1-5',
    kieModel: 'grok-imagine-video-1-5-preview',
    name: 'Grok Imagine 1.5 (vista previa)',
    creator: 'xAI',
    desc: 'Versión nueva de Grok Imagine, en vista previa. 1 a 15 s, con texto o foto.',
    ratios: ['16:9', '9:16', '1:1', '3:2', '2:3', 'auto'],
    ratioWithImage: true,
    minDuration: 1,
    maxDuration: 15,
    qualities: resolutions('480p', '720p', '1080p'),
    sound: false,
    image: 'optional',
    maxPrompt: 4000,
    build: (p) => {
      const input = { prompt: p.prompt, aspect_ratio: p.ratio, resolution: p.quality, duration: p.duration };
      if (p.imageUrl) input.image_urls = [p.imageUrl];
      return { kieModel: 'grok-imagine-video-1-5-preview', input };
    },
  },
];
