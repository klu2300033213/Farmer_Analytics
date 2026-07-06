import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

function FlyingBird({ className }) {
  return (
    <span className={`hero-bird ${className}`}>
      <svg className="bird-svg" viewBox="0 0 64 40" aria-hidden="true">
        <ellipse className="bird-body" cx="32" cy="26" rx="5.5" ry="3.5" />
        <path
          className="bird-wing wing-left"
          d="M31 25 C24 18, 16 11, 7 8 C14 18, 21 24, 30 27 Z"
        />
        <path
          className="bird-wing wing-right"
          d="M33 25 C40 18, 48 11, 57 8 C50 18, 43 24, 34 27 Z"
        />
      </svg>
    </span>
  );
}

function Hero({ onExploreAnalytics }) {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const { t } = useI18n();

  const goToFeature = (path) => {
    if (!isLoggedIn) {
      navigate("/auth?mode=login");
      return;
    }

    navigate(path);
  };

  return (
    <section className="hero-section">
      <img src="/h1.png" alt={t("hero.bgAlt")} className="hero-bg" />

      <div className="hero-overlay">
        <div className="hero-bird-layer" aria-hidden="true">
          <FlyingBird className="bird-1" />
          <FlyingBird className="bird-2" />
          <FlyingBird className="bird-3" />
          <FlyingBird className="bird-4" />
          <FlyingBird className="bird-5" />
          <FlyingBird className="bird-6" />
        </div>

        <div className="hero-text">
          <h1>
            {t("hero.titleLine1")} <br />
            {t("hero.titleLine2")} <br />
            {t("hero.titleLine3")}
          </h1>

          <p>
            {t("hero.subtitle")}
          </p>

          <div className="hero-actions">
            {/* ✅ JOIN OUR MISSION */}
            <button
              className="hero-btn primary"
              onClick={() =>
                navigate(isLoggedIn ? "/about" : "/auth?mode=signup")
              }
            >
              {t("hero.joinMission")}
            </button>

            {/* ✅ EXPLORE DASHBOARD */}
            <button
              className="hero-btn secondary"
              onClick={() => {
                if (isLoggedIn) onExploreAnalytics();
                else navigate("/auth?mode=login");
              }}
            >
              {t("hero.exploreDashboard")}
            </button>
          </div>

          <div className="hero-stats">
            <div>⭐ {t("hero.rating")}</div>
            <div>👨‍🌾 {t("hero.trustedFarmers")}</div>
          </div>
        </div>

        <div className="hero-image-cards">
          {/* ✅ FIRST CARD */}
          <div
            className="image-card"
            onClick={() => {
              if (isLoggedIn) onExploreAnalytics();
              else navigate("/auth?mode=login");
            }}
          >
            <img src="/card1.png" alt={t("hero.card1Alt")} />
            <div className="image-overlay">
              <h4>
                {t("hero.card1")}
              </h4>
            </div>
          </div>

          <div
            className="image-card"
            onClick={() => goToFeature("/pesticide-intelligence")}
          >
            <img src="/card2.png" alt={t("hero.card2Alt")} />
            <div className="image-overlay">
              <h4>
                {t("hero.card2")}
              </h4>
            </div>
          </div>

          <div
            className="image-card"
            onClick={() => goToFeature("/weather-intelligence")}
          >
            <img src="/card3.png" alt={t("hero.card3Alt")} />
            <div className="image-overlay">
              <h4>
                {t("hero.card3")}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
