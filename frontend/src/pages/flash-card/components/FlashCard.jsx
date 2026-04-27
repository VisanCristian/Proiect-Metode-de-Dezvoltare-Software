export default function FlashCard({ card, flipped, setFlipped, status, flashStatus, mark }) {
  return (
    <div
      className={`card ${flipped ? "flipped" : ""} ${status} ${flashStatus || ""}`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="card-inner">
        <div className="face front">
          <div className="card-accent" />
          <div className="face-front-body">
            {status !== "unanswered" && <span className={`badge ${status}`}>{status}</span>}
            <div className="card-face-label">Question</div>
            <p className="card-text">{card?.question}</p>
            <span className="flip-hint">click to flip</span>
          </div>
        </div>

        <div className="face back">
          <div className="card-accent" />
          <div className="face-back-body">
            {status !== "unanswered" && <span className={`badge ${status}`}>{status}</span>}
            <div className="card-face-label">Answer</div>
            <p className="card-text">{card?.answer}</p>
            <div className="card-divider" />
            <div className="card-mark-row">
              <button className="btn-know" onClick={(e) => { e.stopPropagation(); mark("known"); }} disabled={!flipped}>
                ✓ I know this
              </button>
              <button className="btn-dontknow" onClick={(e) => { e.stopPropagation(); mark("unknown"); }} disabled={!flipped}>
                ✗ I don't know
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}