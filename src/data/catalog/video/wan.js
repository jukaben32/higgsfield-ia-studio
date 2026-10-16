// Wan 2.7 (Alibaba). Docs: https://docs.kie.ai/market/wan/2-7-text-to-video
// y https://docs.kie.ai/market/wan/2-7-image-to-video
import { resolutions } from '../helpers.js';

export const WAN_MODELS = [
  {
    id: 'wan-2-7',
    name: 'Wan 2.7',
    creator: 'Alibaba',
    desc: 'Muy bueno con movimiento natural y escenas largas. Desde 2 hasta 15 s.',
    ratios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    ratioWithImage: false,
    minDuration: 2,
    maxDuration: 15,
    qualities: resolutions('720p', '1080p'),
    sound: false,
    image: 'optional',
    maxPrompt: 5000,
    build: (p) => {
      if (p.imageUrl) {
        return {
          kieModel: 'wan/2-7-image-to-video',
          input: { prompt: p.prompt, first_frame_url: p.imageUrl, resolution: p.quality, duration: p.duration, prompt_extend: true },
        };
      }
      return {
        kieModel: 'wan/2-7-text-to-video',
        input: { prompt: p.prompt, resolution: p.quality, ratio: p.ratio, duration: p.duration, prompt_extend: true },
      };
    },
  },
];
