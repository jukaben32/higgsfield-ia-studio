// Veo 3.1 (Google). Se envía por el formato estándar de KIE con model = "veo-3-1";
// el nivel (Fast / Lite / Quality) va dentro de input.model.
// Docs: https://docs.kie.ai/veo3-api/generate-veo-3-video
import { resolutions } from '../helpers.js';

// Los tres niveles comparten todo menos el nombre del nivel y su descripción
const veoTier = (tier, id, name, desc) => ({
  id,
  name,
  creator: 'Google',
  desc,
  ratios: ['16:9', '9:16'],
  ratioWithImage: true,
  durations: [4, 6, 8],
  qualities: resolutions('720p', '1080p', '4k'),
  sound: false, // Veo genera el audio por su cuenta
  image: 'optional',
  maxPrompt: 5000,
  build: (p) => {
    const input = { prompt: p.prompt, model: tier, aspect_ratio: p.ratio, resolution: p.quality, duration: p.duration };
    if (p.imageUrl) {
      // Con una sola foto, Veo la usa como primer cuadro del video
      input.image_urls = [p.imageUrl];
      input.generation_type = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
    } else {
      input.generation_type = 'TEXT_2_VIDEO';
    }
    return { kieModel: 'veo-3-1', input };
  },
});

export const VEO_MODELS = [
  veoTier('veo3_fast', 'veo-3-1-fast', 'Veo 3.1 Fast', 'Video con audio de Google, rápido y económico. 4, 6 u 8 s.'),
  veoTier('veo3_lite', 'veo-3-1-lite', 'Veo 3.1 Lite', 'La opción más barata de Veo 3.1, ideal para probar ideas.'),
  veoTier('veo3', 'veo-3-1-quality', 'Veo 3.1 Quality', 'Máxima calidad de Veo 3.1 (más caro). Hasta 4K.'),
];
