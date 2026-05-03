export default function CreateForm({ q, a, setQ, setA, addCard }) {
  return (
    <form className="create-form" onSubmit={addCard}>
      <input placeholder="Question" value={q} onChange={(e) => setQ(e.target.value)} />
      <textarea placeholder="Answer" value={a} onChange={(e) => setA(e.target.value)} />
      <button type="submit">Add card</button>
    </form>
  );
}