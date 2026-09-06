import { useEffect, useState } from "react";

import { ApiError, fetchBranches, fetchSections, postQuery } from "./api.js";
import { useSpeech } from "./useSpeech.js";

const YEAR = 4; // Phase 1 dataset is 4th-year only; no year selector needed yet.

export default function App() {
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [contextLocked, setContextLocked] = useState(false);
  const [contextLoadError, setContextLoadError] = useState(null);

  const [answer, setAnswer] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const {
    isSTTSupported,
    isTTSSupported,
    isListening,
    transcript,
    sttError,
    startListening,
    speak,
  } = useSpeech();

  useEffect(() => {
    fetchBranches()
      .then(setBranches)
      .catch(() =>
        setContextLoadError(
          "Couldn't reach HARVIS to load branches. Is the backend running?"
        )
      );
  }, []);

  useEffect(() => {
    if (!branchId) {
      setSections([]);
      return;
    }

    fetchSections(branchId)
      .then(setSections)
      .catch(() =>
        setContextLoadError("Couldn't load sections for that branch.")
      );
  }, [branchId]);

  useEffect(() => {
    if (!transcript) return;

    runQuery(transcript);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  async function runQuery(text) {
    setIsQuerying(true);
    setQueryError(null);
    setAnswer(null);

    try {
      const result = await postQuery(
        {
          year: YEAR,
          branch_id: Number(branchId),
          section_id: Number(sectionId),
        },
        text
      );

      setAnswer(result.answer);
      speak(result.answer);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? "HARVIS backend returned an error. Please try again."
          : "Couldn't reach HARVIS. Is the backend running on :8000?";

      setQueryError(message);
      speak(message);
    } finally {
      setIsQuerying(false);
    }
  }

  const selectedSectionName = sections.find(
    (s) => String(s.section_id) === String(sectionId)
  )?.section_name;

  if (!contextLocked) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome to HARVIS</h1>
          <p style={styles.subtitle}>
            Select your academic context to begin.
          </p>

          {contextLoadError && (
            <p style={styles.errorText}>{contextLoadError}</p>
          )}

          <label style={styles.label}>Year</label>

          <select style={styles.select} value={YEAR} disabled>
            <option value={YEAR}>4th Year</option>
          </select>

          <label style={styles.label}>Branch</label>

          <select
            style={styles.select}
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setSectionId("");
              setContextLoadError(null);
            }}
          >
            <option value="">Select branch</option>

            {branches.map((b) => (
              <option key={b.branch_id} value={b.branch_id}>
                {b.branch_code} â€” {b.branch_name}
              </option>
            ))}
          </select>

          <label style={styles.label}>Section</label>

          <select
            style={styles.select}
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!branchId}
          >
            <option value="">Select section</option>

            {sections.map((s) => (
              <option key={s.section_id} value={s.section_id}>
                Section {s.section_name}
              </option>
            ))}
          </select>

          <button
            style={styles.button}
            onClick={() => setContextLocked(true)}
            disabled={!branchId || !sectionId}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.chatCard}>
        <h2 style={styles.title}>HARVIS</h2>

        <p style={styles.subtitle}>
          4th Year â€” Section {selectedSectionName}
        </p>

        {!isSTTSupported && (
          <p style={styles.errorText}>
            Speech recognition isn't supported in this browser. Try Chrome or
            Edge.
          </p>
        )}

        {!isTTSSupported && (
          <p style={styles.errorText}>
            Speech synthesis isn't supported in this browser â€” answers will
            show as text only.
          </p>
        )}

        <div style={styles.micArea}>
          <button
            style={{
              ...styles.micButton,
              ...(isListening ? styles.micButtonListening : {}),
            }}
            onClick={startListening}
            disabled={!isSTTSupported || isListening || isQuerying}
          >
            {isListening ? "Listening..." : "ðŸŽ¤ Ask HARVIS"}
          </button>
        </div>

        {sttError && (
          <p style={styles.errorText}>Microphone error: {sttError}</p>
        )}

        {transcript && (
          <div style={styles.transcriptBox}>
            <span style={styles.transcriptLabel}>You said:</span>{" "}
            {transcript}
          </div>
        )}

        {isQuerying && (
          <p style={styles.hint}>HARVIS is thinking...</p>
        )}

        {queryError && (
          <p style={styles.errorText}>{queryError}</p>
        )}

        {answer && !queryError && (
          <div style={styles.answerBox}>
            <span style={styles.transcriptLabel}>HARVIS:</span>{" "}
            {answer}
          </div>
        )}

        {!transcript && !answer && !queryError && (
          <p style={styles.hint}>
            Try asking: "What class do I have at 11 on Monday?"
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b1220",
    fontFamily: "system-ui, sans-serif",
  },

  card: {
    background: "#101a2e",
    padding: "2rem",
    borderRadius: "12px",
    width: "320px",
    color: "#e6edf5",
    boxShadow: "0 0 40px rgba(0,200,255,0.08)",
  },

  chatCard: {
    background: "#101a2e",
    padding: "2rem",
    borderRadius: "12px",
    width: "440px",
    color: "#e6edf5",
    boxShadow: "0 0 40px rgba(0,200,255,0.08)",
  },

  title: {
    margin: 0,
    color: "#4fd6ff",
  },

  subtitle: {
    color: "#8fa3bf",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },

  label: {
    display: "block",
    marginTop: "0.75rem",
    marginBottom: "0.25rem",
    fontSize: "0.85rem",
    color: "#8fa3bf",
  },

  select: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #26344d",
    background: "#0b1220",
    color: "#e6edf5",
  },

  button: {
    marginTop: "1.25rem",
    width: "100%",
    padding: "0.6rem",
    borderRadius: "6px",
    border: "none",
    background: "#4fd6ff",
    color: "#0b1220",
    fontWeight: 600,
    cursor: "pointer",
  },

  micArea: {
    display: "flex",
    justifyContent: "center",
    margin: "1.5rem 0",
  },

  micButton: {
    padding: "1rem 2rem",
    borderRadius: "999px",
    border: "none",
    background: "#4fd6ff",
    color: "#0b1220",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
  },

  micButtonListening: {
    background: "#ff4f6d",
    color: "#fff",
  },

  transcriptBox: {
    background: "#1c3a5e",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "0.75rem",
    fontSize: "0.95rem",
  },

  answerBox: {
    background: "#1a2740",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.95rem",
  },

  transcriptLabel: {
    color: "#4fd6ff",
    fontWeight: 600,
  },

  hint: {
    color: "#5c7191",
    fontSize: "0.85rem",
    textAlign: "center",
  },

  errorText: {
    color: "#ff8080",
    fontSize: "0.85rem",
  },
};

