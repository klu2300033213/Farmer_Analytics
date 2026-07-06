import ReactECharts from "echarts-for-react";

function PriceChart({ selectedCrop, trend = [] }) {

  if (!trend || trend.length === 0) {
    return (
      <div className="card premium">
        <h3>📈 Market Price Trend</h3>
        <p>No trend data available.</p>
      </div>
    );
  }

  const dates = trend.map(d => d[0]);
  const prices = trend.map(d => d[1]);

  const option = {
    backgroundColor: "transparent",
    animation: true,
    animationDuration: 1500,
    animationEasing: "cubicOut",

    title: {
      text: "Market Price Trend",
      subtext: `${selectedCrop} · ₹ per Quintal`,
      left: "center",
      top: 10,
      textStyle: {
        color: "#eafffb",
        fontSize: 18,
        fontWeight: 600,
      },
      subtextStyle: {
        color: "#9beee0",
        fontSize: 12,
      },
    },

    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10,20,25,0.95)",
      borderColor: "rgba(0,255,200,0.4)",
      borderWidth: 1,
      textStyle: {
        color: "#eafffb",
      },
      formatter: (params) => {
        const p = params[0];
        return `
          <b>${p.axisValue}</b><br/>
          Price: ₹${p.value} / Quintal
        `;
      },
    },

    grid: {
      left: 60,
      right: 40,
      top: 90,
      bottom: 60,
    },

    xAxis: {
      type: "category",
      data: dates,
      axisLine: {
        lineStyle: { color: "rgba(0,255,200,0.35)" },
      },
      axisLabel: {
        color: "#bff6ec",
        rotate: 30,
        fontSize: 11,
      },
    },

    yAxis: {
      type: "value",
      axisLabel: {
        color: "#d6fff6",
        formatter: "₹{value}",
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
        name: "Price",
        type: "line",
        data: prices,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 4,
          color: "#19ff9b",
        },
        itemStyle: {
          color: "#19ff9b",
          shadowBlur: 20,
          shadowColor: "rgba(25,255,155,0.7)",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(25,255,155,0.35)" },
              { offset: 1, color: "rgba(25,255,155,0.02)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="card premium hud-chart-card">
      <ReactECharts
        option={option}
        style={{ height: "420px", width: "100%" }}
      />

      <p style={{ marginTop: "10px", color: "#9beee0", fontSize: "13px" }}>
        👉 Higher curve = better selling opportunity
      </p>
    </div>
  );
}

export default PriceChart;
