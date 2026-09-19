import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { parseJwt } from "../utils/auth";
import { useI18n } from "../i18n/I18nProvider";
import "../App.css";

const API = "${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/auth";

function Auth() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const allowedModes = new Set(["login", "signup", "admin"]);
  const rawMode = params.get("mode") || "login";
  const initialMode = allowedModes.has(rawMode) ? rawMode : "login";
  const [mode, setMode] = useState(initialMode);

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  /* 🔁 Sync login / signup mode */
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  /* 🎥 SUBTLE BACKGROUND PARALLAX */
  useEffect(() => {
    const page = document.querySelector(".auth-page");
    if (!page) return;

    const move = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;

      page.style.backgroundPosition = `${50 + x}% ${100 + y}%`;
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "signup") {
        await axios.post(`${API}/signup`, {
          name,
          email: identifier,
          password,
        });

        alert(t("auth.signupSuccess"));
        navigate("/auth?mode=login");
      } else {
        const endpoint = mode === "admin" ? `${API}/admin-login` : `${API}/login`;

        const res = await axios.post(endpoint, {
          identifier,
          password,
        });

        const token = typeof res.data === "string" ? res.data : res.data?.token;
        if (!token) {
          throw new Error(t("auth.invalidLoginResponse"));
        }

        const payload = parseJwt(token);
        const role = (payload?.role || "USER").toUpperCase();

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data || err.message || t("auth.genericError"));
    }
  };

  const modeTitles = {
    login: t("auth.welcomeBack"),
    signup: t("auth.createAccount"),
    admin: t("auth.adminTitle"),
  };

  const modeSubmit = {
    login: t("auth.submitLogin"),
    signup: t("auth.submitSignup"),
    admin: t("auth.submitAdmin"),
  };

  return (
    <div className={`auth-page ${mode === "login" ? "login" : "signup"}`}>
      {/* ✅ ONLY CHANGE IS HERE */}
      <div className={`auth-card ${mode === "login" || mode === "admin" ? "login-card" : ""}`}>
        <div className="auth-mode-switch">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => navigate("/auth?mode=login")}
          >
            {t("auth.userLogin")}
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => navigate("/auth?mode=signup")}
          >
            {t("auth.signup")}
          </button>
          <button
            type="button"
            className={mode === "admin" ? "active admin-btn" : "admin-btn"}
            onClick={() => navigate("/auth?mode=admin")}
          >
            {t("auth.adminLogin")}
          </button>
        </div>

        <h2 className="auth-title">{modeTitles[mode]}</h2>

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && (
            <input
              className="auth-input"
              placeholder={t("auth.username")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            className="auth-input"
            placeholder={t("auth.emailOrUsername")}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-button" type="submit">
            {modeSubmit[mode]}
          </button>
        </form>

        {mode !== "admin" && (
          <p
            className="auth-switch"
            onClick={() =>
              navigate(`/auth?mode=${mode === "login" ? "signup" : "login"}`)
            }
          >
            {mode === "login"
              ? t("auth.switchToSignup")
              : t("auth.switchToLogin")}
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;



