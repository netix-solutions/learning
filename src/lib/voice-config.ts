// One narration profile for generated lessons and live question read-aloud.
// Voice IDs are public identifiers; the API key stays server-side.
export const VOICE_MODEL = "eleven_multilingual_v2";
export const DEFAULT_VOICE = "cgSgspJ2msm6clMCkdW9";
export const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.15,
  use_speaker_boost: true,
  speed: 0.9,
};
export const VOICE_OUTPUT_FORMAT = "mp3_44100_128";
export const MAX_SPEECH_CHARS = 4000;
