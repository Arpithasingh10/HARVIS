import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Picks the most "assistant-like" English voice available on this OS.
 * No voice name is hardcoded — voices are scored, best score wins.
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace("_", "-");
  let score = 0;

  if (!lang.startsWith("en")) return -1;
  score += 10;
  if (lang === "en-in") score += 30;
  else if (lang === "en-gb") score += 18;
  else if (lang === "en-us") score += 14;

  // Prefer higher-quality / neural / mature-sounding engines.
  if (/(neural|natural|premium|enhanced|online|wavenet)/.test(name)) score += 14;
  if (/(google|microsoft)/.test(name)) score += 8;
  if (/(daniel|david|ravi|rishi|prabhat|george|arthur|guy|alex|oliver)/.test(name)) score += 10;
  // Avoid novelty / cartoon voices.
  if (/(zarvox|whisper|bells|bubbles|trinoids|bad news|good news|jester|albert)/.test(name)) {
    score -= 40;
  }
  if (voice.localService) score += 2;

  return score;
}

export function useSpeechSynthesis() {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const best = voices
        .map((voice) => ({ voice, score: scoreVoice(voice) }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => b.score - a.score)[0];
      voiceRef.current = best?.voice ?? voices[0] ?? null;
    };

    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pick);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Graceful fallback: if no voice was resolved, the browser default is used.
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
        utterance.lang = voiceRef.current.lang;
      } else {
        utterance.lang = "en-IN";
      }
      utterance.rate = 0.98; // measured, deliberate
      utterance.pitch = 0.85; // lower = authoritative, slightly machine-like
      utterance.volume = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, cancel };
}
