// Pruebas de server/buildTask.js: no llaman a KIE ni gastan créditos.
// Ejecutar con:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTask } from '../server/buildTask.js';
import { PublicError } from '../server/kie.js';

const IMG = 'https://example.com/foto.png';
const VID = 'https://example.com/video.mp4';

// ---- Casos válidos ----

test('video Kling sin imagen exige y envía aspect_ratio', () => {
  const { kieModel, input } = buildTask({ type: 'video', model: 'kling-3', prompt: 'una escena', ratio: '9:16', duration: 5, quality: 'std' });
  assert.equal(kieModel, 'kling-3.0/video');
  assert.equal(input.aspect_ratio, '9:16');
  assert.equal(input.duration, '5');
  assert.equal(input.multi_shots, false);
});

test('video Kling con imagen usa image_urls y no aspect_ratio', () => {
  const { input } = buildTask({ type: 'video', model: 'kling-3', prompt: 'animar', ratio: '16:9', duration: 5, quality: 'pro', imageUrl: IMG });
  assert.deepEqual(input.image_urls, [IMG]);
  assert.equal(input.aspect_ratio, undefined);
});

test('video Seedance con imagen usa first_frame_url', () => {
  const { kieModel, input } = buildTask({ type: 'video', model: 'seedance-2-fast', prompt: 'animar', ratio: '9:16', duration: 6, quality: '480p', imageUrl: IMG });
  assert.equal(kieModel, 'bytedance/seedance-2-fast');
  assert.equal(input.first_frame_url, IMG);
  assert.equal(input.resolution, '480p');
});

test('imagen acepta varias referencias (probador) sin duplicados', () => {
  const { input } = buildTask({ type: 'image', model: 'nano-banana-2', prompt: 'probador', ratio: '4:5', quality: '1K', imageUrls: [IMG, 'https://example.com/prenda.png', IMG] });
  assert.equal(input.image_input.length, 2);
});

test('mejorar calidad de imagen y de video', () => {
  assert.equal(buildTask({ type: 'upscale', kind: 'image', factor: '2', imageUrl: IMG }).kieModel, 'topaz/image-upscale');
  const v = buildTask({ type: 'upscale', kind: 'video', factor: '4', videoUrl: VID });
  assert.equal(v.kieModel, 'topaz/video-upscale');
  assert.equal(v.input.upscale_factor, '4');
});

test('movimiento arma input_urls y video_urls', () => {
  const { kieModel, input } = buildTask({ type: 'motion', imageUrl: IMG, videoUrl: VID, quality: '720p' });
  assert.equal(kieModel, 'kling-3.0/motion-control');
  assert.deepEqual(input.input_urls, [IMG]);
  assert.deepEqual(input.video_urls, [VID]);
  assert.equal(input.character_orientation, 'video');
});

test('reemplazo de personaje', () => {
  const { kieModel, input } = buildTask({ type: 'replace', imageUrl: IMG, videoUrl: VID, quality: '480p' });
  assert.equal(kieModel, 'wan/2-2-animate-replace');
  assert.equal(input.resolution, '480p');
});

test('cinema suma la duración de los planos', () => {
  const { input } = buildTask({
    type: 'cinema', ratio: '16:9', quality: 'std',
    shots: [{ prompt: 'plano general', duration: 3 }, { prompt: 'primer plano', duration: 4 }],
  });
  assert.equal(input.duration, '7');
  assert.equal(input.multi_shots, true);
  assert.equal(input.multi_prompt.length, 2);
});

// ---- Casos inválidos: deben fallar ANTES de llamar a KIE ----

const rejects = (body, pattern) =>
  assert.throws(() => buildTask(body), (err) => err instanceof PublicError && pattern.test(err.message));

test('rechaza tipo desconocido y modelo inexistente', () => {
  rejects({ type: 'hack' }, /Tipo/);
  rejects({ type: 'video', model: 'otro', prompt: 'hola mundo' }, /Modelo/);
});

test('rechaza enlaces que no son https', () => {
  rejects({ type: 'upscale', kind: 'image', factor: '2', imageUrl: 'http://x.com/a.png' }, /https/);
  rejects({ type: 'motion', imageUrl: 'javascript:alert(1)', videoUrl: VID, quality: '720p' }, /https/);
});

test('rechaza duración y calidad fuera de rango', () => {
  rejects({ type: 'video', model: 'kling-3', prompt: 'hola', ratio: '9:16', duration: 99, quality: 'std' }, /duración/);
  rejects({ type: 'video', model: 'kling-3', prompt: 'hola', ratio: '9:16', duration: 5, quality: 'ultra' }, /calidad/);
});

test('rechaza Cinema con demasiados planos o duración total inválida', () => {
  const shot = { prompt: 'plano', duration: 3 };
  rejects({ type: 'cinema', ratio: '16:9', quality: 'std', shots: Array(6).fill(shot) }, /entre 1 y 5/);
  rejects({ type: 'cinema', ratio: '16:9', quality: 'std', shots: Array(5).fill({ prompt: 'plano', duration: 4 }) }, /suma/);
  rejects({ type: 'cinema', ratio: '16:9', quality: 'std', shots: [{ prompt: 'plano', duration: 1 }] }, /suma/);
});

test('rechaza guion vacío o demasiado largo', () => {
  rejects({ type: 'voice', text: '  ', voice: 'hpp4J3VqNfWAUOO0d1Us' }, /guion/);
  rejects({ type: 'voice', text: 'a'.repeat(1600), voice: 'hpp4J3VqNfWAUOO0d1Us' }, /largo/);
});
