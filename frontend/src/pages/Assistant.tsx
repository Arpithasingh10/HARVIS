import { useCallback, useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";

import { AIOrb } from "../components/AIOrb";
import { Header } from "../components/Header";
import { ResponsePanel } from "../components/ResponsePanel";
import { StatusIndicator, StateFlow, STATE_LABEL, type HarvisState } from "../components/StatusIndicator";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { VoiceButton } from "../components/VoiceButton";
import { SystemStatusStrip } from "../components/SystemStatusStrip";
import { InteractionHistory, type Interaction } from "../components/InteractionHistory";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import {
  HarvisApiError,
  fetchBranches,
  postQuery,
  resolveStudentSessionContext,
  type SessionContext,
} from "../services/api";
import { formatTimesInText, nowLabel } from "../utils/timeFormatter";
import type { StudentProfile } from "../services/studentProfile";

const EXAMPLES = [
  "What class do I have at 11 on Monday?",
  "What class do I have at 3 PM on Tuesday?",
];

const ERROR_COPY = {
  backend: "HARVIS cannot reach the campus AI service.",
  permission: "Microphone access is required for voice interaction.",
  unsupported: "Voice input is not supported in this browser.",
  noSpeech: "I didn't catch that. Try again.",
  query: "HARVIS encountered a temporary system error.",
} as const;

export function Assistant({
  profile,
  onProfile,
  onLogout,
  actionError,
}: {
  profile: StudentProfile;
  onProfile: () => void;
  onLogout: () => void;
  actionError?: string | null;
}) {
  const [state, setState] = useState<HarvisState>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [askedAt, setAskedAt] = useState<string | undefined>(undefined);
  const [answer, setAnswer] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | undefined>(undefined);
  const [answeredAt, setAnsweredAt] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [history, setHistory] = useState<Interaction[]>([]);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);

  const { speak, cancel, speaking } = useSpeechSynthesis();

  useEffect(() => {
    let cancelled = false;
    setSessionContext(null);
    setContextLoading(true);

    resolveStudentSessionContext(profile)
      .then((context) => {
        if (!cancelled) setSessionContext(context);
      })
      .catch(() => {
        if (!cancelled) setSessionContext(null);
      })
      .finally(() => {
        if (!cancelled) setContextLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const runQuery = useCallback(
    async (text: string) => {
      setTranscript(text);
      setAskedAt(nowLabel());
      setAnswer(null);
      setIntent(undefined);
      setErrorMessage(null);
      setState("processing");

      if (contextLoading) {
        setErrorMessage("HARVIS is loading your academic data scope. Try again in a moment.");
        setState("idle");
        return;
      }
      if (!sessionContext) {
        setErrorMessage(
          "Timetable data for your branch, section and year is not available yet.",
        );
        setState("idle");
        return;
      }

      try {
        const result = await postQuery(sessionContext, text);
        const spoken = formatTimesInText(result.answer ?? "");
        setAnswer(spoken);
        setIntent(result.intent);
        setAnsweredAt(nowLabel());
        setOnline(true);
        setHistory((items) => [
          {
            id: Date.now(),
            question: text,
            answer: spoken,
            intent: result.intent,
            at: nowLabel(),
          },
          ...items,
        ].slice(0, 6));
        setState("speaking");
        speak(spoken, () => setState("idle"));
      } catch (err) {
        const apiError = err as HarvisApiError;
        const network = apiError?.kind === "network";
        setOnline(!network);
        setErrorMessage(network ? ERROR_COPY.backend : ERROR_COPY.query);
        setState("idle");
      }
    },
    [contextLoading, sessionContext, speak],
  );

  const recognition = useSpeechRecognition({
    lang: "en-IN",
    onFinalResult: (text) => {
      void runQuery(text);
    },
  });

  // Reflect recognition state into the HARVIS state machine.
  useEffect(() => {
    if (recognition.listening) setState("listening");
    else setState((prev) => (prev === "listening" ? "idle" : prev));
  }, [recognition.listening]);

  useEffect(() => {
    if (!recognition.error) return;
    const map: Record<string, string> = {
      unsupported: ERROR_COPY.unsupported,
      permission: ERROR_COPY.permission,
      "no-speech": ERROR_COPY.noSpeech,
      generic: ERROR_COPY.noSpeech,
    };
    setErrorMessage(map[recognition.error] ?? ERROR_COPY.noSpeech);
  }, [recognition.error]);

  // Lightweight availability probe so the header status is honest.
  useEffect(() => {
    let cancelled = false;
    fetchBranches()
      .then(() => !cancelled && setOnline(true))
      .catch(() => !cancelled && setOnline(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const startListening = useCallback(() => {
    cancel();
    setErrorMessage(null);
    recognition.clearError();
    recognition.start();
  }, [cancel, recognition]);

  const busy = state === "processing" || state === "speaking";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hud-grid pointer-events-none fixed inset-0 opacity-35" />
      <div className="hud-vignette pointer-events-none fixed inset-0" />

      <div className="relative z-10">
        <Header
          profile={profile}
          state={state}
          online={online}
          onProfile={onProfile}
          onLogout={onLogout}
        />

        <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          {actionError ? (
            <div role="alert" className="lg:col-span-2 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground/90">
              {actionError}
            </div>
          ) : null}
          {/* Core */}
          <section className="flex flex-col items-center gap-6 lg:sticky lg:top-28">
            <AIOrb state={state} onActivate={startListening} disabled={busy} />

            <StatusIndicator state={state} />
            <StateFlow state={state} />

            {recognition.interim ? (
              <p className="max-w-sm text-center font-mono text-sm text-muted-foreground">
                {recognition.interim}
              </p>
            ) : null}

            <VoiceButton
              state={state}
              onStart={startListening}
              onStop={recognition.stop}
              disabled={!recognition.supported}
            />

            <p className="max-w-xs text-center text-sm text-muted-foreground">
              Ask about your timetable, classes and campus information.
            </p>
          </section>

          {/* Conversation */}
          <section className="flex flex-col gap-4">
            {errorMessage ? (
              <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-foreground/90">{errorMessage}</p>
              </div>
            ) : null}

            {transcript ? <TranscriptPanel transcript={transcript} timestamp={askedAt} /> : null}

            {state === "processing" ? (
              <div className="panel flex items-center gap-3 p-5">
                <span className="flex h-5 items-end gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-1 origin-bottom rounded-full bg-primary animate-bar"
                      style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </span>
                <span className="label-tech text-primary">{STATE_LABEL.processing}</span>
              </div>
            ) : null}

            {answer ? (
              <ResponsePanel
                answer={answer}
                intent={intent}
                timestamp={answeredAt}
                speaking={speaking}
                onReplay={() => {
                  setState("speaking");
                  speak(answer, () => setState("idle"));
                }}
                onStop={() => {
                  cancel();
                  setState("idle");
                }}
              />
            ) : null}

            {!transcript && !errorMessage ? (
              <div className="panel p-6">
                <p className="font-display text-2xl font-bold tracking-[0.28em] text-foreground text-glow">
                  HARVIS
                </p>
                <p className="label-tech mt-1 text-primary">{STATE_LABEL.idle}</p>
                <p className="mt-6 label-tech">Try asking</p>
                <ul className="mt-3 space-y-2">
                  {EXAMPLES.map((example) => (
                    <li
                      key={example}
                      className="rounded-md border border-border/70 bg-surface/50 px-4 py-3 text-sm text-foreground/85"
                    >
                      &ldquo;{example}&rdquo;
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-muted-foreground">
                  Press the core or “Ask HARVIS” and speak your question.
                </p>
              </div>
            ) : null}
          </section>
        </main>

        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <SystemStatusStrip
            online={online}
            voiceInput={recognition.supported}
            voiceOutput={true}
          />
          <div className="mt-4">
            <InteractionHistory items={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
