import type { Lesson } from "@/lib/lessons";
import { narrationFor, narrationId, type NarrationSlot } from "@/lib/lesson-narration";
import { forSpeech } from "@/lib/speech-text";
import manifest from "@/lib/generated/lesson-audio.json";
import { SpeakButton } from "@/components/SpeakButton";

// Exact text matching prevents an old clip from narrating a revised lesson.
const clips = manifest.clips as Record<string, { text: string; url: string }>;
export function LessonNarration({ lesson, slot, onListen, className = "" }: { lesson: Lesson; slot: NarrationSlot; onListen?: () => void; className?: string }) {
  const text = forSpeech(narrationFor(lesson, slot));
  const id = narrationId(lesson, slot);
  return <RecordedNarration id={id} text={text} onListen={onListen} className={className} />;
}

export function RecordedNarration({ id, text, onListen, label = "Listen", className = "" }: { id: string; text: string; onListen?: () => void; label?: string; className?: string }) {
  const normalized = forSpeech(text);
  const clip = clips[id];
  return <SpeakButton id={id} label={label} text={normalized} onListen={onListen} audioSrc={clip?.text === normalized ? clip.url : undefined} className={`!h-12 !w-12 ${className}`} />;
}
