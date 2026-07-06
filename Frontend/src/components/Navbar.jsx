import { useNavigate } from "react-router-dom";
import { getCurrentRole } from "../utils/auth";
import { useI18n } from "../i18n/I18nProvider";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const role = getCurrentRole();
  const { t } = useI18n();

  return (
    <nav className="navbar">
      <div
        className="glass-pill brand-pill"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        {t("common.farmerAnalytics")}
      </div>

      <div className="glass-pill nav-pill">
        <span onClick={() => navigate("/")}>{t("common.home")}</span>

        {/* ✅ ANALYTICS */}
        <span
          onClick={() => {
            if (isLoggedIn) navigate("/select");
            else navigate("/auth?mode=login");
          }}
        >
          {t("common.analytics")}
        </span>

        {/* ✅ WEATHER INTELLIGENCE */}
        <span onClick={() => navigate("/weather-intelligence")}>{t("common.weather")}</span>

        {/* ✅ PESTICIDE INTELLIGENCE */}
        <span onClick={() => navigate("/pesticide-intelligence")}>{t("common.pesticide")}</span>

        <span onClick={() => navigate("/research")}>{t("common.research")}</span>
        {isLoggedIn && role === "ADMIN" && (
          <span onClick={() => navigate("/admin")}>{t("common.admin")}</span>
        )}
        <span onClick={() => navigate("/contact")}>{t("common.contact")}</span>
      </div>

      <div className="glass-pill auth-pill">
        {!isLoggedIn ? (
          <>
            <span
              className="auth-link login-link"
              onClick={() => navigate("/auth?mode=login")}
            >
              {t("common.login")}
            </span>

            <span
              className="auth-link signup-link"
              onClick={() => navigate("/auth?mode=signup")}
            >
              {t("common.signup")}
            </span>
          </>
        ) : (
          <span
            className="auth-link logout-link"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              navigate("/");
            }}
          >
            {t("common.logout")}
          </span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
