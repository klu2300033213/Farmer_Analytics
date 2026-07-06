
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import FarmerForm from "./components/FarmerForm";
import ResultCard from "./components/ResultCard";
import BestWorstChart from "./components/BestWorstChart";
import PriceChart from "./components/PriceChart";
import DownloadReport from "./components/DownloadReport";
import LiveMandiCard from "./components/LiveMandiCard";
import BestSellingDayCard from "./components/BestSellingDayCard";
import DistrictComparisonChart from "./components/DistrictComparisonChart";
import MandiDecision from "./components/MandiDecision";
import About from "./pages/About";   // ✅ NEW
import Contact from "./pages/Contact";
import Research from "./pages/Research";
import Admin from "./pages/Admin";
import PesticideIntelligence from "./pages/PesticideIntelligence";
import WeatherIntelligence from "./pages/WeatherIntelligence";
import LanguageDock from "./components/LanguageDock";
import { getCurrentRole } from "./utils/auth";
import { useI18n } from "./i18n/I18nProvider";
import { localizeLabelByType, localizeStateName } from "./i18n/dataLocalization";
import "./App.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI ErrorBoundary caught", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ margin: "20px" }}>
          <h3>{this.props.title}</h3>
          <p>{this.props.body}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            {this.props.retry}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ===============================
   RESULTS PAGE
================================ */
function ResultsPage({ result, liveRows, selectedCrop, trend, selection, mandiSummary }) {
  const { t, language } = useI18n();
  const rows = Array.isArray(liveRows) ? liveRows : [];
  const uniqueRows = useMemo(() => rows.filter((row, index, arr) => {
    const key = `${row.mandi}-${row.minPrice}-${row.modalPrice}-${row.maxPrice}`;
    return index === arr.findIndex(r => `${r.mandi}-${r.minPrice}-${r.modalPrice}-${r.maxPrice}` === key);
  }), [rows]);
  const hasRows = uniqueRows.length > 0;

  return (
    <div className="analytics-page app-container">
      <div id="report-section">
        <div className="dashboard-grid">
          <ResultCard result={result} />
          <BestWorstChart result={result} />
          <div className="card">
            <h3>{t("form.liveMarketResults")}</h3>
            <div className="meta">
              <div><strong>{t("form.state")}:</strong> {selection?.state ? localizeStateName(selection.state, language) : "-"}</div>
              <div><strong>{t("form.district")}:</strong> {selection?.district ? localizeLabelByType(selection.district, language, "district") : "-"}</div>
              <div><strong>{t("form.crop")}:</strong> {selection?.crop ? localizeLabelByType(selection.crop, language, "crop") : "-"}</div>
              <div><strong>{t("form.date")}:</strong> {selection?.date || "-"}</div>
            </div>
            <p className="unit-note">{t("form.pricesShown")}</p>

            {hasRows ? (
              <div className="table-wrap">
                <table className="live-table">
                  <thead>
                    <tr>
                      <th>{t("form.mandi")}</th>
                      <th>{t("form.minPrice")}</th>
                      <th>{t("form.modalPrice")}</th>
                      <th>{t("form.maxPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueRows.map((row, idx) => (
                      <tr key={`${row.id || row.mandi}-${idx}`}>
                        <td>{localizeLabelByType(row.mandi, language, "term")}</td>
                        <td>{row.minPrice}</td>
                        <td>{row.modalPrice}</td>
                        <td>{row.maxPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>{t("form.noLiveData")}</p>
            )}
          </div>
          {selectedCrop && <LiveMandiCard crop={selectedCrop} summaryData={mandiSummary} />}
          {selectedCrop && <MandiDecision crop={selectedCrop} summaryData={mandiSummary} />}
          {trend.length > 0 && (
            <BestSellingDayCard crop={selectedCrop} trend={trend} />
          )}
          {selectedCrop && (
            <DistrictComparisonChart crop={selectedCrop} />
          )}
        </div>
      </div>

      {trend.length > 0 && (
        <PriceChart selectedCrop={selectedCrop} trend={trend} />
      )}

      <DownloadReport
        disabled={!hasRows}
        pdfPayload={{
          result,
          selectedCrop,
          liveRows,
          selection,
        }}
      />
    </div>
  );
}

function App() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const isPdfMode = location.hash === "#results";
  const isLoggedIn = !!localStorage.getItem("token");
  const role = getCurrentRole();
  const isAdmin = role === "ADMIN";

  const [result, setResult] = useState(null);
  const [liveRows, setLiveRows] = useState([]);
  const [selection, setSelection] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [trend, setTrend] = useState([]);
  const [mandiSummary, setMandiSummary] = useState(null);

  /* 🔒 HARD ROUTE PROTECTION */
  useEffect(() => {
    const protectedRoutes = ["/select", "/results", "/admin"];

    if (!isLoggedIn && protectedRoutes.includes(location.pathname)) {
      navigate("/auth?mode=login", { replace: true });
      return;
    }

    if (location.pathname === "/admin" && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, isAdmin, location.pathname, navigate]);

  /* PDF MODE */
  useEffect(() => {
    if (!isPdfMode) return;

    const savedRows = localStorage.getItem("pdf_live_rows");
    const savedSelection = localStorage.getItem("pdf_selection");
    const savedResult = localStorage.getItem("pdf_result");
    const savedCrop = localStorage.getItem("pdf_crop");

    if (savedRows) setLiveRows(JSON.parse(savedRows));
    if (savedSelection) {
      const parsed = JSON.parse(savedSelection);
      setSelection(parsed);
      if (parsed?.crop) setSelectedCrop(parsed.crop);
    }
    if (savedResult) setResult(JSON.parse(savedResult));
    if (savedCrop) setSelectedCrop(savedCrop);

    // Commented out to prevent resetting isPdfMode state during puppeteer render
    // navigate("/results", { replace: true });
  }, [isPdfMode]);

  useEffect(() => {
    if (isPdfMode) {
      document.body.classList.add("pdf-mode");
      window.__PDF_READY__ = false;
    } else {
      document.body.classList.remove("pdf-mode");
      window.__PDF_READY__ = undefined;
    }
  }, [isPdfMode]);

  useEffect(() => {
    if (!isPdfMode) return;

    const hasSelection = !!selection?.crop;
    const hasResult = !!result;
    const hasLiveRows = Array.isArray(liveRows);

    if (hasSelection && hasResult && hasLiveRows) {
      const timer = setTimeout(() => {
        window.__PDF_READY__ = true;
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isPdfMode, selection, result, liveRows]);

  /* PRICE TREND */
  useEffect(() => {
    if (!selectedCrop) return;

    axios
      .get(`http://localhost:8080/api/live/price-trend?crop=${selectedCrop}`)
      .then((res) => setTrend(res.data))
      .catch(() => {});
  }, [selectedCrop]);

  useEffect(() => {
    if (!selectedCrop) {
      setMandiSummary(null);
      return;
    }

    axios
      .get(`http://localhost:8080/api/live/mandi-summary?crop=${selectedCrop}`)
      .then((res) => setMandiSummary(res.data))
      .catch(() => setMandiSummary(null));
  }, [selectedCrop]);

  return (
    <>
      {!isPdfMode && <Navbar />}
      {!isPdfMode && <LanguageDock />}

      <Routes>
        <Route
          path="/"
          element={<Home onExploreAnalytics={() => navigate("/select")} />}
        />

        <Route path="/auth" element={<Auth />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/research" element={<Research />} />

        <Route
          path="/admin"
          element={isLoggedIn && isAdmin ? <Admin /> : <Home onExploreAnalytics={() => navigate("/select")} />}
        />

        <Route path="/pesticide-intelligence" element={<PesticideIntelligence />} />

        <Route path="/weather-intelligence" element={<WeatherIntelligence />} />

        <Route
          path="/select"
          element={
            <FarmerForm
              setLiveRows={setLiveRows}
              setSelection={setSelection}
              setResult={setResult}
              setSelectedCrop={setSelectedCrop}
              onAnalyzeSuccess={() => navigate("/results")}
            />
          }
        />

        <Route
          path="/results"
          element={
            <ErrorBoundary
              title={t("errors.renderTitle")}
              body={t("errors.renderBody")}
              retry={t("common.retry")}
            >
              <ResultsPage
                result={result}
                liveRows={liveRows}
                selectedCrop={selectedCrop}
                trend={trend}
                selection={selection}
                mandiSummary={mandiSummary}
              />
            </ErrorBoundary>
          }
        />
      </Routes>
    </>
  );
}

export default App;
