/**
 * Higgsfield AI Studio - Production Ingestion & Inference Bridge
 * Connects directly to Fal.ai, ElevenLabs, and OpenAI APIs.
 */

// 1. Video Generation via Fal.ai (Wan 2.1 / Seedance / Kling / MiniMax)
export async function generateRealVideo({ prompt, model = 'wan-3.0', aspectRatio = '16:9', duration = 5, falKey }) {
  if (!falKey) {
    throw new Error('No Fal.ai API key provided. Please configure it in Settings.');
  }

  // Model endpoints mapping on Fal.ai
  let endpoint = 'fal-ai/wan-2.1/text-to-video';
  if (model === 'kling-3.0') {
    endpoint = 'fal-ai/kling-video/v1.5/pro/text-to-video';
  } else if (model === 'seedance-2.5' || model === 'fast') {
    endpoint = 'fal-ai/minimax-video';
  }

  // Convert ratio to dimensions
  let aspectObj = { width: 1280, height: 720 };
  if (aspectRatio === '9:16') aspectObj = { width: 720, height: 1280 };
  if (aspectRatio === '1:1') aspectObj = { width: 1024, height: 1024 };

  // 1. Submit request to Fal queue
  const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      aspect_ratio: aspectRatio,
      resolution: aspectRatio === '16:9' ? '720p' : '580p',
      duration: duration
    })
  });

  if (!submitRes.ok) {
    const errData = await submitRes.json().catch(() => ({}));
    throw new Error(errData.detail || `Fal.ai API error: ${submitRes.status}`);
  }

  const queueData = await submitRes.json();
  const requestId = queueData.request_id;
  const statusUrl = queueData.status_url || `https://queue.fal.run/${endpoint}/requests/${requestId}/status`;
  const responseUrl = queueData.response_url || `https://queue.fal.run/${endpoint}/requests/${requestId}`;

  // 2. Poll for completion
  let attempts = 0;
  const maxAttempts = 120; // 2 minutes max
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000));
    attempts++;

    const statusRes = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${falKey}` }
    });

    if (statusRes.ok) {
      const statusJson = await statusRes.json();
      if (statusJson.status === 'COMPLETED') {
        // Fetch result
        const resultRes = await fetch(responseUrl, {
          headers: { 'Authorization': `Key ${falKey}` }
        });
        const resultJson = await resultRes.json();
        const videoUrl = resultJson.video?.url || resultJson.output?.url;
        if (!videoUrl) throw new Error('Video URL not found in result payload');
        return {
          videoUrl: videoUrl,
          requestId: requestId
        };
      } else if (statusJson.status === 'FAILED') {
        throw new Error(statusJson.error || 'Generation failed on GPU node');
      }
    }
  }

  throw new Error('Generation timed out after 2 minutes');
}

// 2. Voice Generation via ElevenLabs
export async function generateRealVoice({ text, voiceId = '21m00Tcm4TlvDq8ikWAM', elevenLabsKey }) {
  if (!elevenLabsKey) {
    throw new Error('No ElevenLabs API key provided.');
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': elevenLabsKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs error: ${res.status}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
