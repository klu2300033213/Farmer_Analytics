function ResultCard({ result }) {
  // 🔥 VERY IMPORTANT FOR PDF
  if (!result) return null;

  const unitLabel = result.unit || "per acre · per season (est. for 1 acre)";
  const volatilityValue = Number(result.volatility);
  const volatilityDisplay = Number.isFinite(volatilityValue)
    ? volatilityValue.toFixed(2)
    : result.volatility ?? "N/A";
  const riskClass = result?.riskLevel ? result.riskLevel.toLowerCase() : "unknown";
  const riskLabel = result?.riskLevel ? `${result.riskLevel} RISK` : "RISK";

  return (
    <div className="result-card premium">

      <div className="result-top">
        <div className="title-wrap">
          <span className="icon">💰</span>
          <h2>Income Outlook</h2>
        </div>

        <span className={`risk-badge ${riskClass}`}>
          {riskLabel}
        </span>
      </div>

      <div className="primary-range">
        <span className="range-label">Expected Income Range</span>
        <div className="range-value">{result.incomeRange}</div>
        <div className="unit-label">{unitLabel}</div>
        <div className="unit-note">*Income estimate is for 1 acre per season.</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi best">
          <span>Best Case</span>
          <strong>₹{result.bestCaseIncome}</strong>
          <small>{unitLabel}</small>
        </div>

        <div className="kpi worst">
          <span>Worst Case</span>
          <strong>₹{result.worstCaseIncome}</strong>
          <small>{unitLabel}</small>
        </div>

        <div className="kpi neutral">
          <span>Volatility</span>
          <strong>
            {volatilityDisplay} ({result.volatilityLevel || ""})
          </strong>
        </div>
      </div>

      <div className="explain-block">
        <h4>Why this matters</h4>
        <p>{result.riskReason}</p>
      </div>

      <div className="action-block">
        <h4>What you should do</h4>
        <p>{result.recommendation}</p>
      </div>
    </div>
  );
}

export default ResultCard;
