import "../PDF/uploadPdf.css";

export default function RecommendationsPopup({ open, onClose, recommendedDecks, onSelectDeck }) {
  if (!open) return null;

  return (
    <div className="upload-modal-backdrop" onClick={onClose}>
      <div className="upload-modal" onClick={e => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h3>Recommended Decks</h3>
          <button className="upload-modal-close" onClick={onClose}>Close</button>
        </div>

        <p className="upload-modal-desc">
          These are the decks recommended by our algorithm based on your previous sessions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
          {recommendedDecks.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No recommendations available right now.</p>
          ) : (
            recommendedDecks.map(deck => (
              <button 
                key={deck.id}
                onClick={() => onSelectDeck(deck.id)}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--panel-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--border)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--panel-2)'}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{deck.title}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
