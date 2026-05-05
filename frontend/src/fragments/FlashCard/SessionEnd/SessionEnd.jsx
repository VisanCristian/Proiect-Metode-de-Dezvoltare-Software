import { useEffect } from "react";

export default function SessionEnd({ known, unknown, resetSession, retryUnknownOnly, saveSessionStats }) {
  useEffect(() => {
    if (saveSessionStats) {
      saveSessionStats();
    }
  }, []);

  return (
    <div className="state-box">
      <h2>Session complete 🎉</h2>
      <div className="state-stats">
        <span style={{ color: "var(--green)" }}>Known: {known}</span>
        <span style={{ color: "var(--red)" }}>Unknown: {unknown}</span>
      </div>
      <div className="actions">
        <button className="btn-end" onClick={resetSession}>Reset session</button>
        <button className="btn-end" onClick={retryUnknownOnly} disabled={unknown === 0}>
          Retry only unknown
        </button>
      </div>
    </div>
  );
}