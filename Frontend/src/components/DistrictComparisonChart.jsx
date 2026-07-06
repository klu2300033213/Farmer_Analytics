import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

/* ===============================
   AI HELPERS
================================ */

// Normalize value → 0–1
const normalize = (val, min, max) =>
  max === min ? 0.5 : (val - min) / (max - min);

// Fake AI confidence (stable + realistic)
const confidenceScore = (price, avg) => {
  const diff = Math.abs(price - avg) / avg;
  return Math.max(65, Math.min(95, Math.round(90 - diff * 100)));
};

function DistrictComparisonChart({ crop }) {
  const [data, setData] = useState([]);

  const normalizeData = (input) =>
    (Array.isArray(input) ? input : [])
      .filter((item) =>
        Array.isArray(item) && item.length >= 2 && Number.isFinite(Number(item[1]))
      )
      .map(([district, price]) => [String(district), Number(price)]);

  useEffect(() => {
    if (!crop) return;

    fetch(`http://localhost:8080/api/live/district-compare?crop=${crop}`)
      .then(res => res.json())
      .then(payload => setData(normalizeData(payload)))
      .catch(() => setData([]));
  }, [crop]);

  if (!Array.isArray(data) || data.length === 0) return null;

  /* ===============================
     DATA PREP
  ================================ */
  const districts = data.map(d => d[0]);
  const prices = data.map(d => d[1]);

  const avgPrice =
    prices.reduce((a, b) => a + b, 0) / prices.length;

  const max = Math.max(...prices);
  const min = Math.min(...prices);

  // Top 3 districts
  const top3 = [...data]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(d => d[0]);

  const bestDistrict = top3[0];

  /* ===============================
     SERIES WITH HEAT + GLOW
  ================================ */
  const seriesData = data.map(([district, price]) => {
    const heat = normalize(price, min, max);

    const isTop3 = top3.includes(district);

    return {
      value: price,
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `rgba(25,255,155,${0.4 + heat * 0.6})` },
            { offset: 1, color: "#0a3d2a" },
          ],
        },
        shadowBlur: isTop3 ? 30 : 12,
        shadowColor: isTop3
          ? "rgba(25,255,155,0.9)"
          : "rgba(25,255,155,0.4)",
        borderRadius: [10, 10, 0, 0],
      },
    };
  });

  /* ===============================
     ECHARTS OPTION
  ================================ */
  const option = {
    backgroundColor: "transparent",
    animation: true,
    animationDuration: 1200,

    title: {
      text: "🗺️ District Price Comparison",
      subtext: `AI Insight: Best district to sell → ${bestDistrict}`,
      left: "center",
      top: 10,
      textStyle: {
        color: "#eaffea",
        fontSize: 18,
        fontWeight: 800,
      },
      subtextStyle: {
        color: "#9cffd5",
        fontSize: 13,
        fontWeight: 600,
      },
    },

    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(8,18,16,0.95)",
      borderColor: "rgba(25,255,155,0.6)",
      borderWidth: 1,
      textStyle: { color: "#eaffea" },
      formatter: params => {
        const district = params[0].name;
        const price = params[0].value;
        const conf = confidenceScore(price, avgPrice);

        return `
          📍 <b>${district}</b><br/>
          💰 Price: ₹${price} / Quintal<br/>
          🤖 AI Confidence: <b>${conf}%</b>
        `;
      },
    },

    grid: {
      left: 80,
      right: 40,
      top: 80,
      bottom: 120,
    },

    /* 🔥 SCROLL ENABLED */
    dataZoom: [
      {
        type: "slider",
        bottom: 70,
        height: 18,
        start: 0,
        end: districts.length > 8 ? 35 : 100,
        backgroundColor: "rgba(255,255,255,0.08)",
        fillerColor: "rgba(25,255,155,0.35)",
        borderColor: "rgba(255,255,255,0.25)",
        handleStyle: {
          color: "#19ff9b",
        },
        textStyle: {
          color: "#eaffea",
        },
      },
      { type: "inside" },
    ],

    xAxis: {
      type: "category",
      data: districts,
      axisLabel: {
        color: "#ffffff",
        rotate: 30,
        fontWeight: 600,
      },
      axisLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.35)",
        },
      },
    },

    yAxis: {
      type: "value",
      axisLabel: {
        color: "#ffffff",
        formatter: v => `₹${v}`,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.08)",
          type: "dashed",
        },
      },
    },

    series: [
      {
        type: "bar",
        barWidth: 34,
        data: seriesData,
      },
    ],
  };

  return (
    <div className="card hud-chart-card district-chart-card" style={{ height: "460px" }}>
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default DistrictComparisonChart;
