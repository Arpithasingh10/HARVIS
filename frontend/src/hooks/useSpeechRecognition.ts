import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionErrorKind =
  | "unsupported"
  | "permission"
  | "no-speech"
  | "generic"
  | null;

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") {
    return null;
  }

  const w = window as unknown as Record<string, unknown>;

  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => RecognitionLike)
    | null;
}

const PAUSE_BEFORE_SUBMIT_MS = 2200;
const RESTART_DELAY_MS = 150;

export function useSpeechRecognition(options?: {
  lang?: string;
  onFinalResult?: (transcript: string) => void;
}) {
  const { lang = "en-IN", onFinalResult } = options ?? {};

  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<SpeechRecognitionErrorKind>(null);

  const recognitionRef = useRef<RecognitionLike | null>(null);

  // Complete finalized speech accumulated across recognition sessions.
  const finalTranscriptRef = useRef("");

  // Latest interim speech, used only for the live UI.
  const interimRef = useRef("");

  // True only when we deliberately want to finish the current query.
  const finishRequestedRef = useRef(false);

  // True while the student intentionally has an active voice session.
  const sessionActiveRef = useRef(false);

  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const callbackRef = useRef(onFinalResult);
  callbackRef.current = onFinalResult;

  const clearTimers = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (restartTimerRef.current !== null) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const submitTranscript = useCallback(() => {
    clearTimers();

    const transcript = finalTranscriptRef.current.trim();

    sessionActiveRef.current = false;
    finishRequestedRef.current = false;

    setListening(false);
    setInterim("");

    if (!transcript) {
      setError("no-speech");
      return;
    }

    callbackRef.current?.(transcript);
  }, [clearTimers]);

  useEffect(() => {
    const available = getRecognitionCtor() !== null;
    setSupported(available);

    return () => {
      sessionActiveRef.current = false;
      finishRequestedRef.current = true;
      clearTimers();
      recognitionRef.current?.abort?.();
      recognitionRef.current = null;
    };
  }, [clearTimers]);

  const stop = useCallback(() => {
    if (!sessionActiveRef.current) {
      return;
    }

    /*
     * Manual stop means:
     * "I am finished speaking; submit what HARVIS has captured."
     */
    finishRequestedRef.current = true;
    sessionActiveRef.current = false;

    clearTimers();

    recognitionRef.current?.stop?.();
  }, [clearTimers]);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();

    if (!Ctor) {
      setSupported(false);
      setError("unsupported");
      return;
    }

    clearTimers();

    // Abort any previous recognition session.
    recognitionRef.current?.abort?.();

    setError(null);
    setInterim("");

    finalTranscriptRef.current = "";
    interimRef.current = "";

    finishRequestedRef.current = false;
    sessionActiveRef.current = true;

    const createRecognition = () => {
      if (!sessionActiveRef.current) {
        return;
      }

      const recognition = new Ctor();

      recognition.lang = lang;

      /*
       * continuous=true lets the browser keep collecting speech
       * instead of treating every short pause as the end.
       */
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: unknown) => {
        const e = event as {
          resultIndex: number;
          results: ArrayLike<
            ArrayLike<{ transcript: string }> & {
              isFinal: boolean;
            }
          >;
        };

        let currentInterim = "";

        for (let i = e.resultIndex; i < e.results.length; i += 1) {
          const result = e.results[i];

          if (!result) {
            continue;
          }

          const text = result[0]?.transcript ?? "";

          if (result.isFinal) {
            finalTranscriptRef.current += `${text} `;
            interimRef.current = "";
          } else {
            currentInterim += text;
            interimRef.current = currentInterim;
          }
        }

        setInterim(currentInterim);

        /*
         * Reset the silence countdown after EVERY speech result.
         *
         * This means the student gets 2.2 seconds after their
         * latest speech before HARVIS decides they are finished.
         */
        if (pauseTimerRef.current !== null) {
          clearTimeout(pauseTimerRef.current);
        }

        pauseTimerRef.current = setTimeout(() => {
          if (!sessionActiveRef.current) {
            return;
          }

          finishRequestedRef.current = true;
          sessionActiveRef.current = false;

          recognition.stop();
        }, PAUSE_BEFORE_SUBMIT_MS);
      };

      recognition.onerror = (event: unknown) => {
        const code = (event as { error?: string }).error;

        if (code === "not-allowed" || code === "service-not-allowed") {
          sessionActiveRef.current = false;
          finishRequestedRef.current = true;
          setListening(false);
          setError("permission");
          return;
        }

        /*
         * "no-speech" and "aborted" can happen as part of Chrome's
         * recognition lifecycle. Do not submit a partial query.
         */
        if (code === "no-speech" || code === "aborted") {
          return;
        }

        setError("generic");
      };

      recognition.onend = () => {
        setListening(false);

        /*
         * We deliberately stopped because the student finished.
         * NOW — and only now — submit the accumulated transcript.
         */
        if (finishRequestedRef.current) {
          submitTranscript();
          return;
        }

        /*
         * Chrome can end a continuous recognition session on its own.
         *
         * The student has NOT finished, so restart recognition and
         * preserve everything already accumulated.
         */
        if (sessionActiveRef.current) {
          restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null;

            if (!sessionActiveRef.current) {
              return;
            }

            createRecognition();
            recognitionRef.current = recognition;

            try {
              recognition.start();
            } catch {
              setError("generic");
              sessionActiveRef.current = false;
              setListening(false);
            }
          }, RESTART_DELAY_MS);
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        setError("generic");
        sessionActiveRef.current = false;
        setListening(false);
      }
    };

    createRecognition();
  }, [lang, clearTimers, submitTranscript]);

  return {
    supported,
    listening,
    interim,
    error,
    start,
    stop,
    clearError: () => setError(null),
  };
}

export type { SpeechRecognitionErrorKind };