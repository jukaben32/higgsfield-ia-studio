// HappyHorse (Alibaba). Docs: https://docs.kie.ai/market/happyhorse/text-to-video
// y https://docs.kie.ai/market/happyhorse/image-to-video
import { resolutions } from '../helpers.js';

export const HAPPYHORSE_MODELS = [
  {
    id: 'happyhorse',
    name: 'HappyHorse',
    creator: 'Alibaba',
    desc: 'Video rápido en 720p o 1080p, de 3 a 15 s. Funciona con texto o con foto.',
    ratios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    ratioWithImage: false,
    minDuration: 3,
    maxDuration: 15,
    qualities: resolutions('720p', '1080p'),
    sound: false,
    image: 'optional',
    maxPrompt: 5000,
    build: (p) => {
      if (p.imageUrl) {
        return {
          kieModel: 'happyhorse/image-to-video',
          input: { prompt: p.prompt, image_urls: [p.imageUrl], resolution: p.quality, duration: p.duration },
        };
      }
      return {
        kieModel: 'happyhorse/text-to-video',
        input: { prompt: p.prompt, resolution: p.quality, aspect_ratio: p.ratio, duration: p.duration },
      };
    },
  },
];
