// Valida los datos que manda la página y arma el pedido exacto que pide KIE
// para cada modelo. Si algo no es válido, lanza un PublicError ANTES de
// llamar a KIE, así no se gastan créditos en pedidos mal formados.
//
// Los modelos de video e imagen se arman en su propio archivo del catálogo
// (src/data/catalog/...). Aquí solo se valida lo común y se llama a su build().
import { PublicError } from './kie.js';
import {
  VIDEO_MODELS, IMAGE_MODELS, AVATAR_MODEL, VOICE_MODEL, VOICE_TURBO_MODEL, DIALOGUE_MODEL, ISOLATION_MODEL,
  VOICES, findModel, UPSCALE_FACTORS, MOTION_MODEL, REPLACE_MODEL, CINEMA_LIMITS,
  MUSIC_KIE_MODEL, MUSIC_MODELS, MUSIC_LIMITS, MUSIC_VOCALS,
} from '../src/data/models.js';

const MAX_PROMPT = 2500; // límite por defecto (el de Kling 3.0, el más estricto)
const MAX_SCRIPT = 1500; // un guion de ~90 s es suficiente para un anuncio

// ---- Validadores pequeños y reutilizables ----

function requireText(value, field, max, min = 3) {
  if (typeof value !== 'string' || value.trim().length < min) {
    throw new PublicError(`Escribe ${field} (mínimo ${min} caracteres).`);
  }
  if (value.length > max) {
    throw new PublicError(`${field} es demasiado largo (máximo ${max} caracteres).`);
  }
  return value.trim();
}

function optionalText(value, field, max) {
  if (value === undefined || value === null || String(value).trim() === '') return '';
  return requireText(value, field, max, 1);
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

  const prompt = requireText(body.prompt, 'la descripción', model.maxPrompt ?? MAX_PROMPT);
  const imageUrl = optionalHttpsUrl(body.imageUrl, 'La imagen');
  if (model.image === 'required' && !imageUrl) {
    throw new PublicError(`${model.name} solo anima una foto: sube una imagen inicial.`);
  }
  if (model.image === 'none' && imageUrl) {
    throw new PublicError(`${model.name} no acepta imagen inicial.`);
  }

  // Los modelos que toman el formato de la foto no tienen lista de formatos
  const ratio = model.ratios.length ? requireOneOf(body.ratio, model.ratios, 'el formato') : undefined;
  const duration = model.durations
    ? Number(requireOneOf(Number(body.duration), model.durations, 'la duración'))
    : requireDuration(body.duration, model.minDuration, model.maxDuration);
  const quality = requireOneOf(body.quality, model.qualities.map((q) => q.id), 'la calidad');
  const sound = model.sound ? Boolean(body.sound) : false;

  const params = { prompt, imageUrl, ratio, duration, quality, sound };
  const problem = model.validate?.(params);
  if (problem) throw new PublicError(problem);
  return model.build(params);
}

function buildImage(body) {
  const model = findModel(IMAGE_MODELS, body.model);
  if (!model) throw new PublicError('Modelo de imagen no válido.');

  const prompt = requireText(body.prompt, 'la descripción', model.maxPrompt ?? MAX_PROMPT);
  const ratio = requireOneOf(body.ratio, model.ratios, 'el formato');
  const quality = requireOneOf(body.quality, model.qualities.map((q) => q.id), 'la calidad');

  // Fotos de referencia (ej. persona + prenda para el probador); cada modelo dice cuántas acepta
  const refs = model.maxRefs > 0
    ? [...new Set(
      [body.imageUrl, ...(Array.isArray(body.imageUrls) ? body.imageUrls : [])]
        .filter(Boolean)
        .slice(0, model.maxRefs)
        .map((u) => requireHttpsUrl(u, 'La imagen de referencia')),
    )]
    : [];
  return model.build({ prompt, ratio, quality, refs });
}

// Voz: ElevenLabs Multilingual v2 (por defecto) o Turbo 2.5
function buildVoice(body) {
  const turbo = body.model === VOICE_TURBO_MODEL.id;
  const model = turbo ? VOICE_TURBO_MODEL : VOICE_MODEL;
  const input = {
    text: requireText(body.text, 'el guion', turbo ? VOICE_TURBO_MODEL.maxChars : MAX_SCRIPT),
    voice: requireOneOf(body.voice, VOICES.map((v) => v.id), 'la voz'),
    stability: 0.5,
    similarity_boost: 0.75,
    speed: 1,
  };
  return { kieModel: model.kieModel, input };
}

// Conversación entre varias voces (ElevenLabs Diálogo v3)
function buildDialogue(body) {
  const lines = body.lines;
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > DIALOGUE_MODEL.maxLines) {
    throw new PublicError(`Agrega entre 1 y ${DIALOGUE_MODEL.maxLines} líneas de diálogo.`);
  }
  const dialogue = lines.map((line, i) => ({
    text: requireText(line?.text, `el texto de la línea ${i + 1}`, DIALOGUE_MODEL.maxChars, 1),
    voice: requireOneOf(line?.voice, VOICES.map((v) => v.id), `la voz de la línea ${i + 1}`),
  }));
  const total = dialogue.reduce((sum, l) => sum + l.text.length, 0);
  if (total > DIALOGUE_MODEL.maxChars) {
    throw new PublicError(`El diálogo es demasiado largo (${total} de ${DIALOGUE_MODEL.maxChars} caracteres en total).`);
  }
  return { kieModel: DIALOGUE_MODEL.kieModel, input: { dialogue, stability: 0.5 } };
}

// Dejar solo la voz de un audio (quita ruido, música y eco)
function buildIsolate(body) {
  return { kieModel: ISOLATION_MODEL.kieModel, input: { audio_url: requireHttpsUrl(body.audioUrl, 'el audio') } };
}

// Música con Suno. Dos modos:
//  - sencillo: describes la idea y el estilo, Suno inventa la letra
//  - personalizado: tú pones título y letra, y puedes fijar voz y duración
function buildMusic(body) {
  const L = MUSIC_LIMITS;
  const model = requireOneOf(body.model || MUSIC_MODELS[0].id, MUSIC_MODELS.map((m) => m.id), 'la versión de Suno');
  const instrumental = Boolean(body.instrumental);
  const customMode = Boolean(body.customMode);
  const style = requireText(body.style, 'el estilo musical', L.styleMax);

  if (!customMode) {
    return {
      kieModel: MUSIC_KIE_MODEL,
      input: {
        custom_mode: false,
        model,
        instrumental,
        prompt: requireText(body.prompt, 'la idea de la canción', L.promptMax),
        style,
      },
    };
  }

  const input = {
    custom_mode: true,
    model,
    instrumental,
    style,
    title: requireText(body.title, 'el título', L.titleMax),
  };
  if (!instrumental) {
    input.lyrics = requireText(body.lyrics, 'la letra', L.lyricsMax);
    const vocal = optionalText(body.vocalGender, 'la voz', 1);
    if (vocal) input.vocal_gender = requireOneOf(vocal, MUSIC_VOCALS.map((v) => v.id).filter(Boolean), 'la voz');
  }
  if (body.duration !== undefined && body.duration !== '' && body.duration !== null) {
    input.duration = requireDuration(body.duration, L.durationMin, L.durationMax);
  }
  return { kieModel: MUSIC_KIE_MODEL, input };
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

// Quitar el fondo de una imagen (Recraft)
function buildRemoveBg(body) {
  return { kieModel: 'recraft/remove-background', input: { image: requireHttpsUrl(body.imageUrl, 'la imagen') } };
}

// Mejora nítida de una imagen (Recraft Crisp Upscale)
function buildCrispUpscale(body) {
  return { kieModel: 'recraft/crisp-upscale', input: { image: requireHttpsUrl(body.imageUrl, 'la imagen') } };
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
  music: buildMusic, dialogue: buildDialogue, isolate: buildIsolate,
  removebg: buildRemoveBg, crispup: buildCrispUpscale,
};

// Punto de entrada: según el "type" elige el constructor correcto
export function buildTask(body) {
  const builder = BUILDERS[body?.type];
  if (!builder) throw new PublicError('Tipo de generación no válido.');
  return builder(body);
}
