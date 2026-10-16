// Catálogo de modelos de KIE.ai: un archivo por familia.
// Para agregar un modelo nuevo: crea (o abre) el archivo de su familia, copia una
// entrada vecina, ajusta sus opciones y su función build(), y agrégalo aquí.
// Ver la forma de cada entrada en ./helpers.js. Las pruebas (npm test) revisan solo
// que el catálogo sea coherente.
import { KLING_MODELS } from './video/kling.js';
import { SEEDANCE_MODELS } from './video/seedance.js';
import { VEO_MODELS } from './video/veo.js';
import { WAN_MODELS } from './video/wan.js';
import { HAILUO_MODELS } from './video/hailuo.js';
import { HAPPYHORSE_MODELS } from './video/happyhorse.js';
import { GROK_MODELS } from './video/grok.js';
import { GOOGLE_IMAGE_MODELS } from './image/google.js';
import { OPENAI_IMAGE_MODELS } from './image/openai.js';
import { SEEDREAM_MODELS } from './image/seedream.js';
import { OTHER_IMAGE_MODELS } from './image/others.js';

// El primer modelo de cada lista es el que aparece elegido al abrir la pantalla
export const VIDEO_MODELS = [
  KLING_MODELS[0], // Kling 3.0
  SEEDANCE_MODELS[0], // Seedance 2.0 Fast
  SEEDANCE_MODELS[1], // Seedance 2.0
  ...VEO_MODELS,
  ...WAN_MODELS,
  ...GROK_MODELS,
  ...HAPPYHORSE_MODELS,
  ...HAILUO_MODELS,
  SEEDANCE_MODELS[2], // Seedance 1.5 Pro
  KLING_MODELS[1], // Kling 2.5 Turbo
];

export const IMAGE_MODELS = [
  GOOGLE_IMAGE_MODELS[0], // Nano Banana 2
  GOOGLE_IMAGE_MODELS[1], // Nano Banana Pro
  ...OPENAI_IMAGE_MODELS,
  ...SEEDREAM_MODELS,
  ...OTHER_IMAGE_MODELS.slice(0, 1), // Flux 2 Pro
  GOOGLE_IMAGE_MODELS[2], // Imagen 4
  ...OTHER_IMAGE_MODELS.slice(1), // Ideogram, Qwen, Grok, Z-Image, Wan
];

// Busca un modelo por su id dentro de una lista; devuelve undefined si no existe
export function findModel(list, id) {
  return list.find((m) => m.id === id);
}
