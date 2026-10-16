// Pruebas del catálogo de modelos: no llaman a KIE ni gastan créditos.
// Revisan que cada modelo arme el pedido tal como lo describe su documentación
// (https://docs.kie.ai/market/...) y que el catálogo sea coherente.
// Ejecutar con:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTask } from '../server/buildTask.js';
import { extractResultUrls, PublicError } from '../server/kie.js';
import { VIDEO_MODELS, IMAGE_MODELS } from '../src/data/models.js';

const IMG = 'https://example.com/foto.png';
const IMG2 = 'https://example.com/prenda.png';
const AUDIO = 'https://example.com/voz.mp3';

const rejects = (body, pattern) =>
  assert.throws(() => buildTask(body), (err) => err instanceof PublicError && pattern.test(err.message));

// Un pedido de video válido para cualquier modelo, usando su primera opción de cada cosa
function videoBody(model, extra = {}) {
  return {
    type: 'video',
    model: model.id,
    prompt: 'una escena de prueba',
    ratio: model.ratios[0],
    duration: model.durations ? model.durations[0] : model.minDuration,
    quality: model.qualities[0].id,
    ...extra,
  };
}

// ---- Coherencia del catálogo ----

test('los ids de modelos no se repiten', () => {
  for (const list of [VIDEO_MODELS, IMAGE_MODELS]) {
    const ids = list.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length, `ids repetidos: ${ids.join(', ')}`);
  }
});

test('cada modelo de video tiene datos completos y rangos válidos', () => {
  for (const m of VIDEO_MODELS) {
    assert.ok(m.name && m.creator && m.desc, `${m.id}: falta nombre, creador o descripción`);
    assert.ok(m.qualities.length > 0, `${m.id}: sin calidades`);
    assert.ok(['optional', 'required', 'none'].includes(m.image), `${m.id}: valor de "image" no válido`);
    assert.equal(typeof m.build, 'function', `${m.id}: sin build()`);
    if (m.durations) assert.ok(m.durations.length > 0, `${m.id}: lista de duraciones vacía`);
    else assert.ok(m.minDuration <= m.maxDuration, `${m.id}: rango de duración al revés`);
  }
});

test('cada modelo de imagen tiene datos completos', () => {
  for (const m of IMAGE_MODELS) {
    assert.ok(m.name && m.creator && m.desc, `${m.id}: falta nombre, creador o descripción`);
    assert.ok(m.ratios.length > 0 && m.qualities.length > 0, `${m.id}: sin formatos o calidades`);
    assert.equal(typeof m.maxRefs, 'number', `${m.id}: falta maxRefs`);
    assert.equal(typeof m.build, 'function', `${m.id}: sin build()`);
  }
});

// ---- Todos los modelos arman un pedido válido ----

test('todos los modelos de video arman un pedido con su modelo de KIE', () => {
  for (const m of VIDEO_MODELS) {
    const withImage = m.image === 'none' ? {} : { imageUrl: IMG };
    for (const extra of [m.image === 'required' ? withImage : {}, withImage]) {
      const { kieModel, input } = buildTask(videoBody(m, extra));
      assert.match(kieModel, /^[\w./-]+$/, `${m.id}: modelo de KIE raro "${kieModel}"`);
      assert.equal(typeof input.prompt, 'string', `${m.id}: el pedido no lleva prompt`);
    }
  }
});

test('todas las calidades, formatos y duraciones de cada video son aceptados', () => {
  for (const m of VIDEO_MODELS) {
    const base = m.image === 'required' ? { imageUrl: IMG } : {};
    for (const q of m.qualities) {
      for (const d of m.durations || [m.minDuration, m.maxDuration]) {
        if (m.validate?.({ quality: q.id, duration: d })) continue; // combinación prohibida a propósito
        assert.doesNotThrow(() => buildTask(videoBody(m, { ...base, quality: q.id, duration: d })), `${m.id} ${q.id} ${d}s`);
      }
    }
    for (const r of m.ratios) {
      assert.doesNotThrow(() => buildTask(videoBody(m, { ...base, ratio: r })), `${m.id} ${r}`);
    }
  }
});

test('todos los modelos de imagen arman un pedido válido, con y sin referencias', () => {
  for (const m of IMAGE_MODELS) {
    const body = { type: 'image', model: m.id, prompt: 'un producto de prueba', ratio: m.ratios[0], quality: m.qualities[0].id };
    const plain = buildTask(body);
    assert.equal(typeof plain.input.prompt, 'string', `${m.id}: sin prompt`);
    const refs = buildTask({ ...body, imageUrls: [IMG, IMG2] });
    assert.ok(refs.kieModel, `${m.id}: sin modelo con referencias`);
  }
});

test('un modelo de imagen sin referencias ignora las fotos que le lleguen', () => {
  const { input } = buildTask({ type: 'image', model: 'flux-2-pro', prompt: 'un zapato', ratio: '1:1', quality: '1K', imageUrls: [IMG] });
  assert.equal(input.image_input, undefined);
  assert.equal(input.input_urls, undefined);
});

// ---- Pedidos exactos según la documentación de KIE ----

test('Seedance 2.0 usa first_frame_url con foto y llega hasta 4k', () => {
  const { kieModel, input } = buildTask({ type: 'video', model: 'seedance-2', prompt: 'animar', ratio: '21:9', duration: 8, quality: '4k', sound: true, imageUrl: IMG });
  assert.equal(kieModel, 'bytedance/seedance-2');
  assert.equal(input.resolution, '4k');
  assert.equal(input.first_frame_url, IMG);
  assert.equal(input.generate_audio, true);
});

test('Seedance 1.5 Pro manda la foto en input_urls', () => {
  const { kieModel, input } = buildTask({ type: 'video', model: 'seedance-1-5-pro', prompt: 'animar', ratio: '16:9', duration: 8, quality: '720p', imageUrl: IMG });
  assert.equal(kieModel, 'bytedance/seedance-1.5-pro');
  assert.deepEqual(input.input_urls, [IMG]);
  assert.equal(input.fixed_lens, false);
});

test('Wan 2.7 usa "ratio" en texto→video y first_frame_url con foto', () => {
  const t2v = buildTask({ type: 'video', model: 'wan-2-7', prompt: 'ciudad', ratio: '9:16', duration: 5, quality: '1080p' });
  assert.equal(t2v.kieModel, 'wan/2-7-text-to-video');
  assert.equal(t2v.input.ratio, '9:16');
  const i2v = buildTask({ type: 'video', model: 'wan-2-7', prompt: 'ciudad', ratio: '9:16', duration: 5, quality: '1080p', imageUrl: IMG });
  assert.equal(i2v.kieModel, 'wan/2-7-image-to-video');
  assert.equal(i2v.input.first_frame_url, IMG);
  assert.equal(i2v.input.ratio, undefined);
});

test('Hailuo exige foto, manda la duración como texto y no permite 10 s en 1080P', () => {
  rejects({ type: 'video', model: 'hailuo-2-3-pro', prompt: 'animar foto', duration: 6, quality: '768P' }, /imagen inicial/);
  const { kieModel, input } = buildTask({ type: 'video', model: 'hailuo-2-3-pro', prompt: 'animar foto', duration: 6, quality: '768P', imageUrl: IMG });
  assert.equal(kieModel, 'hailuo/2-3-image-to-video-pro');
  assert.equal(input.duration, '6');
  assert.equal(input.image_url, IMG);
  rejects({ type: 'video', model: 'hailuo-2-3-standard', prompt: 'animar foto', duration: 10, quality: '1080P', imageUrl: IMG }, /1080P/);
  assert.equal(buildTask({ type: 'video', model: 'hailuo-2-3-standard', prompt: 'animar foto', duration: 10, quality: '768P', imageUrl: IMG }).input.duration, '10');
});

test('Hailuo solo acepta duraciones de la lista', () => {
  rejects({ type: 'video', model: 'hailuo-2-3-pro', prompt: 'animar foto', duration: 8, quality: '768P', imageUrl: IMG }, /duración/);
});

test('Veo 3.1 usa el modelo veo-3-1 y el nivel dentro de input.model', () => {
  const fast = buildTask({ type: 'video', model: 'veo-3-1-fast', prompt: 'un perro en el parque', ratio: '16:9', duration: 8, quality: '720p' });
  assert.equal(fast.kieModel, 'veo-3-1');
  assert.equal(fast.input.model, 'veo3_fast');
  assert.equal(fast.input.generation_type, 'TEXT_2_VIDEO');
  const quality = buildTask({ type: 'video', model: 'veo-3-1-quality', prompt: 'un perro en el parque', ratio: '9:16', duration: 6, quality: '4k', imageUrl: IMG });
  assert.equal(quality.input.model, 'veo3');
  assert.deepEqual(quality.input.image_urls, [IMG]);
  assert.equal(quality.input.generation_type, 'FIRST_AND_LAST_FRAMES_2_VIDEO');
  assert.equal(buildTask({ type: 'video', model: 'veo-3-1-lite', prompt: 'un perro en el parque', ratio: '16:9', duration: 4, quality: '720p' }).input.model, 'veo3_lite');
});

test('Grok Imagine manda la duración como texto y elige el endpoint según la foto', () => {
  const t2v = buildTask({ type: 'video', model: 'grok-imagine-video', prompt: 'puertas que se abren', ratio: '16:9', duration: 6, quality: '480p' });
  assert.equal(t2v.kieModel, 'grok-imagine/text-to-video');
  assert.equal(t2v.input.duration, '6');
  assert.equal(t2v.input.mode, 'normal');
  const i2v = buildTask({ type: 'video', model: 'grok-imagine-video', prompt: 'puertas que se abren', ratio: '16:9', duration: 6, quality: '480p', imageUrl: IMG });
  assert.equal(i2v.kieModel, 'grok-imagine/image-to-video');
  assert.deepEqual(i2v.input.image_urls, [IMG]);
});

test('Grok Imagine 1.5 acepta formato "auto"', () => {
  const { kieModel, input } = buildTask({ type: 'video', model: 'grok-imagine-1-5', prompt: 'un paisaje', ratio: 'auto', duration: 8, quality: '480p' });
  assert.equal(kieModel, 'grok-imagine-video-1-5-preview');
  assert.equal(input.aspect_ratio, 'auto');
});

test('HappyHorse y Kling 2.5 cambian de endpoint con foto', () => {
  assert.equal(buildTask({ type: 'video', model: 'happyhorse', prompt: 'un caballo', ratio: '16:9', duration: 5, quality: '720p' }).kieModel, 'happyhorse/text-to-video');
  const hi = buildTask({ type: 'video', model: 'happyhorse', prompt: 'un caballo', ratio: '16:9', duration: 5, quality: '720p', imageUrl: IMG });
  assert.equal(hi.kieModel, 'happyhorse/image-to-video');
  assert.deepEqual(hi.input.image_urls, [IMG]);
  const k25 = buildTask({ type: 'video', model: 'kling-2-5-turbo', prompt: 'un caballo', ratio: '9:16', duration: 10, quality: 'Pro' });
  assert.equal(k25.kieModel, 'kling/v2-5-turbo-text-to-video-pro');
  assert.equal(k25.input.duration, '10');
  assert.equal(buildTask({ type: 'video', model: 'kling-2-5-turbo', prompt: 'un caballo', ratio: '9:16', duration: 5, quality: 'Pro', imageUrl: IMG }).input.image_url, IMG);
});

test('el sonido solo se envía en los modelos que lo permiten', () => {
  const wan = buildTask({ type: 'video', model: 'wan-2-7', prompt: 'ciudad', ratio: '16:9', duration: 5, quality: '720p', sound: true });
  assert.equal(wan.input.sound, undefined);
  assert.equal(wan.input.generate_audio, undefined);
});

test('GPT Image 2 cambia de endpoint cuando hay referencias', () => {
  const t2i = buildTask({ type: 'image', model: 'gpt-image-2', prompt: 'un cartel', ratio: '16:9', quality: '2K' });
  assert.equal(t2i.kieModel, 'gpt-image-2-text-to-image');
  const i2i = buildTask({ type: 'image', model: 'gpt-image-2', prompt: 'un cartel', ratio: '16:9', quality: '2K', imageUrls: [IMG] });
  assert.equal(i2i.kieModel, 'gpt-image-2-image-to-image');
  assert.deepEqual(i2i.input.input_urls, [IMG]);
});

test('Nano Banana Pro usa image_input y Seedream usa "quality"', () => {
  const nbp = buildTask({ type: 'image', model: 'nano-banana-pro', prompt: 'un reloj', ratio: '1:1', quality: '4K', imageUrls: [IMG] });
  assert.equal(nbp.kieModel, 'nano-banana-pro');
  assert.deepEqual(nbp.input.image_input, [IMG]);
  const sd = buildTask({ type: 'image', model: 'seedream-5-lite', prompt: 'un reloj', ratio: '1:1', quality: 'ultra' });
  assert.equal(sd.input.quality, 'ultra');
  assert.equal(buildTask({ type: 'image', model: 'seedream-4-5', prompt: 'un reloj', ratio: '1:1', quality: 'high' }).kieModel, 'seedream/4.5-text-to-image');
  rejects({ type: 'image', model: 'seedream-4-5', prompt: 'un reloj', ratio: '1:1', quality: 'ultra' }, /calidad/);
});

test('Ideogram traduce el formato a su tamaño con nombre y Qwen usa image_size', () => {
  const ide = buildTask({ type: 'image', model: 'ideogram-v3', prompt: 'un logo', ratio: '9:16', quality: 'QUALITY' });
  assert.equal(ide.input.image_size, 'portrait_16_9');
  assert.equal(ide.input.rendering_speed, 'QUALITY');
  assert.equal(buildTask({ type: 'image', model: 'qwen-2', prompt: 'un logo', ratio: '3:4', quality: 'standard' }).input.image_size, '3:4');
});

test('Z-Image respeta su límite de 1000 caracteres', () => {
  rejects({ type: 'image', model: 'z-image', prompt: 'a'.repeat(1001), ratio: '1:1', quality: 'standard' }, /largo/);
});

// ---- Audio ----

test('música modo sencillo: idea + estilo, sin título ni letra', () => {
  const { kieModel, input } = buildTask({ type: 'music', customMode: false, model: 'V6', prompt: 'una canción alegre de verano', style: 'Pop tropical', instrumental: false });
  assert.equal(kieModel, 'ai-music-api/generate');
  assert.equal(input.custom_mode, false);
  assert.equal(input.model, 'V6');
  assert.equal(input.style, 'Pop tropical');
  assert.equal(input.title, undefined);
  assert.equal(input.duration, undefined);
});

test('música modo personalizado: título, letra, voz y duración', () => {
  const { input } = buildTask({ type: 'music', customMode: true, model: 'V6_WILD', style: 'Bachata', title: 'Mi canción', lyrics: 'Verso uno\nCoro', vocalGender: 'f', duration: 120, instrumental: false });
  assert.equal(input.custom_mode, true);
  assert.equal(input.lyrics, 'Verso uno\nCoro');
  assert.equal(input.vocal_gender, 'f');
  assert.equal(input.duration, 120);
});

test('música instrumental personalizada no lleva letra ni voz', () => {
  const { input } = buildTask({ type: 'music', customMode: true, style: 'Piano suave', title: 'Calma', instrumental: true, vocalGender: 'f' });
  assert.equal(input.lyrics, undefined);
  assert.equal(input.vocal_gender, undefined);
  assert.equal(input.model, 'V6');
});

test('música rechaza datos incompletos o fuera de límite', () => {
  rejects({ type: 'music', customMode: false, prompt: 'una canción', style: '' }, /estilo/);
  rejects({ type: 'music', customMode: false, prompt: '', style: 'Pop' }, /idea/);
  rejects({ type: 'music', customMode: true, style: 'Pop', title: '', lyrics: 'letra' }, /título/);
  rejects({ type: 'music', customMode: true, style: 'Pop', title: 'x'.repeat(81), lyrics: 'letra' }, /largo/);
  rejects({ type: 'music', customMode: true, style: 'Pop', title: 'Canción', instrumental: false }, /letra/);
  rejects({ type: 'music', customMode: true, style: 'Pop', title: 'Canción', lyrics: 'letra', duration: 5 }, /duración/);
  rejects({ type: 'music', customMode: false, model: 'V3', prompt: 'una canción', style: 'Pop' }, /Suno/);
});

test('voz Turbo 2.5 acepta guiones más largos que Multilingual v2', () => {
  const longText = 'a'.repeat(3000);
  const turbo = buildTask({ type: 'voice', model: 'elevenlabs-turbo', text: longText, voice: 'hpp4J3VqNfWAUOO0d1Us' });
  assert.equal(turbo.kieModel, 'elevenlabs/text-to-speech-turbo-2-5');
  rejects({ type: 'voice', text: longText, voice: 'hpp4J3VqNfWAUOO0d1Us' }, /largo/);
});

test('diálogo con varias voces', () => {
  const { kieModel, input } = buildTask({
    type: 'dialogue',
    lines: [{ text: 'Hola, ¿cómo estás?', voice: 'hpp4J3VqNfWAUOO0d1Us' }, { text: 'Muy bien, gracias.', voice: 'nPczCjzI2devNBz1zQrb' }],
  });
  assert.equal(kieModel, 'elevenlabs/text-to-dialogue-v3');
  assert.equal(input.dialogue.length, 2);
  assert.equal(input.dialogue[1].voice, 'nPczCjzI2devNBz1zQrb');
});

test('diálogo rechaza sin líneas, demasiadas líneas, voz inventada o texto excesivo', () => {
  const line = { text: 'hola', voice: 'hpp4J3VqNfWAUOO0d1Us' };
  rejects({ type: 'dialogue', lines: [] }, /entre 1 y 8/);
  rejects({ type: 'dialogue', lines: Array(9).fill(line) }, /entre 1 y 8/);
  rejects({ type: 'dialogue', lines: [{ text: 'hola', voice: 'inventada' }] }, /voz/);
  rejects({ type: 'dialogue', lines: Array(3).fill({ text: 'a'.repeat(2000), voice: line.voice }) }, /largo/);
});

test('aislar voz, quitar fondo y mejora nítida piden un enlace https', () => {
  assert.equal(buildTask({ type: 'isolate', audioUrl: AUDIO }).input.audio_url, AUDIO);
  assert.equal(buildTask({ type: 'removebg', imageUrl: IMG }).kieModel, 'recraft/remove-background');
  assert.equal(buildTask({ type: 'crispup', imageUrl: IMG }).input.image, IMG);
  rejects({ type: 'isolate', audioUrl: 'http://x.com/a.mp3' }, /https/);
  rejects({ type: 'removebg' }, /Falta/);
});

// ---- Lectura del resultado de KIE ----

test('extractResultUrls lee el formato normal { resultUrls }', () => {
  assert.deepEqual(extractResultUrls({ resultJson: '{"resultUrls":["https://a.com/v.mp4"]}' }), ['https://a.com/v.mp4']);
});

test('extractResultUrls lee las pistas de Suno (data[].audio_url)', () => {
  const response = { data: [{ audio_url: 'https://a.com/1.mp3', id: 'x' }, { audio_url: 'https://a.com/2.mp3', id: 'y' }] };
  assert.deepEqual(extractResultUrls({ response }), ['https://a.com/1.mp3', 'https://a.com/2.mp3']);
  assert.deepEqual(extractResultUrls({ resultJson: JSON.stringify(response) }), ['https://a.com/1.mp3', 'https://a.com/2.mp3']);
});

test('extractResultUrls lee Veo en 1080p/4K (data.result_urls) y cae al 720p', () => {
  assert.deepEqual(extractResultUrls({ resultJson: '{"data":{"result_urls":["https://a.com/hd.mp4"],"origin_urls":["https://a.com/720.mp4"]}}' }), ['https://a.com/hd.mp4']);
  assert.deepEqual(extractResultUrls({ resultJson: '{"data":{"origin_urls":["https://a.com/720.mp4"]}}' }), ['https://a.com/720.mp4']);
});

test('extractResultUrls ignora basura y no se cae', () => {
  assert.deepEqual(extractResultUrls({}), []);
  assert.deepEqual(extractResultUrls({ resultJson: 'no es json' }), []);
  assert.deepEqual(extractResultUrls({ resultJson: '{"resultUrls":["javascript:alert(1)", 5, null]}' }), []);
});
