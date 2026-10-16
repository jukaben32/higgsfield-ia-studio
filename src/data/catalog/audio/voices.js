// Voces y modelos de ElevenLabs (vía KIE).
// Docs: https://docs.kie.ai/market/elevenlabs/text-to-speech-multilingual-v2
//       https://docs.kie.ai/market/elevenlabs/text-to-speech-turbo-2-5
//       https://docs.kie.ai/market/elevenlabs/text-to-dialogue-v3
//       https://docs.kie.ai/market/elevenlabs/audio-isolation

// Voz: ElevenLabs Multilingual v2 (habla español sin configurar nada extra)
export const VOICE_MODEL = {
  id: 'elevenlabs-v2',
  kieModel: 'elevenlabs/text-to-speech-multilingual-v2',
  name: 'ElevenLabs Multilingual v2',
};

// Versión rápida y económica; acepta hasta 5000 caracteres
export const VOICE_TURBO_MODEL = {
  id: 'elevenlabs-turbo',
  kieModel: 'elevenlabs/text-to-speech-turbo-2-5',
  name: 'ElevenLabs Turbo 2.5',
  maxChars: 5000,
};

// Conversación entre varias voces
export const DIALOGUE_MODEL = {
  id: 'elevenlabs-dialogue',
  kieModel: 'elevenlabs/text-to-dialogue-v3',
  name: 'ElevenLabs Diálogo v3',
  maxChars: 5000, // suma de todas las líneas
  maxLines: 8,
};

// Quita ruido, música y ecos para dejar solo la voz
export const ISOLATION_MODEL = {
  id: 'elevenlabs-isolation',
  kieModel: 'elevenlabs/audio-isolation',
  name: 'ElevenLabs Aislar voz',
};

// Algunas voces de la lista oficial de KIE (puedes escucharlas en
// https://static.aiquickdraw.com/elevenlabs/voice/<id>.mp3)
export const VOICES = [
  { id: 'hpp4J3VqNfWAUOO0d1Us', label: 'Bella — profesional y cálida (mujer)' },
  { id: '5l5f8iK3YPeGga21rQIX', label: 'Adeline — conversacional (mujer)' },
  { id: 'BZgkqPqms7Kj9ulSkVzn', label: 'Eve — enérgica y alegre (mujer)' },
  { id: 'nPczCjzI2devNBz1zQrb', label: 'Brian — profunda y confiable (hombre)' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam — creador de redes, enérgico (hombre)' },
  { id: 'UgBBYS2sOqTuMpoF3BR0', label: 'Mark — natural y conversacional (hombre)' },
  { id: 'wJqPPQ618aTW29mptyoc', label: 'Ana Rita — suave y expresiva (mujer)' },
  { id: 'EkK5I93UQWFDigLMpZcX', label: 'James — ronca y atrevida (hombre)' },
];
