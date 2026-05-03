export default function TopBar({ sets, setId, showForm, ADD_NEW_VALUE, handleSetChange, setShowForm }) {
  return (
    <header className="topbar">
      <div className="group">
        <label style={{ fontSize: 13, color: "var(--accent)" }}>Set</label>
        <select value={setId} onChange={handleSetChange}>
          {sets.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          <option value={ADD_NEW_VALUE}>Add new</option>
        </select>
      </div>
      <div className="group">
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ Create card"}
        </button>
      </div>
    </header>
  );
}