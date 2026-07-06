import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

function BestSellingDayCard({ crop, trend }) {
  if (!trend || trend.length === 0) return null;

  const bestIndex = trend.reduce((iMax, x, i, arr) =>
    x[1] > arr[iMax][1] ? i : iMax, 0
  );

  const best = trend[bestIndex];
  const prev = trend[bestIndex - 1];
  const next = trend[bestIndex + 1];

  const option = {
    backgroundColor: "transparent",
    animation: true,
    animationDuration: 1400,
    animationEasing: "cubicOut",

    title: {
      text: "Best Selling Day",
      subtext: crop,
      left: "center",
      top: 6,
      textStyle: {
        color: "#eafffb",
        fontSize: 18,
        fontWeight: 700,
      },
      subtextStyle: {
        color: "#7fffd4",
        fontSize: 12,
        fontWeight: 600,
      },
    },

    tooltip: {
      trigger: "item",
      formatter: `
        <b>Date:</b> ${best[0]}<br/>
        <b>Price:</b> ₹${best[1]} / Quintal
      `,
      backgroundColor: "rgba(10,20,25,0.95)",
      borderColor: "rgba(0,255,200,0.35)",
      borderWidth: 1,
      textStyle: { color: "#e0fff9" },
    },

    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: best[1] * 1.25,
        progress: {
          show: true,
          width: 18,
        },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [
                1,
                new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: "#19ff9b" },
                  { offset: 1, color: "#0a3d2a" },
                ]),
              ],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },

        detail: {
          valueAnimation: true,
          formatter: (v) => `₹${v}\nPeak Price`,
          color: "#eafffb",
          fontSize: 22,
          fontWeight: 800,
          offsetCenter: [0, "28%"],
        },

        data: [{ value: best[1] }],
      },
    ],
  };

  return (
    <div className="card best-day-card premium">

      {/* TOP CHIPS */}
      <div className="best-day-highlights">
        <span className="highlight-chip crop">🌾 {crop}</span>
        <span className="highlight-chip date">📅 {best[0]}</span>
        <span className="highlight-chip confidence">🔥 HIGH CONFIDENCE</span>
      </div>

      {/* GAUGE */}
      <ReactECharts option={option} style={{ height: "240px" }} />

      {/* 🔥 CONTEXT FILL */}
      <div className="best-day-context">

        <div className="context-box">
          <span>Before</span>
          <strong>{prev ? `₹${prev[1]}` : "—"}</strong>
        </div>

        <div className="context-box peak">
          <span>Peak</span>
          <strong>₹{best[1]}</strong>
        </div>

        <div className="context-box">
          <span>After</span>
          <strong>{next ? `₹${next[1]}` : "—"}</strong>
        </div>

      </div>

      {/* 🧠 INSIGHT */}
      <div className="best-day-insight">
        💡 This date shows a **sharp price spike** compared to surrounding days,
        indicating **strong buyer demand** and optimal selling conditions.
      </div>

      {/* 🎯 ACTION */}
      <div className="best-day-action">
        👉 <b>Action:</b> Schedule harvest release or mandi arrival close to this
        date for **maximum profit realization**.
      </div>

    </div>
  );
}

export default BestSellingDayCard;
