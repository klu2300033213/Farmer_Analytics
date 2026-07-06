import { useState, useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider";

/* ─────────────────────────────────────────────
   DATA: CROP SEASONAL CALENDAR
───────────────────────────────────────────── */
const SEASONAL_CALENDAR = [
  { crop: "Wheat", emoji: "🌾", kharif: false, rabi: true, zaid: false, sow: [10, 11], harvest: [3, 4], states: "Punjab, Haryana, UP, MP", water: "Medium", tip: "Sow after temperature drops below 25°C. Ideal temp: 10–15°C." },
  { crop: "Rice (Paddy)", emoji: "🍚", kharif: true, rabi: false, zaid: false, sow: [6, 7], harvest: [10, 11], states: "West Bengal, UP, Punjab, AP", water: "High", tip: "Transplant in standing water. Needs 1200–1500mm rainfall or irrigation." },
  { crop: "Cotton", emoji: "☁️", kharif: true, rabi: false, zaid: false, sow: [4, 5], harvest: [10, 12], states: "Gujarat, Maharashtra, AP, Telangana", water: "Medium", tip: "Deep-rooted crop. Avoid waterlogging. Needs 6–8 months warm season." },
  { crop: "Maize", emoji: "🌽", kharif: true, rabi: false, zaid: true, sow: [6, 7], harvest: [9, 10], states: "Karnataka, UP, Bihar, Rajasthan", water: "Medium", tip: "Fast-growing crop. Plant when soil temp is 18°C+. High yield with drip irrigation." },
  { crop: "Soybean", emoji: "🫘", kharif: true, rabi: false, zaid: false, sow: [6, 7], harvest: [9, 10], states: "MP, Maharashtra, Rajasthan", water: "Medium", tip: "Nitrogen-fixing legume. Improves soil health. Avoid acidic soils." },
  { crop: "Groundnut", emoji: "🥜", kharif: true, rabi: false, zaid: true, sow: [6, 7], harvest: [9, 11], states: "Gujarat, AP, Tamil Nadu", water: "Low", tip: "Requires well-drained sandy loam. Avoid flooding after pod formation." },
  { crop: "Tomato", emoji: "🍅", kharif: false, rabi: true, zaid: true, sow: [10, 11], harvest: [1, 3], states: "UP, AP, Karnataka, HP", water: "High", tip: "Needs consistent moisture. Stake plants when 25cm tall. Monitor for blight." },
  { crop: "Onion", emoji: "🧅", kharif: false, rabi: true, zaid: false, sow: [10, 11], harvest: [3, 4], states: "Maharashtra, Gujarat, Rajasthan, Karnataka", water: "Medium", tip: "Avoid excessive nitrogen late in season. Reduce irrigation 2 weeks before harvest." },
  { crop: "Potato", emoji: "🥔", kharif: false, rabi: true, zaid: false, sow: [10, 11], harvest: [1, 3], states: "UP, West Bengal, Punjab, Gujarat", water: "High", tip: "Ideal temp 15–20°C. Hill up soil around stems when 15cm tall." },
  { crop: "Chilli", emoji: "🌶️", kharif: true, rabi: false, zaid: false, sow: [6, 7], harvest: [10, 12], states: "AP, Telangana, Karnataka, MP", water: "Medium", tip: "Mulch to retain soil moisture. Sensitive to waterlogging. Watch for thrips." },
  { crop: "Sugarcane", emoji: "🎋", kharif: true, rabi: false, zaid: false, sow: [2, 3], harvest: [11, 3], states: "UP, Maharashtra, Tamil Nadu, Karnataka", water: "Very High", tip: "Long-duration crop (12–18 months). Plant setts at 45° angle. Heavy feeder." },
  { crop: "Mustard", emoji: "🌼", kharif: false, rabi: true, zaid: false, sow: [10, 11], harvest: [2, 3], states: "Rajasthan, UP, MP, Haryana", water: "Low", tip: "Drought-tolerant oilseed crop. Responds well to phosphorus and sulfur." },
];

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ─────────────────────────────────────────────
   DATA: SOIL TYPES
───────────────────────────────────────────── */
const SOIL_TYPES = [
  {
    id: "alluvial",
    name: "Alluvial Soil",
    emoji: "🟤",
    color: "#b45309",
    bg: "rgba(180,83,9,0.12)",
    states: "UP, Bihar, West Bengal, Punjab, Haryana, Assam",
    description: "Most fertile soil type in India. Rich in minerals, found in river plains. Excellent for most crops.",
    bestCrops: ["Wheat", "Rice", "Sugarcane", "Pulses", "Vegetables"],
    ph: "6.5 – 8.4",
    nitrogen: "Low to Medium",
    phosphorus: "Adequate",
    tips: ["Add organic matter to improve structure", "Zinc deficiency common — apply ZnSO4", "Good drainage crucial during monsoon"],
  },
  {
    id: "black",
    name: "Black (Regur) Soil",
    emoji: "⚫",
    color: "#1e293b",
    bg: "rgba(30,41,59,0.3)",
    states: "Maharashtra, Gujarat, MP, Telangana, AP, Karnataka",
    description: "Highly water-retentive clayey soil. Self-ploughing nature. Rich in calcium, magnesium, and iron.",
    bestCrops: ["Cotton", "Soybean", "Jowar", "Sunflower", "Linseed"],
    ph: "7.2 – 8.5",
    nitrogen: "Medium",
    phosphorus: "Low",
    tips: ["Avoid over-irrigation — poor drainage", "Phosphate fertilizer needed", "Work soil only at optimum moisture level"],
  },
  {
    id: "red",
    name: "Red & Yellow Soil",
    emoji: "🔴",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.12)",
    states: "Tamil Nadu, Karnataka, AP, Odisha, Chhattisgarh",
    description: "Porous and well-draining. Deficient in nitrogen, phosphorus, and organic matter. Needs heavy amendments.",
    bestCrops: ["Groundnut", "Millets", "Pulses", "Tobacco", "Potato"],
    ph: "6.0 – 7.5",
    nitrogen: "Low",
    phosphorus: "Low",
    tips: ["Add farmyard manure liberally", "Apply phosphate and nitrogen fertilizers", "Mulching reduces moisture loss significantly"],
  },
  {
    id: "laterite",
    name: "Laterite Soil",
    emoji: "🟠",
    color: "#ea580c",
    bg: "rgba(234,88,12,0.12)",
    states: "Kerala, Karnataka, Odisha, West Bengal, Assam",
    description: "Leached acidic soil. Rich in iron and aluminium oxides. Poor in nitrogen and organic matter.",
    bestCrops: ["Tea", "Coffee", "Cashew", "Rubber", "Spices"],
    ph: "4.5 – 6.0",
    nitrogen: "Very Low",
    phosphorus: "Very Low",
    tips: ["Apply lime to correct acidity", "Heavy organic manuring essential", "Avoid land exposure — prone to erosion"],
  },
  {
    id: "arid",
    name: "Arid & Desert Soil",
    emoji: "🏜️",
    color: "#ca8a04",
    bg: "rgba(202,138,4,0.12)",
    states: "Rajasthan, Gujarat (arid parts), Haryana (dry zones)",
    description: "Sandy, low in organic matter and moisture. High in soluble salts. Requires heavy irrigation.",
    bestCrops: ["Bajra", "Barley", "Mustard", "Moth Bean", "Guar"],
    ph: "7.5 – 8.5",
    nitrogen: "Very Low",
    phosphorus: "Low",
    tips: ["Drip irrigation for best efficiency", "Green manuring with dhaincha or sunhemp", "Wind breaks essential to prevent erosion"],
  },
  {
    id: "forest",
    name: "Forest & Mountain Soil",
    emoji: "🌲",
    color: "#15803d",
    bg: "rgba(21,128,61,0.12)",
    states: "Himachal Pradesh, Uttarakhand, Northeast India, J&K",
    description: "Rich in organic matter in forest cover. Loamy to clayey texture. Well-drained on slopes.",
    bestCrops: ["Apple", "Pear", "Tea", "Cardamom", "Ginger"],
    ph: "5.0 – 6.5",
    nitrogen: "High (under forest cover)",
    phosphorus: "Variable",
    tips: ["Avoid deforestation — leads to erosion", "Terracing for slope farming", "Organic farming particularly effective here"],
  },
];

/* ─────────────────────────────────────────────
   DATA: FARMING TECHNIQUES
───────────────────────────────────────────── */
const TECHNIQUES = [
  { icon: "💧", title: "Drip Irrigation", tag: "Water Saving", color: "#3b82f6", desc: "Delivers water directly to root zone through emitters. Reduces water use by 40–60% vs flood irrigation. Ideal for vegetables, orchards, and sugarcane.", benefits: ["40–60% water savings", "Reduced weed growth", "Prevents fungal diseases", "Supports fertigation"], crops: "Sugarcane, Grapes, Tomato, Chilli, Banana" },
  { icon: "🌿", title: "Mulching", tag: "Soil Health", color: "#22c55e", desc: "Cover soil with organic or plastic material to retain moisture, regulate temperature, and suppress weeds. One of the most cost-effective field practices.", benefits: ["Retains soil moisture", "Controls weeds naturally", "Regulates soil temperature", "Adds organic matter (organic mulch)"], crops: "Tomato, Potato, Strawberry, Vegetables, Orchards" },
  { icon: "🔄", title: "Crop Rotation", tag: "Soil Fertility", color: "#a855f7", desc: "Alternating different crops in the same field across seasons. Breaks pest and disease cycles, improves soil structure, reduces fertilizer dependency.", benefits: ["Breaks pest/disease cycles", "Improves soil nitrogen (with legumes)", "Reduces chemical inputs", "Improves soil structure"], crops: "Wheat → Paddy → Legumes → Vegetables" },
  { icon: "🌱", title: "Organic Farming", tag: "Sustainable", color: "#f59e0b", desc: "Farming without synthetic chemicals. Uses compost, green manure, biological pest control. Produces premium-priced crops with better soil long-term.", benefits: ["No chemical residues", "Premium price for produce", "Better soil long-term", "Eco-friendly & sustainable"], crops: "All vegetables, pulses, spices, fruits" },
  { icon: "🪱", title: "Vermicomposting", tag: "Organic Input", color: "#84cc16", desc: "Using earthworms to decompose organic waste into rich compost. Produces nutrient-rich vermicompost 3–4× more nutritious than regular compost.", benefits: ["Rich in NPK + micronutrients", "Improves soil structure", "Low cost input", "Reduces farm waste"], crops: "Vegetables, flowers, nursery plants" },
  { icon: "🌾", title: "Integrated Pest Management", tag: "IPM", color: "#06b6d4", desc: "Combines biological, cultural, and chemical methods to manage pests with minimum environmental impact. Reduces pesticide usage by 30–50%.", benefits: ["Reduces pesticide cost", "Preserves beneficial insects", "Prevents resistance buildup", "Safer food production"], crops: "Cotton, Paddy, Vegetables, Pulses" },
  { icon: "🏡", title: "Intercropping", tag: "Land Efficiency", color: "#f97316", desc: "Growing two or more crops simultaneously in the same field. Maximizes land use, provides insurance against single-crop failure.", benefits: ["Better land utilization", "Reduces risk of total crop failure", "Adds diversity to income", "Improves soil health"], crops: "Maize + Soybean, Cotton + Moong, Sorghum + Groundnut" },
  { icon: "🌊", title: "Rainwater Harvesting", tag: "Water Conservation", color: "#0ea5e9", desc: "Collecting and storing rainwater for later use in irrigation. Farm ponds, check dams, and contour bunding are popular techniques in India.", benefits: ["Reduces dependency on groundwater", "Water available in dry spells", "Recharges groundwater table", "Low-cost once built"], crops: "All crops in water-scarce regions" },
];

/* ─────────────────────────────────────────────
   DATA: CLIMATE RISK BY STATE
───────────────────────────────────────────── */
const CLIMATE_RISK = [
  { state: "Rajasthan", drought: 90, flood: 10, heatwave: 95, frost: 5, primary: "Drought + Heatwave" },
  { state: "Maharashtra", drought: 70, flood: 55, heatwave: 65, frost: 5, primary: "Drought + Unseasonal Rain" },
  { state: "UP", drought: 40, flood: 75, heatwave: 60, frost: 25, primary: "Flooding + Winter Fog" },
  { state: "Bihar", drought: 30, flood: 85, heatwave: 45, frost: 20, primary: "Flooding" },
  { state: "Punjab", drought: 35, flood: 40, heatwave: 50, frost: 30, primary: "Waterlogging + Wheat Blast" },
  { state: "Gujarat", drought: 65, flood: 45, heatwave: 80, frost: 5, primary: "Drought + Cyclone" },
  { state: "Kerala", drought: 20, flood: 80, heatwave: 30, frost: 0, primary: "Flooding + Landslides" },
  { state: "Tamil Nadu", drought: 55, flood: 60, heatwave: 60, frost: 0, primary: "Cyclone + Unseasonal Rain" },
  { state: "AP", drought: 50, flood: 65, heatwave: 70, frost: 0, primary: "Cyclone + Drought" },
  { state: "Karnataka", drought: 60, flood: 50, heatwave: 55, frost: 5, primary: "Drought" },
  { state: "Odisha", drought: 40, flood: 80, heatwave: 60, frost: 5, primary: "Cyclone + Flooding" },
  { state: "West Bengal", drought: 25, flood: 80, heatwave: 40, frost: 10, primary: "Flooding + Cyclone" },
];

/* ─────────────────────────────────────────────
   DATA: CROP DISEASE BULLETIN
───────────────────────────────────────────── */
const DISEASE_BULLETIN = [
  { crop: "Rice", disease: "Brown Plant Hopper", severity: "High", season: "Kharif 2025", region: "South India, UP", symptoms: "Yellowing at base, plant drying ('hopper burn')", action: "Apply Dinotefuran 20% SG — 80g/acre. Drain water from field temporarily." },
  { crop: "Wheat", disease: "Yellow Rust", severity: "Medium", season: "Rabi 2025–26", region: "Punjab, Haryana, HP", symptoms: "Yellow-orange pustules in stripes on leaves", action: "Apply Propiconazole 25% EC — 200ml/acre. Monitor weekly." },
  { crop: "Cotton", disease: "Pink Bollworm", severity: "High", season: "Kharif 2025", region: "Gujarat, Maharashtra, Telangana", symptoms: "Entry holes in bolls, damaged fibers, pink larvae", action: "Apply Emamectin Benzoate 5% SG — 88g/acre. Use pheromone traps." },
  { crop: "Tomato", disease: "Early Blight", severity: "Medium", season: "Rabi 2025–26", region: "AP, Karnataka, Maharashtra", symptoms: "Dark concentric ring spots on lower leaves", action: "Apply Mancozeb 75% WP — 600g/acre. Remove infected leaves immediately." },
  { crop: "Groundnut", disease: "Tikka Disease (Leaf Spot)", severity: "Medium", season: "Kharif 2025", region: "Gujarat, AP, Tamil Nadu", symptoms: "Circular spots with yellow halo on leaves", action: "Apply Carbendazim 50% WP — 200g/acre at 20 DAS. Repeat at 40 DAS." },
  { crop: "Chilli", disease: "Thrips & Mite Attack", severity: "High", season: "Ongoing", region: "AP, Telangana, Karnataka", symptoms: "Leaf curling, bronzing, distortion of new leaves", action: "Apply Spiromesifen 240 SC — 200ml/acre. Avoid overhead irrigation." },
];

/* ─────────────────────────────────────────────
   RESEARCH SECTION: ORIGINAL CONTENT (ENHANCED)
───────────────────────────────────────────── */
const RESEARCH_SECTIONS = [
  { title: "🎯 Problem Statement", body: ["Farmers often sell based on guesswork due to limited visibility of mandi-level price signals.", "Prices vary by season, location, and demand — decisions without analytics increase risk.", "Our goal: convert raw market data into clear actions: when to sell and where to sell."] },
  { title: "✅ Research Objectives", body: ["Provide reliable live mandi price visibility for accurate decision-making.", "Estimate income ranges (best/worst case) from user inputs and ML predictions.", "Identify trends and high-opportunity selling days using historical data.", "Generate explainable recommendations — not black-box output.", "Export a professional PDF report for documentation and record-keeping."] },
  { title: "📚 Literature Survey", body: ["Agricultural DSS focuses on clarity, trust, and usability over raw model complexity.", "Market intelligence tools combine live prices with historical patterns to reduce uncertainty.", "Explainability (why a recommendation is made) improves farmer adoption vs pure forecasting.", "Data quality, latency, and regional coverage are key limitations in real-world deployments."] },
  { title: "🧠 Methodology", body: ["Data cleaning + normalization: units, missing fields, duplicate records.", "Trend extraction: price series over time for the selected crop.", "Risk signals: volatility-style indicators based on price variation history.", "Decision outputs: best/worst income ranges + mandi suggestions.", "ML retraining: automated model retraining every 6 hours from latest data."] },
  { title: "🧪 Evaluation Approach", body: ["Consistency checks: verify results match live market tables and selected filters.", "Robustness: handle missing data gracefully and still guide the farmer.", "Usability: present recommendations with a clear reason and simple wording.", "Performance: cache and reuse repeated queries where appropriate."] },
  { title: "⚠️ Limitations & Future Scope", body: ["Live data may be delayed or unavailable for some regions on some days.", "Future: improve forecasting models, add weather-crop integration, logistics advisory.", "Future: larger datasets and improved cross-state comparison analytics.", "Future: voice-based interface in regional languages (Hindi, Kannada, Telugu, Tamil)."] },
];

export default function Research() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("seasonal");
  const [selectedSoil, setSelectedSoil] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [soilSearch, setSoilSearch] = useState("");

  const TABS = [
    { id: "seasonal", label: t("research.tabSeasonal") },
    { id: "soil", label: t("research.tabSoil") },
    { id: "techniques", label: t("research.tabTechniques") },
    { id: "climate", label: t("research.tabClimate") },
    { id: "bulletin", label: t("research.tabBulletin") },
    { id: "research", label: t("research.tabResearch") },
  ];

  const filteredCalendar = useMemo(() => {
    if (seasonFilter === "kharif") return SEASONAL_CALENDAR.filter((c) => c.kharif);
    if (seasonFilter === "rabi") return SEASONAL_CALENDAR.filter((c) => c.rabi);
    if (seasonFilter === "zaid") return SEASONAL_CALENDAR.filter((c) => c.zaid);
    return SEASONAL_CALENDAR;
  }, [seasonFilter]);

  const filteredSoils = useMemo(() => {
    if (!soilSearch.trim()) return SOIL_TYPES;
    return SOIL_TYPES.filter((s) =>
      s.name.toLowerCase().includes(soilSearch.toLowerCase()) ||
      s.states.toLowerCase().includes(soilSearch.toLowerCase())
    );
  }, [soilSearch]);

  return (
    <div className="research-hub-page">
      {/* ── HERO HEADER ── */}
      <div className="research-hero">
        <div className="research-hero-glow" />
        <div className="research-hero-inner">
          <div className="research-hero-badge">{t("research.badge")}</div>
          <h1 className="research-hero-title">
            {t("research.title")}<br />
            <span className="research-hero-accent">{t("research.titleAccent")}</span>
          </h1>
          <p className="research-hero-subtitle">
            {t("research.subtitle")}
          </p>
          <div className="research-hero-stats">
            <div className="rh-stat"><span className="rh-stat-num">12</span><span className="rh-stat-lbl">{t("research.cropsCovered")}</span></div>
            <div className="rh-stat"><span className="rh-stat-num">6</span><span className="rh-stat-lbl">{t("research.soilTypes")}</span></div>
            <div className="rh-stat"><span className="rh-stat-num">8</span><span className="rh-stat-lbl">{t("research.techniques")}</span></div>
            <div className="rh-stat"><span className="rh-stat-num">12</span><span className="rh-stat-lbl">{t("research.statesRiskMapped")}</span></div>
          </div>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div className="research-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`research-tab-btn ${activeTab === tab.id ? "research-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="research-tab-content">

        {/* ══════════════════════════════════════
            TAB 1: SEASONAL CALENDAR
        ══════════════════════════════════════ */}
        {activeTab === "seasonal" && (
          <div className="research-section-wrap">
            <div className="research-content-header">
              <div>
                <h2>{t("research.seasonalTitle")}</h2>
                <p>{t("research.seasonalDesc")}</p>
              </div>
              <div className="calendar-filters">
                {["all", "kharif", "rabi", "zaid"].map((f) => (
                  <button
                    key={f}
                    className={`cal-filter-btn ${seasonFilter === f ? "cal-filter-active" : ""}`}
                    onClick={() => setSeasonFilter(f)}
                  >
                    {f === "all" ? t("research.allSeasons") : t(`research.${f}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="seasonal-legend">
              <span className="legend-sow">{t("research.legendSow")}</span>
              <span className="legend-grow">{t("research.legendGrow")}</span>
              <span className="legend-harvest">{t("research.legendHarvest")}</span>
              <span className="legend-off">{t("research.legendOff")}</span>
            </div>

            <div className="seasonal-table-wrap">
              <div className="seasonal-table">
                {/* Header Row */}
                <div className="seasonal-row seasonal-header-row">
                  <div className="seasonal-crop-col">{t("research.crop")}</div>
                  {MONTHS_SHORT.map((m) => (
                    <div key={m} className="seasonal-month-col">{m}</div>
                  ))}
                  <div className="seasonal-info-col">{t("research.water")}</div>
                </div>
                {/* Data Rows */}
                {filteredCalendar.map((crop) => (
                  <div key={crop.crop} className="seasonal-row">
                    <div className="seasonal-crop-col">
                      <span className="crop-emoji">{crop.emoji}</span>
                      <span className="crop-name">{crop.crop}</span>
                      <div className="crop-states">{crop.states}</div>
                    </div>
                    {MONTHS_SHORT.map((_, idx) => {
                      const month = idx + 1;
                      const isSow = crop.sow.includes(month);
                      const isHarvest = crop.harvest.includes(month);
                      const sowMin = Math.min(...crop.sow);
                      const sowMax = Math.max(...crop.sow);
                      const harvMin = Math.min(...crop.harvest);
                      const harvMax = Math.max(...crop.harvest);
                      let cellClass = "seasonal-cell";
                      if (isSow) cellClass += " cell-sow";
                      else if (isHarvest) cellClass += " cell-harvest";
                      else {
                        const isGrowing =
                          (month > sowMax && month < harvMin) ||
                          (harvMin < sowMin && (month > sowMax || month < harvMin));
                        if (isGrowing) cellClass += " cell-grow";
                        else cellClass += " cell-off";
                      }
                      return (
                        <div key={idx} className={cellClass} title={isSow ? "Sowing" : isHarvest ? "Harvest" : ""}>
                          {isSow ? "S" : isHarvest ? "H" : ""}
                        </div>
                      );
                    })}
                    <div className="seasonal-info-col">
                      <span className={`water-badge water-${crop.water.toLowerCase().replace(" ", "-")}`}>{crop.water}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="seasonal-tips-grid">
              {filteredCalendar.slice(0, 6).map((crop) => (
                <div key={crop.crop} className="seasonal-tip-card">
                  <div className="stc-header">
                    <span>{crop.emoji}</span>
                    <span>{crop.crop}</span>
                  </div>
                  <p className="stc-tip">💡 {crop.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB 2: SOIL GUIDE
        ══════════════════════════════════════ */}
        {activeTab === "soil" && (
          <div className="research-section-wrap">
            <div className="research-content-header">
              <div>
                <h2>{t("research.soilTitle")}</h2>
                <p>{t("research.soilDesc")}</p>
              </div>
              <input
                className="research-search-input"
                type="text"
                placeholder={t("research.soilSearch")}
                value={soilSearch}
                onChange={(e) => setSoilSearch(e.target.value)}
              />
            </div>

            <div className="soil-grid">
              {filteredSoils.map((soil) => (
                <div
                  key={soil.id}
                  className={`soil-card ${selectedSoil?.id === soil.id ? "soil-card-active" : ""}`}
                  style={{ borderColor: selectedSoil?.id === soil.id ? soil.color : "rgba(255,255,255,0.08)" }}
                  onClick={() => setSelectedSoil(selectedSoil?.id === soil.id ? null : soil)}
                >
                  <div className="soil-card-emoji">{soil.emoji}</div>
                  <div className="soil-card-name" style={{ color: soil.color }}>{soil.name}</div>
                  <div className="soil-card-states">📍 {soil.states}</div>
                  <div className="soil-card-ph">pH: {soil.ph}</div>
                  <div className="soil-card-expand">
                    {selectedSoil?.id === soil.id ? t("research.hideDetails") : t("research.viewDetails")}
                  </div>
                </div>
              ))}
            </div>

            {selectedSoil && (
              <div className="soil-detail-panel" style={{ borderColor: selectedSoil.color + "66", background: selectedSoil.bg }}>
                <div className="soil-detail-header">
                  <span className="soil-detail-emoji">{selectedSoil.emoji}</span>
                  <div>
                    <h3 style={{ color: selectedSoil.color }}>{selectedSoil.name}</h3>
                    <p>{selectedSoil.description}</p>
                  </div>
                </div>
                <div className="soil-detail-grid">
                  <div className="soil-detail-block">
                    <div className="sdb-title">{t("research.nutrientProfile")}</div>
                    <div className="sdb-row"><span>{t("research.phRange")}</span><span>{selectedSoil.ph}</span></div>
                    <div className="sdb-row"><span>{t("research.nitrogen")}</span><span>{selectedSoil.nitrogen}</span></div>
                    <div className="sdb-row"><span>{t("research.phosphorus")}</span><span>{selectedSoil.phosphorus}</span></div>
                  </div>
                  <div className="soil-detail-block">
                    <div className="sdb-title">{t("research.bestCrops")}</div>
                    <div className="sdb-crops">
                      {selectedSoil.bestCrops.map((c) => (
                        <span key={c} className="sdb-crop-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="soil-detail-block">
                    <div className="sdb-title">{t("research.managementTips")}</div>
                    <ul className="sdb-tips">
                      {selectedSoil.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB 3: FARMING TECHNIQUES
        ══════════════════════════════════════ */}
        {activeTab === "techniques" && (
          <div className="research-section-wrap">
            <div className="research-content-header">
              <div>
                <h2>{t("research.techniquesTitle")}</h2>
                <p>{t("research.techniquesDesc")}</p>
              </div>
            </div>
            <div className="techniques-grid">
              {TECHNIQUES.map((tech) => (
                <div key={tech.title} className="technique-card">
                  <div className="tech-card-header">
                    <span className="tech-icon" style={{ background: tech.color + "22", color: tech.color }}>{tech.icon}</span>
                    <div>
                      <div className="tech-title">{tech.title}</div>
                      <div className="tech-tag" style={{ background: tech.color + "22", color: tech.color }}>{tech.tag}</div>
                    </div>
                  </div>
                  <p className="tech-desc">{tech.desc}</p>
                  <div className="tech-benefits">
                    {tech.benefits.map((b, i) => (
                      <div key={i} className="tech-benefit-item">
                        <span style={{ color: tech.color }}>✓</span> {b}
                      </div>
                    ))}
                  </div>
                  <div className="tech-crops">
                    <span className="tech-crops-label">{t("research.bestFor")}</span> {tech.crops}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB 4: CLIMATE RISK
        ══════════════════════════════════════ */}
        {activeTab === "climate" && (
          <div className="research-section-wrap">
            <div className="research-content-header">
              <div>
                <h2>{t("research.climateTitle")}</h2>
                <p>{t("research.climateDesc")}</p>
              </div>
            </div>

            <div className="climate-risk-grid">
              {CLIMATE_RISK.map((state) => (
                <div key={state.state} className="climate-risk-card">
                  <div className="climate-risk-state">{state.state}</div>
                  <div className="climate-risk-primary">⚠️ {state.primary}</div>
                  <div className="climate-risk-bars">
                    <div className="crb-row">
                      <span className="crb-label">{t("research.drought")}</span>
                      <div className="crb-bar"><div className="crb-fill crb-drought" style={{ width: `${state.drought}%` }} /></div>
                      <span className="crb-val">{state.drought}%</span>
                    </div>
                    <div className="crb-row">
                      <span className="crb-label">{t("research.flood")}</span>
                      <div className="crb-bar"><div className="crb-fill crb-flood" style={{ width: `${state.flood}%` }} /></div>
                      <span className="crb-val">{state.flood}%</span>
                    </div>
                    <div className="crb-row">
                      <span className="crb-label">{t("research.heatwave")}</span>
                      <div className="crb-bar"><div className="crb-fill crb-heat" style={{ width: `${state.heatwave}%` }} /></div>
                      <span className="crb-val">{state.heatwave}%</span>
                    </div>
                    <div className="crb-row">
                      <span className="crb-label">{t("research.frost")}</span>
                      <div className="crb-bar"><div className="crb-fill crb-frost" style={{ width: `${state.frost}%` }} /></div>
                      <span className="crb-val">{state.frost}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="climate-info-cards">
              <div className="climate-info-card">
                <div className="cic-icon">🌡️</div>
                <div className="cic-title">{t("research.tempRiseTitle")}</div>
                <p>{t("research.tempRiseDesc")}</p>
              </div>
              <div className="climate-info-card">
                <div className="cic-icon">💧</div>
                <div className="cic-title">{t("research.rainfallTitle")}</div>
                <p>{t("research.rainfallDesc")}</p>
              </div>
              <div className="climate-info-card">
                <div className="cic-icon">🌾</div>
                <div className="cic-title">{t("research.adaptationTitle")}</div>
                <p>{t("research.adaptationDesc")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB 5: DISEASE BULLETIN
        ══════════════════════════════════════ */}
        {activeTab === "bulletin" && (
          <div className="research-section-wrap">
            <div className="research-content-header">
              <div>
                <h2>{t("research.bulletinTitle")}</h2>
                <p>{t("research.bulletinDesc")}</p>
              </div>
              <div className="bulletin-date-tag">{t("research.bulletinSeason")}</div>
            </div>

            <div className="bulletin-list">
              {DISEASE_BULLETIN.map((b, i) => (
                <div key={i} className={`bulletin-card severity-${b.severity.toLowerCase()}`}>
                  <div className="bulletin-header">
                    <div className="bulletin-crop-tag">{b.crop}</div>
                    <div className={`bulletin-severity sev-${b.severity.toLowerCase()}`}>{b.severity} {t("research.severity")}</div>
                    <div className="bulletin-region">📍 {b.region}</div>
                    <div className="bulletin-season">📅 {b.season}</div>
                  </div>
                  <div className="bulletin-disease">🦠 {b.disease}</div>
                  <div className="bulletin-symptoms">
                    <span className="bulletin-sym-label">{t("research.symptoms")}</span> {b.symptoms}
                  </div>
                  <div className="bulletin-action">
                    <span className="bulletin-action-label">{t("research.recommendedAction")}</span> {b.action}
                  </div>
                </div>
              ))}
            </div>

            <div className="bulletin-disclaimer">
              <span>⚠️</span>
              <span>{t("research.bulletinDisclaimer")}</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB 6: RESEARCH DOCS
        ══════════════════════════════════════ */}
        {activeTab === "research" && (
          <div className="research-section-wrap">
            <div className="research-content-header">
              <div>
                <h2>{t("research.researchTitle")}</h2>
                <p>{t("research.researchDesc")}</p>
              </div>
            </div>

            <div className="research-doc-stats">
              {[
                { label: t("research.dataCoverage"), value: t("research.dataCoverageVal") },
                { label: t("research.mlModel"), value: t("research.mlModelVal") },
                { label: t("research.outputs"), value: t("research.outputsVal") },
                { label: t("research.reports"), value: t("research.reportsVal") },
              ].map((s) => (
                <div key={s.label} className="rdoc-stat">
                  <div className="rdoc-stat-val">{s.value}</div>
                  <div className="rdoc-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="research-doc-grid">
              {RESEARCH_SECTIONS.map((sec) => (
                <div key={sec.title} className="research-doc-card">
                  <div className="rdc-glow" />
                  <h3 className="rdc-title">{sec.title}</h3>
                  <ul className="rdc-list">
                    {sec.body.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <div className="research-system-arch">
              <h3>{t("research.sysArch")}</h3>
              <div className="arch-flow">
                <div className="arch-box arch-farmer">👨‍🌾 Farmer</div>
                <div className="arch-arrow">→</div>
                <div className="arch-box arch-frontend">⚛️ React Frontend</div>
                <div className="arch-arrow">→</div>
                <div className="arch-box arch-backend">☕ Spring Boot Backend</div>
                <div className="arch-arrow">→</div>
                <div className="arch-box arch-db">🗄️ MySQL + ML Engine</div>
                <div className="arch-arrow">→</div>
                <div className="arch-box arch-api">🌐 Govt Data API</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
