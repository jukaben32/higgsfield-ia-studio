// Valida los datos que manda la página y arma el pedido exacto que pide KIE
// para cada modelo. Si algo no es válido, lanza un PublicError ANTES de
// llamar a KIE, así no se gastan créditos en pedidos mal formados.
import { PublicError } from './kie.js';
import {
  VIDEO_MODELS, IMAGE_MODELS, AVATAR_MODEL, VOICE_MODEL, VOICES, findModel,
  UPSCALE_FACTORS, MOTION_MODEL, REPLACE_MODEL, CINEMA_LIMITS,
} from '../src/data/models.js';

const MAX_PROMPT = 2500; // límite de Kling 3.0 (el más estricto de los dos)
const MAX_SCRIPT = 1500; // un guion de ~90 s es suficiente para un anuncio

// ---- Validadores pequeños y reutilizables ----

function requireText(value, field, max) {
  if (typeof value !== 'string' || value.trim().length < 3) {
    throw new PublicError(`Escribe ${field} (mínimo 3 caracteres).`);
  }
  if (value.length > max) {
    throw new PublicError(`${field} es demasiado largo (máximo ${max} caracteres).`);
  }
  return value.trim();
}

function requireOneOf(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new PublicError(`Valor no válido para ${field}.`);
  }
  return value;
}

function optionalHttpsUrl(value, field) {
  if (value === undefined || value === null || value === '') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') throw new Error();
    return url.toString();
  } catch {
    throw new PublicError(`${field.charAt(0).toUpperCase()}${field.slice(1)} debe ser un enlace https válido.`);
  }
}

function requireHttpsUrl(value, field) {
  const url = optionalHttpsUrl(value, field);
  if (!url) throw new PublicError(`Falta ${field}.`);
  return url;
}

function requireDuration(value, min, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new PublicError(`La duración debe estar entre ${min} y ${max} segundos.`);
  }
  return n;
}

// ---- Constructores por tipo ----

function buildVideo(body) {
  const model = findModel(VIDEO_MODELS, body.model);
  if (!model) throw new PublicError('Modelo de video no válido.');

  const prompt = requireText(body.prompt, 'la descripción', MAX_PROMPT);
  const imageUrl = optionalHttpsUrl(body.imageUrl, 'La imagen');
  const ratio = requireOneOf(body.ratio, model.ratios, 'el formato');
  const duration = requireDuration(body.duration, model.minDuration, model.maxDuration);
  const quality = requireOneOf(body.quality, model.qualities.map((q) => q.id), 'la calidad');
  const sound = Boolean(body.sound);

  if (model.id === 'kling-3') {
    const input = { prompt, sound, duration: String(duration), mode: quality, multi_shots: false };
    // Con imagen, Kling usa el formato de la foto; sin imagen hay que indicarlo
    if (imageUrl) input.image_urls = [imageUrl];
    else input.aspect_ratio = ratio;
    return { kieModel: model.kieModel, input };
  }

  // Seedance 2.0 Fast
  const input = { prompt, aspect_ratio: ratio, duration, resolution: quality, generate_audio: sound };
  if (imageUrl) input.first_frame_url = imageUrl;
  return { kieModel: model.kieModel, input };
}

function buildImage(body) {
  const model = findModel(IMAGE_MODELS, body.model);
  if (!model) throw new PublicError('Modelo de imagen no válido.');

  const input = {
    prompt: requireText(body.prompt, 'la descripción', MAX_PROMPT),
    aspect_ratio: requireOneOf(body.ratio, model.ratios, 'el formato'),
    resolution: requireOneOf(body.quality, model.qualities.map((q) => q.id), 'la calidad'),
    output_format: 'png',
  };
  // Hasta 4 imágenes de referencia (ej. persona + prenda para el probador)
  const refs = [body.imageUrl, ...(Array.isArray(body.imageUrls) ? body.imageUrls : [])]
    .filter(Boolean)
    .slice(0, 4)
    .map((u) => requireHttpsUrl(u, 'La imagen de referencia'));
  if (refs.length) input.image_input = [...new Set(refs)];
  return { kieModel: model.kieModel, input };
}

function buildVoice(body) {
  const input = {
    text: requireText(body.text, 'el guion', MAX_SCRIPT),
    voice: requireOneOf(body.voice, VOICES.map((v) => v.id), 'la voz'),
    stability: 0.5,
    similarity_boost: 0.75,
    speed: 1,
  };
  return { kieModel: VOICE_MODEL.kieModel, input };
}

function buildAvatar(body) {
  const input = {
    image_url: requireHttpsUrl(body.imageUrl, 'la foto del personaje'),
    audio_url: requireHttpsUrl(body.audioUrl, 'el audio'),
    // KIE exige un prompt no vacío que describa gestos y cámara
    prompt: typeof body.prompt === 'string' && body.prompt.trim()
      ? body.prompt.trim().slice(0, 1000)
      : 'Person speaking naturally to the camera with friendly expressions, steady medium shot',
  };
  return { kieModel: AVATAR_MODEL.kieModel, input };
}

// Mejorar calidad de una imagen o un video (Topaz)
function buildUpscale(body) {
  const kind = requireOneOf(body.kind, ['image', 'video'], 'el tipo de archivo');
  const factor = requireOneOf(String(body.factor), UPSCALE_FACTORS[kind], 'el aumento');
  if (kind === 'image') {
    return { kieModel: 'topaz/image-upscale', input: { image_url: requireHttpsUrl(body.imageUrl, 'la imagen'), upscale_factor: factor } };
  }
  return { kieModel: 'topaz/video-upscale', input: { video_url: requireHttpsUrl(body.videoUrl, 'el video'), upscale_factor: factor } };
}

// Copiar el movimiento de un video sobre un personaje (Kling 3.0 Motion Control)
function buildMotion(body) {
  const input = {
    input_urls: [requireHttpsUrl(body.imageUrl, 'la foto del personaje')],
    video_urls: [requireHttpsUrl(body.videoUrl, 'el video de movimiento')],
    mode: requireOneOf(body.quality, MOTION_MODEL.modes, 'la calidad'),
    character_orientation: requireOneOf(body.orientation || 'video', MOTION_MODEL.orientations.map((o) => o.id), 'la orientación'),
  };
  if (typeof body.prompt === 'string' && body.prompt.trim()) input.prompt = body.prompt.trim().slice(0, MAX_PROMPT);
  return { kieModel: MOTION_MODEL.kieModel, input };
}

// Reemplazar al personaje de un video por el de una foto (Wan 2.2 Animate Replace)
function buildReplace(body) {
  return {
    kieModel: REPLACE_MODEL.kieModel,
    input: {
      video_url: requireHttpsUrl(body.videoUrl, 'el video'),
      image_url: requireHttpsUrl(body.imageUrl, 'la foto del personaje'),
      resolution: requireOneOf(body.quality, REPLACE_MODEL.resolutions, 'la calidad'),
    },
  };
}

// Cinema: varios planos en un solo video (Kling 3.0 multi-plano)
function buildCinema(body) {
  const L = CINEMA_LIMITS;
  if (!Array.isArray(body.shots) || body.shots.length < 1 || body.shots.length > L.maxShots) {
    throw new PublicError(`Agrega entre 1 y ${L.maxShots} planos.`);
  }
  const shots = body.shots.map((shot, i) => ({
    prompt: requireText(shot?.prompt, `la descripción del plano ${i + 1}`, L.shotMaxChars),
    duration: requireDuration(shot?.duration, L.shotMinSec, L.shotMaxSec),
  }));
  const total = shots.reduce((sum, s) => sum + s.duration, 0);
  if (total < L.totalMinSec || total > L.totalMaxSec) {
    throw new PublicError(`La suma de los planos debe estar entre ${L.totalMinSec} y ${L.totalMaxSec} segundos (ahora: ${total}).`);
  }

  const kling = VIDEO_MODELS.find((m) => m.id === 'kling-3');
  const imageUrl = optionalHttpsUrl(body.imageUrl, 'La imagen inicial');
  const input = {
    multi_shots: true,
    multi_prompt: shots,
    duration: String(total),
    mode: requireOneOf(body.quality, kling.qualities.map((q) => q.id), 'la calidad'),
    sound: Boolean(body.sound),
  };
  if (imageUrl) input.image_urls = [imageUrl];
  else input.aspect_ratio = requireOneOf(body.ratio, kling.ratios, 'el formato');
  return { kieModel: kling.kieModel, input };
}

const BUILDERS = {
  video: buildVideo, image: buildImage, voice: buildVoice, avatar: buildAvatar,
  upscale: buildUpscale, motion: buildMotion, replace: buildReplace, cinema: buildCinema,
};

// Punto de entrada: según el "type" elige el constructor correcto
export function buildTask(body) {
  const builder = BUILDERS[body?.type];
  if (!builder) throw new PublicError('Tipo de generación no válido.');
  return builder(body);
}
