import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { motion } from "framer-motion";

function MandiDecision({ crop, summaryData }) {
  const [data, setData] = useState(summaryData ?? null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setData(summaryData ?? null);
    setError(false);
  }, [summaryData]);

  useEffect(() => {
    if (!crop || summaryData) return;

    fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/live/mandi-summary?crop=${crop}`)
      .then(res => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [crop, summaryData]);

  if (error) {
    return (
      <div className="card mandi-decision premium">
        <h3>📍 Smart Mandi Decision</h3>
        <p style={{ color: "orange" }}>
          ⚠️ Live mandi intelligence unavailable
        </p>
      </div>
    );
  }

  if (!data) return null;

  /* ===============================
     🔮 AI SCORE (DERIVED)
  ================================ */
  const score =
    data.bestPrice && data.worstPrice
      ? Math.min(100, Math.round((data.bestPrice / (data.bestPrice + data.worstPrice)) * 100))
      : 0;

  /* ===============================
     ECHARTS OPTION
  ================================ */
  const option = {
    backgroundColor: "transparent",
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: {
          show: true,
          width: 14,
        },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [0.5, "#ff6b6b"],
              [0.8, "#ffd166"],
              [1, "#19ff9b"],
            ],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: `{value}%\nMarket Score`,
          fontSize: 18,
          fontWeight: 800,
          color: "#eafffb",
          offsetCenter: [0, "30%"],
        },
        data: [{ value: score }],
      },
    ],
  };

  return (
    <motion.div
      className="card mandi-decision premium"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="mandi-title">📍 AI-Powered Mandi Decision</h3>

      <div className="mandi-meta">
        <span>🌾 {data.crop || crop}</span>
        <span className="ai-chip">AI VERIFIED</span>
      </div>

      <ReactECharts
        option={option}
        style={{ height: "220px", width: "100%" }}
      />

      <div className="mandi-summary">
        <div className="mandi-box best">
          <span>BEST MANDI</span>
          <strong>{data.bestMandi || "N/A"}</strong>
          <small>₹{data.bestPrice || 0} / Quintal</small>
        </div>

        <div className="mandi-box worst">
          <span>AVOID</span>
          <strong>{data.worstMandi || "N/A"}</strong>
          <small>₹{data.worstPrice || 0} / Quintal</small>
        </div>
      </div>

      <div className="mandi-ai-insight">
        <span>🤖 AI Insight</span>
        <p>{data.recommendation || "No recommendation available."}</p>
      </div>
    </motion.div>
  );
}

export default MandiDecision;



