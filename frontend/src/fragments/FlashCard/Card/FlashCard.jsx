import { useLayoutEffect, useRef, useState, useEffect } from "react";
import MarkdownRenderer from "../../MarkdownRenderer/MarkdownRenderer";
import { evaluateFlashcardAnswer } from "../../../utils/chatbot_api";
import { incrementFlashcardPoints } from "../../../services/agents_api";

const MIN_CARD_HEIGHT = 240;
const CARD_CONTENT_BUFFER = 24;

export default function FlashCard({ card, flipped, setFlipped, status, flashStatus, mark }) {
  const [cardHeight, setCardHeight] = useState(MIN_CARD_HEIGHT);
  const frontBodyRef = useRef(null);
  const backBodyRef = useRef(null);
  const [userInput, setUserInput] = useState("");
  const [evaluating, setEvaluating] = useState(false);

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

  // Reset userInput when card changes
  useEffect(() => {
      setUserInput("");
  }, [card?.id]);

  const handleSubmit = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!userInput.trim() || evaluating) return;

      setEvaluating(true);
      let isCorrect = false;

      try {
          // Attempt to evaluate with AI
          const userDataStr = localStorage.getItem("userData");
          const userData = userDataStr ? JSON.parse(userDataStr) : null;
          const result = await evaluateFlashcardAnswer(card.question, card.answer, userInput, userData);
          isCorrect = result.correct;
      } catch (error) {
          // Fallback to strict string check
          isCorrect = userInput.trim().toLowerCase() === card.answer.trim().toLowerCase();
      }

      setEvaluating(false);
      
      // Auto mark and flip
      if (isCorrect) {
          mark("known");
          incrementFlashcardPoints().catch(() => {});
      } else {
          mark("unknown");
      }
      setFlipped(true);
  };

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
            
            <div className="flashcard-input-container" onClick={(e) => e.stopPropagation()}>
                <textarea 
                    className="flashcard-input" 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={evaluating || flipped}
                />
                <button 
                    className="flashcard-submit-btn" 
                    onClick={handleSubmit} 
                    disabled={evaluating || !userInput.trim() || flipped}
                >
                    {evaluating ? "Evaluating..." : "Submit Answer"}
                </button>
            </div>
          </div>
        </div>

        <div className="face back">
          <div className="card-accent" />
          <div className="face-back-body" ref={backBodyRef}>
            {status !== "unanswered" && <span className={`badge ${status}`}>{status}</span>}
            <div className="card-face-label">Answer</div>
            <div className="card-text"><MarkdownRenderer content={card?.answer} /></div>
            <div className="card-divider" />
            <div className="card-feedback-row">
              {status === "known" && <div style={{ color: "var(--green)", fontWeight: 600, fontSize: "1.1rem" }}>✓ Correct!</div>}
              {status === "unknown" && <div style={{ color: "var(--red)", fontWeight: 600, fontSize: "1.1rem" }}>✗ Incorrect</div>}
              {status === "unanswered" && <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No answer submitted</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
