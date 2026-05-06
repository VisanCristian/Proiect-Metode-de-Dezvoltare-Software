export default function TopBar({ sets, setId, showForm, handleSetChange, setShowForm, setShowUploadModal }) {
  return (
    <header className="topbar">
      <div className="group">
        <label className="topbar-label">Deck</label>
        <select value={setId} onChange={handleSetChange}>
          {sets.length === 0 && <option value="">No deck</option>}
          {sets.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>
      <div className="group" style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
          + Add Deck
        </button>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ Create card"}
        </button>
      </div>
    </header>
  );
}
