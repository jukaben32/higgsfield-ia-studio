// GPT Image 2 (OpenAI). Con fotos de referencia usa otro endpoint de KIE.
// Docs: https://docs.kie.ai/market/gpt/gpt-image-2-text-to-image
//       https://docs.kie.ai/market/gpt/gpt-image-2-image-to-image
import { resolutions } from '../helpers.js';

export const OPENAI_IMAGE_MODELS = [
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    creator: 'OpenAI',
    desc: 'Entiende instrucciones largas y escribe texto legible. Hasta 4K. Acepta referencias.',
    ratios: ['1:1', '3:2', '2:3', '4:3', '3:4', '5:4', '4:5', '16:9', '9:16', '21:9'],
    qualities: resolutions('1K', '2K', '4K'),
    maxRefs: 4,
    maxPrompt: 5000,
    build: (p) => {
      if (p.refs.length) {
        return {
          kieModel: 'gpt-image-2-image-to-image',
          input: { prompt: p.prompt, input_urls: p.refs, aspect_ratio: p.ratio, resolution: p.quality },
        };
      }
      return {
        kieModel: 'gpt-image-2-text-to-image',
        input: { prompt: p.prompt, aspect_ratio: p.ratio, resolution: p.quality },
      };
    },
  },
];
