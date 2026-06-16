import { useLayoutEffect, useRef, useState } from "react";
import MarkdownRenderer from "../../MarkdownRenderer/MarkdownRenderer";

const MIN_CARD_HEIGHT = 240;
const CARD_CONTENT_BUFFER = 24;

export default function FlashCard({ card, flipped, setFlipped, status, flashStatus, mark }) {
  const [cardHeight, setCardHeight] = useState(MIN_CARD_HEIGHT);
  const frontBodyRef = useRef(null);
  const backBodyRef = useRef(null);

  useLayoutEffect(() => {
    const measureHeights = () => {
      const frontHeight = frontBodyRef.current?.scrollHeight ?? 0;
      const backHeight = backBodyRef.current?.scrollHeight ?? 0;
      const nextHeight = Math.max(
        MIN_CARD_HEIGHT,
        frontHeight + CARD_CONTENT_BUFFER,
        backHeight + CARD_CONTENT_BUFFER
      );

      setCardHeight((prevHeight) => (prevHeight === nextHeight ? prevHeight : nextHeight));
    };

    measureHeights();

    const resizeObserver = new ResizeObserver(measureHeights);
    if (frontBodyRef.current) resizeObserver.observe(frontBodyRef.current);
    if (backBodyRef.current) resizeObserver.observe(backBodyRef.current);

    window.addEventListener("resize", measureHeights);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureHeights);
    };
  }, [card?.question, card?.answer, status]);

  return (
    <div
      className={`card ${flipped ? "flipped" : ""} ${status} ${flashStatus || ""}`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="card-inner" style={{ height: `${cardHeight}px` }}>
        <div className="face front">
          <div className="card-accent" />
          <div className="face-front-body" ref={frontBodyRef}>
            {status !== "unanswered" && <span className={`badge ${status}`}>{status}</span>}
            <div className="card-face-label">Question</div>
            <div className="card-text"><MarkdownRenderer content={card?.question} /></div>
            <span className="flip-hint">click to flip</span>
          </div>
        </div>

        <div className="face back">
          <div className="card-accent" />
          <div className="face-back-body" ref={backBodyRef}>
            {status !== "unanswered" && <span className={`badge ${status}`}>{status}</span>}
            <div className="card-face-label">Answer</div>
            <div className="card-text"><MarkdownRenderer content={card?.answer} /></div>
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
