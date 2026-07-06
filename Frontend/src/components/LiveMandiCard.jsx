import { useEffect, useMemo, useState } from "react";

function LiveMandiCard({ crop, summaryData }) {
  const [data, setData] = useState(summaryData ?? null);

  useEffect(() => {
    setData(summaryData ?? null);
  }, [summaryData]);

  useEffect(() => {
    if (!crop || summaryData) return;

    fetch(`http://localhost:8080/api/live/mandi-summary?crop=${crop}`)
      .then(res => res.json())
      .then(json => setData(json));
  }, [crop, summaryData]);

  const noData = data?.bestPrice === 0;

  const priceSpread = useMemo(() => {
    const best = Number(data?.bestPrice);
    const worst = Number(data?.worstPrice);
    if (!Number.isFinite(best) || !Number.isFinite(worst)) return null;

    const diff = best - worst;
    const pct = worst !== 0 ? (diff / worst) * 100 : 0;

    return {
      diff,
      pct,
    };
  }, [data]);

  if (!data) return null;

  return (
    <div className="card mandi-card premium">

      <div className="mandi-header">
        <h3>📍 Best Mandi Today</h3>
        <span className="mandi-sub">Today’s live mandi snapshot</span>
      </div>

      <div className="mandi-meta">
        <span className="crop-chip">
          🌾 {data.crop}
        </span>

        {data.date && (
          <span className="date-chip">
            📅 {data.date}
          </span>
        )}
      </div>

      {noData ? (
        <div className="mandi-empty">
          No mandi data available for today.
        </div>
      ) : (
        <>
          <div className="mandi-price-grid">
            <div className="mandi-box best">
              <span className="label">Best Price</span>
              <strong>₹{data.bestPrice}</strong>
              <span className="unit">per Quintal</span>
              <span className="location">{data.bestMandi}</span>
            </div>

            <div className="mandi-box worst">
              <span className="label">Lowest Price</span>
              <strong>₹{data.worstPrice}</strong>
              <span className="unit">per Quintal</span>
              <span className="location">{data.worstMandi}</span>
            </div>
          </div>

          {priceSpread && (
            <div className="mandi-spread">
              <div>
                <span className="label">Edge vs lowest</span>
                <strong>
                  ₹{Number.isFinite(priceSpread.diff) ? priceSpread.diff.toFixed(0) : "--"}
                </strong>
                <small>
                  (+{Number.isFinite(priceSpread.pct) ? priceSpread.pct.toFixed(1) : "--"}%)
                </small>
              </div>
              <div>
                <span className="label">Recommendation</span>
                <strong>Sell at {data.bestMandi}</strong>
                <small>Skip {data.worstMandi} today</small>
              </div>
            </div>
          )}

          <div className="mandi-advice">
            <span className="advice-label">💡 Selling Insight</span>
            <p>{data.recommendation}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default LiveMandiCard;
