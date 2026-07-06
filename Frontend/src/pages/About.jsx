import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const cardStyle = {
    position: "relative",
    background:
      "linear-gradient(180deg, rgba(18,28,24,0.88), rgba(10,16,14,0.88))",
    borderRadius: 22,
    padding: "36px 42px",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  };

  const glowStyle = {
    position: "absolute",
    inset: -1,
    borderRadius: "inherit",
    background:
      "radial-gradient(160px 160px at 18% 12%, rgba(25,255,155,0.35), transparent 65%)",
    pointerEvents: "none",
  };

  return (
    <div
      className="about-page"
      style={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(
            to right,
            rgba(8,18,14,0.88) 0%,
            rgba(8,18,14,0.78) 38%,
            rgba(8,18,14,0.45) 55%,
            rgba(8,18,14,0.15) 70%,
            rgba(8,18,14,0.0) 85%
          ),
          url('/h2.png')
        `,
        backgroundRepeat: "repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        padding: "120px 80px",
        color: "#ecfff7",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* MAIN COLUMN */}
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          display: "flex",
          flexDirection: "column",
          gap: 90,
        }}
      >
        {/* HERO */}
        <section style={{ maxWidth: 980 }}>
          <h1
            style={{
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.6px",
            }}
          >
            Turning Agricultural Data <br />
            <span style={{ color: "#19ff9b" }}>
              into Confident Farmer Decisions
            </span>
          </h1>

          <p
            style={{
              marginTop: 28,
              fontSize: 16.5,
              lineHeight: 1.9,
              opacity: 0.95,
              maxWidth: 900,
            }}
          >
            Farmer Analytics is a full‑stack, AI‑assisted decision platform that
            converts live mandi signals and historical price patterns into
            clear, farmer‑friendly guidance. It helps users understand market
            risk, choose the right selling window, and export professional
            reports that are ready for banks, cooperatives, and planners.
          </p>

          <div
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
              maxWidth: 760,
            }}
          >
            {[
              { label: "Live Markets", value: "State → District → Crop" },
              { label: "Analytics", value: "Risk, Volatility, Trends" },
              { label: "Output", value: "HD PDF Reports" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "16px 18px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.75 }}>{stat.label}</div>
                <div style={{ marginTop: 6, fontWeight: 700 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTENT GRID */}
        <section style={{ width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 26,
            }}
          >
            {[
              {
                title: "🌱 Our Mission",
                body:
                  "Empower farmers with trustworthy market intelligence. We focus on clarity, not complexity — delivering insights that are easy to act on and hard to misinterpret.",
              },
              {
                title: "🚨 Problems We Solve",
                body: (
                  <ul>
                    <li>Unpredictable prices across seasons</li>
                    <li>Limited visibility of mandi‑level pricing</li>
                    <li>Decisions based on guesswork</li>
                    <li>High risk and low bargaining power</li>
                  </ul>
                ),
              },
              {
                title: "🧠 What the Platform Delivers",
                body: (
                  <ul>
                    <li>Income range: best & worst case</li>
                    <li>Live mandi recommendations</li>
                    <li>Peak selling day identification</li>
                    <li>Volatility & risk grading</li>
                    <li>Downloadable HD PDF reports</li>
                  </ul>
                ),
              },
              {
                title: "⚙️ How It Works",
                body: (
                  <ol>
                    <li>Secure login</li>
                    <li>Select state → district → crop → date</li>
                    <li>System merges live + historical data</li>
                    <li>Analytics compute risk, ranges, trends</li>
                    <li>Export report or take action</li>
                  </ol>
                ),
              },
              {
                title: "🧩 Project Architecture",
                body: (
                  <ul>
                    <li>React + Vite UI for a fast dashboard</li>
                    <li>Spring Boot API for analytics & auth</li>
                    <li>Live data ingestion with scheduled fetcher</li>
                    <li>Node + Puppeteer PDF engine</li>
                    <li>MySQL for historical + live prices</li>
                  </ul>
                ),
              },
              {
                title: "👥 Who It’s For",
                body: (
                  <ul>
                    <li>Farmers optimizing profit</li>
                    <li>Researchers studying markets</li>
                    <li>Agriculture & data science students</li>
                    <li>Policy makers & planners</li>
                  </ul>
                ),
              },
              {
                title: "🔎 Data & Quality",
                body:
                  "Live mandi prices are validated, normalized, and stored with timestamps. Historical data is cleaned for seasonality and volatility calculations to keep results reliable and explainable.",
              },
              {
                title: "🌍 Impact & Vision",
                body:
                  "We aim to make smart farming accessible at any scale. From smallholders to large planners, Farmer Analytics bridges the gap between raw data and confident decisions.",
              },
            ].map((sec, i) => (
              <div key={i} style={cardStyle}>
                <div style={glowStyle} />
                <h2
                  style={{
                    color: "#19ff9b",
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  {sec.title}
                </h2>
                <div
                  style={{
                    fontSize: 15.4,
                    lineHeight: 1.9,
                    opacity: 0.96,
                  }}
                >
                  {sec.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="hero-btn primary"
            onClick={() =>
              navigate(isLoggedIn ? "/select" : "/auth?mode=signup")
            }
          >
            Start Using Analytics →
          </button>

          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Go to the analytics dashboard and generate your report in seconds.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
