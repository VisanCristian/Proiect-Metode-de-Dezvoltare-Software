import { useState } from "react";
import "../PDF/uploadPdf.css";

export default function CreateDeckModal({ open, onClose, createDeck }) {
  const [title, setTitle] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      createDeck(title.trim());
      setTitle("");
      onClose();
    }
  };

  return (
    <div className="upload-modal-backdrop">
      <div className="upload-modal">
        <div className="upload-modal-header">
          <h3>Create New Deck</h3>
          <button className="upload-modal-close" onClick={onClose}>Close</button>
        </div>

        <p className="upload-modal-desc">
          Enter the name of the new flashcard deck.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="upload-modal-input" style={{ border: 'none', padding: 0 }}>
            <input 
              type="text" 
              placeholder="Deck name..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)"
              }}
              autoFocus
            />
          </div>

          <div className="upload-modal-actions">
            <button className="btn-end" type="button" onClick={onClose}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={!title.trim()}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
