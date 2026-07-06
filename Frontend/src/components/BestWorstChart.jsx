import React from "react";
import ReactECharts from "echarts-for-react";

function BestWorstChart({ result }) {
  const best = Number(result?.bestCaseIncome);
  const worst = Number(result?.worstCaseIncome);

  if (!Number.isFinite(best) || !Number.isFinite(worst)) return null;
  if (best <= 0 && worst <= 0) return null;

  const option = {
    backgroundColor: "transparent",
    animation: true,
    animationDuration: 1200,
    animationEasing: "cubicOut",

    title: {
      text: "Best vs Worst Case Income",
      subtext: "per acre · per season (est. 1 acre)",
      left: "center",
      top: 10,
      textStyle: {
        color: "#e8fdf8",
        fontSize: 18,
        fontWeight: 600,
      },
      subtextStyle: {
        color: "#7fdad0",
        fontSize: 12,
      },
    },

    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(10,20,25,0.95)",
      borderColor: "rgba(0,255,200,0.35)",
      borderWidth: 1,
      textStyle: {
        color: "#e0fff9",
        fontSize: 13,
      },
      formatter: (p) => `
        <b>${p.name}</b><br/>
        Income: ₹${p.value.toLocaleString()}<br/>
        <span style="opacity:.7">per acre · per season (est. 1 acre)</span>
      `,
    },

    grid: {
      left: 80,
      right: 40,
      top: 90,
      bottom: 55,
    },

    xAxis: {
      type: "category",
      data: ["Worst Case", "Best Case"],
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "rgba(0,255,200,0.35)",
        },
      },
      axisLabel: {
        color: "#bff6ec",
        fontSize: 12,
        fontWeight: 500,
      },
    },

    yAxis: {
      type: "value",
      name: "Income (₹ per acre / season)",
      nameLocation: "middle",
      nameGap: 55,
      nameTextStyle: {
        color: "#9beee0",
        fontSize: 12,
        fontWeight: 500,
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#d6fff6",
        formatter: (v) => `₹${(v / 1000).toFixed(0)}k`,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.06)",
          type: "dashed",
        },
      },
    },

    series: [
      {
        type: "bar",
        barWidth: 76,
        data: [
          {
            value: worst,
            itemStyle: {
              borderRadius: [14, 14, 0, 0],
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#ff6b6b" },
                  { offset: 1, color: "#7a0000" },
                ],
              },
              shadowBlur: 30,
              shadowColor: "rgba(255,90,90,0.55)",
            },
          },
          {
            value: best,
            itemStyle: {
              borderRadius: [14, 14, 0, 0],
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#19ff9b" },
                  { offset: 1, color: "#0a3d2a" },
                ],
              },
              shadowBlur: 30,
              shadowColor: "rgba(0,255,180,0.6)",
            },
          },
        ],
        label: {
          show: true,
          position: "top",
          color: "#eafffb",
          fontSize: 13,
          fontWeight: 600,
          formatter: (p) => `₹${p.value.toLocaleString()}`,
        },
        emphasis: {
          scale: true,
        },
      },
    ],
  };

  return (
    <div className="card hud-chart-card">
      <ReactECharts
        option={option}
        style={{ height: "360px", width: "100%" }}
      />
    </div>
  );
}

export default BestWorstChart;
