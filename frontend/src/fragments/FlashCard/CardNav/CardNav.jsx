export default function CardNav({ index, cards, prev, next, shuffleCards, fetchRecommendations }) {
  return (
    <>
      <div className="card-counter">
        {cards.length ? `${index + 1} / ${cards.length}` : "0 / 0"}
      </div>
      <div className="actions">
        <button className="btn-nav" onClick={prev} disabled={index === 0}>← Previous</button>
        <button className="btn-nav" onClick={next} disabled={index === cards.length - 1}>Next →</button>
      </div>
      <div className="actions">
        <button className="btn-shuffle" onClick={shuffleCards}>⇄ Shuffle cards</button>
        <button className="btn-shuffle" onClick={fetchRecommendations}>★ Recommendations</button>
      </div>
    </>
  );
}