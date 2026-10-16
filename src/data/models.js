// Datos del estudio que leen tanto la página (para mostrar opciones) como el
// servidor (para validar lo que llega antes de gastar créditos).
// Este archivo no tiene claves.
//
// Los modelos de video e imagen viven en ./catalog (un archivo por familia).
// Aquí quedan las herramientas, los efectos y las plantillas, y se re-exporta
// el catálogo para que el resto de la app siga importando desde un solo lugar.
// Documentación de cada modelo: https://docs.kie.ai/market/...

export { VIDEO_MODELS, IMAGE_MODELS, findModel } from './catalog/index.js';
export {
  VOICE_MODEL, VOICE_TURBO_MODEL, DIALOGUE_MODEL, ISOLATION_MODEL, VOICES,
} from './catalog/audio/voices.js';
export { MUSIC_KIE_MODEL, MUSIC_MODELS, MUSIC_LIMITS, MUSIC_VOCALS } from './catalog/audio/music.js';

// Avatar que habla: una foto + un audio = video con labios sincronizados
export const AVATAR_MODEL = {
  id: 'kling-avatar',
  kieModel: 'kling/ai-avatar-standard',
  name: 'Kling AI Avatar (720p)',
};

// Modelo de texto para ganchos y guiones (Claude vía KIE, misma clave)
export const TEXT_MODEL = 'claude-haiku-4-5';

// ===== Herramientas de edición (estilo Higgsfield) =====

// Mejorar calidad: Topaz (imagen y video). Factor = cuántas veces más grande
export const UPSCALE_FACTORS = {
  image: ['1', '2', '4'],
  video: ['2', '4'],
};

// Movimiento: copia el movimiento de un video sobre tu personaje (Kling 3.0 Motion Control)
export const MOTION_MODEL = {
  kieModel: 'kling-3.0/motion-control',
  modes: ['720p', '1080p'],
  orientations: [
    { id: 'video', label: 'Seguir la orientación del video (recomendado)' },
    { id: 'image', label: 'Seguir la orientación de la foto' },
  ],
};

// Reemplazar personaje: pone a tu personaje dentro de un video existente (Wan 2.2 Animate Replace)
export const REPLACE_MODEL = {
  kieModel: 'wan/2-2-animate-replace',
  resolutions: ['480p', '580p', '720p'],
};

// Cinema: varios planos en un solo video (Kling 3.0 multi-plano)
export const CINEMA_LIMITS = {
  maxShots: 5,
  shotMinSec: 1,
  shotMaxSec: 12,
  shotMaxChars: 500,
  totalMinSec: 3,
  totalMaxSec: 15,
};

// Efectos VFX: frases que se agregan a la descripción del video.
// (En inglés porque los modelos de video las entienden mejor.)
export const VFX_PRESETS = [
  { id: 'melt', label: 'Derretirse', text: 'the subject slowly melts like hot wax, dripping and pooling on the floor, hyper-realistic' },
  { id: 'burn', label: 'En llamas', text: 'the subject catches fire and burns with realistic flames and glowing embers, dramatic lighting' },
  { id: 'float', label: 'Flotar', text: 'the subject and surrounding objects float upward in zero gravity, hair and clothes drifting slowly' },
  { id: 'dust', label: 'Desintegrarse', text: 'the subject disintegrates into dust and particles carried away by the wind' },
  { id: 'explode', label: 'Explosión', text: 'a massive cinematic explosion erupts behind the subject with debris and shockwave, slow motion' },
  { id: 'smash', label: 'Aplastar', text: 'a giant hand smashes down and squashes the scene in a cartoonish, comedic way' },
  { id: 'neon', label: 'Neón', text: 'the scene is bathed in pulsing neon lights with a glowing cyberpunk atmosphere and light trails' },
  { id: 'crashzoom', label: 'Crash zoom', text: 'a fast crash zoom into the subject\'s face with a dramatic camera shake' },
  { id: 'fpv', label: 'Dron FPV', text: 'fast FPV drone camera flying through the scene, smooth sweeping motion, wide angle' },
];

// Plantillas para imágenes con fotos de referencia (probador, personaje, producto)
export const IMAGE_TEMPLATES = [
  {
    id: 'tryon',
    label: 'Probador virtual',
    hint: 'Referencia 1: foto de la persona. Referencia 2: foto de la prenda.',
    prompt: 'Photorealistic fashion photo of the person from the first image wearing the garment from the second image. Keep the person\'s face, body and pose; natural lighting and fabric folds.',
  },
  {
    id: 'character',
    label: 'Mismo personaje, otra escena',
    hint: 'Referencia 1: foto del personaje. Cambia la escena en la descripción.',
    prompt: 'The same person from the reference image, with identical face and features, now sitting in a modern coffee shop, candid lifestyle photo, natural light.',
  },
  {
    id: 'product',
    label: 'Producto en escena',
    hint: 'Referencia 1: foto del producto (idealmente sobre fondo liso).',
    prompt: 'Professional advertising photo of the product from the reference image placed on a marble table with soft studio lighting, shallow depth of field, premium look.',
  },
];
