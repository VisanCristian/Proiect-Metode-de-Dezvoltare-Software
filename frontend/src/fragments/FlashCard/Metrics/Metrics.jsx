export default function Metrics({ known, unknown, unanswered, percent }) {
  return (
    <section className="metrics">
      <div className="metric-known">
        <div className="metric-label">Known</div>
        <div className="metric-val">{known}</div>
      </div>
      <div className="metric-unknown">
        <div className="metric-label">Unknown</div>
        <div className="metric-val">{unknown}</div>
      </div>
      <div>
        <div className="metric-label">Remaining</div>
        <div className="metric-val">{unanswered}</div>
      </div>
      <div>
        <div className="metric-label">Completed</div>
        <div className="metric-val">{percent}%</div>
      </div>
    </section>
  );
}