import { useEffect, useRef, useState } from "react";

export function useSpeech() {
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  const [isSTTSupported, setIsSTTSupported] = useState(false);
  const [isTTSSupported, setIsTTSSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sttError, setSttError] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const ttsSupported = "speechSynthesis" in window;

    setIsSTTSupported(Boolean(SpeechRecognition));
    setIsTTSSupported(ttsSupported);

    if (ttsSupported) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };

      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          loadVoices
        );
        window.speechSynthesis.cancel();
      };
    }

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setSttError(null);
    };

    recognition.onresult = (event) => {
      const result = event.results[0];

      if (result && result[0]) {
        setTranscript(result[0].transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      setSttError(event.error || "Speech recognition failed.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  function selectHARVISVoice() {
    const voices = voicesRef.current;

    if (!voices.length) {
      return null;
    }

    const englishVoices = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith("en")
    );

    if (!englishVoices.length) {
      return voices[0];
    }

    const preferredVoice = englishVoices.find((voice) => {
      const lang = voice.lang.toLowerCase();
      const name = voice.name.toLowerCase();

      return (
        lang === "en-in" &&
        (
          name.includes("google") ||
          name.includes("microsoft") ||
          name.includes("natural") ||
          name.includes("neural")
        )
      );
    });

    if (preferredVoice) {
      return preferredVoice;
    }

    const indianEnglishVoice = englishVoices.find((voice) =>
      voice.lang.toLowerCase() === "en-in"
    );

    if (indianEnglishVoice) {
      return indianEnglishVoice;
    }

    const premiumEnglishVoice = englishVoices.find((voice) => {
      const name = voice.name.toLowerCase();

      return (
        name.includes("natural") ||
        name.includes("neural") ||
        name.includes("microsoft") ||
        name.includes("google")
      );
    });

    if (premiumEnglishVoice) {
      return premiumEnglishVoice;
    }

    return englishVoices[0];
  }

  function startListening() {
    if (!recognitionRef.current || isListening) {
      return;
    }

    setTranscript("");
    setSttError(null);

    try {
      recognitionRef.current.start();
    } catch (error) {
      setSttError(error.message || "Could not start microphone.");
      setIsListening(false);
    }
  }

  function speak(text) {
    if (!("speechSynthesis" in window) || !text) {
      return;
    }

    const synth = window.speechSynthesis;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voice = selectHARVISVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-IN";
    }

    /*
     * HARVIS voice profile:
     * - slightly slower for clarity
     * - slightly lower pitch for a more computer-assistant feel
     * - full volume
     */
    utterance.rate = 0.92;
    utterance.pitch = 0.82;
    utterance.volume = 1;

    synth.speak(utterance);
  }

  return {
    isSTTSupported,
    isTTSSupported,
    isListening,
    transcript,
    sttError,
    startListening,
    speak,
  };
}