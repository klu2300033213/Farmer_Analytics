import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useI18n } from "../i18n/I18nProvider";

/* ─────────────────────────────────────────────
   INDIAN DISTRICTS DATABASE (lat/lng)
───────────────────────────────────────────── */
const INDIA_DISTRICTS = {
  "Andhra Pradesh": {
    Visakhapatnam: [17.6868, 83.2185],
    Vijayawada: [16.5062, 80.648],
    Guntur: [16.3067, 80.4365],
    Tirupati: [13.6288, 79.4192],
    Kurnool: [15.8281, 78.0373],
    Nellore: [14.4426, 79.9865],
    Kadapa: [14.4674, 78.8241],
    Anantapur: [14.6819, 77.6006],
    Rajahmundry: [17.0005, 81.8040],
    Eluru: [16.7107, 81.0952],
  },
  "Telangana": {
    Hyderabad: [17.385, 78.4867],
    Warangal: [17.9784, 79.5941],
    Nizamabad: [18.6725, 78.0940],
    Khammam: [17.2473, 80.1514],
    Karimnagar: [18.4386, 79.1288],
    Nalgonda: [17.0575, 79.2673],
    Mahbubnagar: [16.7488, 77.9836],
    Adilabad: [19.6640, 78.5320],
  },
  "Maharashtra": {
    Mumbai: [19.076, 72.8777],
    Pune: [18.5204, 73.8567],
    Nagpur: [21.1458, 79.0882],
    Nashik: [19.9975, 73.7898],
    Aurangabad: [19.8762, 75.3433],
    Solapur: [17.6805, 75.9064],
    Kolhapur: [16.7049, 74.2433],
    Amravati: [20.9374, 77.7796],
    Ahmednagar: [19.0948, 74.7480],
    Latur: [18.4088, 76.5604],
  },
  "Karnataka": {
    Bangalore: [12.9716, 77.5946],
    Mysore: [12.2958, 76.6394],
    Hubli: [15.3647, 75.1240],
    Mangalore: [12.9141, 74.856],
    Belgaum: [15.8497, 74.4977],
    Gulbarga: [17.3297, 76.8343],
    Bijapur: [16.8302, 75.7100],
    Shimoga: [13.9299, 75.5681],
    Tumkur: [13.3379, 77.1009],
    Davangere: [14.4644, 75.9218],
  },
  "Tamil Nadu": {
    Chennai: [13.0827, 80.2707],
    Coimbatore: [11.0168, 76.9558],
    Madurai: [9.9252, 78.1198],
    Tiruchirappalli: [10.7905, 78.7047],
    Salem: [11.6643, 78.146],
    Tirunelveli: [8.7139, 77.7567],
    Tirupur: [11.1085, 77.3411],
    Vellore: [12.9165, 79.1325],
    Erode: [11.341, 77.7172],
    Dindigul: [10.3624, 77.9695],
  },
  "Kerala": {
    Thiruvananthapuram: [8.5241, 76.9366],
    Kochi: [9.9312, 76.2673],
    Kozhikode: [11.2588, 75.7804],
    Thrissur: [10.5276, 76.2144],
    Kollam: [8.8932, 76.6141],
    Palakkad: [10.7867, 76.6548],
    Alappuzha: [9.4981, 76.3388],
    Malappuram: [11.0730, 76.0740],
  },
  "Gujarat": {
    Ahmedabad: [23.0225, 72.5714],
    Surat: [21.1702, 72.8311],
    Vadodara: [22.3072, 73.1812],
    Rajkot: [22.3039, 70.8022],
    Bhavnagar: [21.7645, 72.1519],
    Jamnagar: [22.4707, 70.0577],
    Junagadh: [21.5222, 70.4579],
    Gandhinagar: [23.2156, 72.6369],
    Anand: [22.5645, 72.9289],
    Mehsana: [23.5879, 72.3693],
  },
  "Rajasthan": {
    Jaipur: [26.9124, 75.7873],
    Jodhpur: [26.2389, 73.0243],
    Kota: [25.2138, 75.8648],
    Bikaner: [28.0229, 73.3119],
    Ajmer: [26.4499, 74.6399],
    Udaipur: [24.5854, 73.7125],
    Bhilwara: [25.3476, 74.6313],
    Alwar: [27.5530, 76.6346],
    Sikar: [27.6094, 75.1398],
    Barmer: [25.7521, 71.3967],
  },
  "Madhya Pradesh": {
    Bhopal: [23.2599, 77.4126],
    Indore: [22.7196, 75.8577],
    Gwalior: [26.2183, 78.1828],
    Jabalpur: [23.1815, 79.9864],
    Ujjain: [23.1765, 75.7885],
    Sagar: [23.8388, 78.7378],
    Rewa: [24.5362, 81.2966],
    Satna: [24.5850, 80.8322],
    Ratlam: [23.3315, 75.0367],
    Dewas: [22.9623, 76.0512],
  },
  "Punjab": {
    Amritsar: [31.634, 74.8723],
    Ludhiana: [30.9010, 75.8573],
    Jalandhar: [31.3260, 75.5762],
    Patiala: [30.3398, 76.3869],
    Bathinda: [30.2110, 74.9455],
    Mohali: [30.7046, 76.7179],
    Gurdaspur: [32.0417, 75.4060],
    Hoshiarpur: [31.5143, 75.9115],
    Fatehgarh: [30.6452, 76.3905],
    Moga: [30.8163, 75.1730],
  },
  "Haryana": {
    Gurugram: [28.4595, 77.0266],
    Faridabad: [28.4089, 77.3178],
    Hisar: [29.1492, 75.7217],
    Rohtak: [28.8955, 76.6066],
    Ambala: [30.3782, 76.7767],
    Karnal: [29.6857, 76.9905],
    Panipat: [29.3909, 76.9635],
    Sonipat: [28.9931, 77.0151],
    Bhiwani: [28.7930, 76.1320],
    Jhajjar: [28.6077, 76.6563],
  },
  "Uttar Pradesh": {
    Lucknow: [26.8467, 80.9462],
    Kanpur: [26.4499, 80.3319],
    Agra: [27.1767, 78.0081],
    Varanasi: [25.3176, 82.9739],
    Allahabad: [25.4358, 81.8463],
    Meerut: [28.9845, 77.7064],
    Gorakhpur: [26.7606, 83.3732],
    Bareilly: [28.347, 79.4304],
    Aligarh: [27.8974, 78.088],
    Moradabad: [28.8386, 78.7733],
  },
  "Bihar": {
    Patna: [25.5941, 85.1376],
    Gaya: [24.7914, 85.0002],
    Muzaffarpur: [26.1209, 85.3647],
    Bhagalpur: [25.2425, 86.9842],
    Darbhanga: [26.1542, 85.8918],
    Ara: [25.5569, 84.6640],
    Buxar: [25.5657, 83.9813],
    Hajipur: [25.6817, 85.2091],
    Begusarai: [25.4182, 86.1272],
    Chapra: [25.7820, 84.7469],
  },
  "West Bengal": {
    Kolkata: [22.5726, 88.3639],
    Howrah: [22.5958, 88.2636],
    Darjeeling: [27.0360, 88.2627],
    Siliguri: [26.7271, 88.6394],
    Durgapur: [23.5204, 87.3119],
    Asansol: [23.6888, 86.9622],
    Bardhaman: [23.2324, 87.8615],
    Malda: [25.0108, 88.1418],
    Midnapore: [22.4257, 87.3216],
    Bankura: [23.2324, 87.0680],
  },
  "Odisha": {
    Bhubaneswar: [20.2961, 85.8245],
    Cuttack: [20.4625, 85.8828],
    Rourkela: [22.2604, 84.8536],
    Sambalpur: [21.4669, 83.9756],
    Puri: [19.8135, 85.8312],
    Balasore: [21.4942, 86.9334],
    Berhampur: [19.3149, 84.7941],
    Koraput: [18.8135, 82.7110],
  },
  "Assam": {
    Guwahati: [26.1445, 91.7362],
    Silchar: [24.8333, 92.7789],
    Dibrugarh: [27.4728, 94.9120],
    Jorhat: [26.7465, 94.2026],
    Tezpur: [26.6338, 92.8004],
    Nagaon: [26.3464, 92.6840],
    Dhubri: [26.0200, 89.9830],
  },
  "Chhattisgarh": {
    Raipur: [21.2514, 81.6296],
    Bilaspur: [22.0796, 82.1391],
    Durg: [21.1904, 81.2849],
    Korba: [22.3595, 82.7501],
    Rajnandgaon: [21.0965, 81.0289],
    Jagdalpur: [19.0760, 82.0281],
  },
  "Jharkhand": {
    Ranchi: [23.3441, 85.3096],
    Jamshedpur: [22.8046, 86.2029],
    Dhanbad: [23.7957, 86.4304],
    Bokaro: [23.6693, 86.1511],
    Hazaribagh: [23.9925, 85.3637],
    Deoghar: [24.4852, 86.6950],
  },
  "Himachal Pradesh": {
    Shimla: [31.1048, 77.1734],
    Dharamsala: [32.2190, 76.3234],
    Mandi: [31.7085, 76.9320],
    Solan: [30.9045, 77.0967],
    Kullu: [31.9572, 77.1088],
    Kangra: [32.0999, 76.2691],
  },
  "Uttarakhand": {
    Dehradun: [30.3165, 78.0322],
    Haridwar: [29.9457, 78.1642],
    Nainital: [29.3803, 79.4636],
    Rishikesh: [30.0869, 78.2676],
    Roorkee: [29.8543, 77.8880],
    Haldwani: [29.2183, 79.5130],
  },
};

/* ─────────────────────────────────────────────
   WEATHER ICON HELPER
───────────────────────────────────────────── */
function getWeatherIcon(wmo, isDay = true) {
  if (wmo === 0) return isDay ? "☀️" : "🌙";
  if (wmo <= 3) return isDay ? "🌤️" : "☁️";
  if (wmo <= 9) return "🌫️";
  if (wmo <= 19) return "🌦️";
  if (wmo <= 29) return "🌧️";
  if (wmo <= 39) return "🌨️";
  if (wmo <= 49) return "🌫️";
  if (wmo <= 59) return "🌦️";
  if (wmo <= 69) return "🌨️";
  if (wmo <= 79) return "❄️";
  if (wmo <= 84) return "🌧️";
  if (wmo <= 94) return "⛈️";
  return "🌩️";
}

function getWeatherDesc(wmo, t) {
  if (wmo === 0) return t("weather.clearSky");
  if (wmo <= 3) return t("weather.partlyCloudy");
  if (wmo <= 9) return t("weather.foggy");
  if (wmo <= 19) return t("weather.lightDrizzle");
  if (wmo <= 29) return t("weather.patchyRain");
  if (wmo <= 39) return t("weather.lightSnow");
  if (wmo <= 49) return t("weather.denseFog");
  if (wmo <= 59) return t("weather.drizzle");
  if (wmo <= 69) return t("weather.freezingRain");
  if (wmo <= 79) return t("weather.snowfall");
  if (wmo <= 84) return t("weather.rainShowers");
  if (wmo <= 94) return t("weather.thunderstorm");
  return t("weather.heavyThunderstorm");
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/* ─────────────────────────────────────────────
   CROP ADVISORY ENGINE
───────────────────────────────────────────── */
function getCropAdvisory(weather) {
  if (!weather) return [];
  const { temperature, humidity, windspeed, precipitation, uvIndex } = weather;

  const advisories = [];

  // Heat advisory
  if (temperature >= 38) {
    advisories.push({ type: "danger", icon: "🌡️", title: "Extreme Heat Alert", msg: "Avoid field work between 11AM–4PM. Irrigate crops early morning. Mulch to retain soil moisture." });
  } else if (temperature >= 32) {
    advisories.push({ type: "warning", icon: "☀️", title: "High Temperature", msg: "Increase irrigation frequency. Check for heat-stressed plants. Spray foliar nutrients in the evening." });
  }

  // Spray window
  if (windspeed > 25) {
    advisories.push({ type: "danger", icon: "💨", title: "Spray Avoided — High Wind", msg: `Wind speed ${windspeed} km/h is too high for pesticide application. Spray when winds are below 15 km/h.` });
  } else if (windspeed > 15) {
    advisories.push({ type: "warning", icon: "🌬️", title: "Caution: Moderate Wind", msg: "Pesticide drift risk is elevated. Use low-pressure nozzles. Spray early morning or evening only." });
  } else if (precipitation < 0.5 && humidity < 85 && windspeed < 15) {
    advisories.push({ type: "success", icon: "✅", title: "Good Spray Window", msg: "Conditions are suitable for pesticide/fertilizer application. Apply in early morning for best results." });
  }

  // Rain advisory
  if (precipitation >= 10) {
    advisories.push({ type: "danger", icon: "🌧️", title: "Heavy Rain Alert", msg: "Avoid spraying chemicals — rain will wash off. Check field drainage. Watch for waterlogging and fungal disease." });
  } else if (precipitation >= 2) {
    advisories.push({ type: "warning", icon: "🌦️", title: "Moderate Rain", msg: "Pesticide application not recommended. Assess soil moisture before next irrigation. Watch for root rot in sandy soils." });
  }

  // UV advisory
  if (uvIndex >= 8) {
    advisories.push({ type: "warning", icon: "🕶️", title: "High UV Index", msg: `UV index ${uvIndex} — wear protective gear outdoors. Avoid transplanting seedlings during peak afternoon hours.` });
  }

  // Humidity advisory
  if (humidity >= 85) {
    advisories.push({ type: "warning", icon: "💧", title: "High Humidity — Fungal Risk", msg: "Conditions favor fungal diseases (powdery mildew, blight). Apply preventive fungicide. Ensure good airflow in dense crops." });
  }

  // Cold advisory
  if (temperature <= 10) {
    advisories.push({ type: "warning", icon: "❄️", title: "Cold Stress Risk", msg: "Protect frost-sensitive crops. Avoid irrigation at night. Consider smoke/smudge pots for orchards." });
  }

  // Ideal conditions
  if (advisories.length === 0) {
    advisories.push({ type: "success", icon: "🌿", title: "Ideal Farming Conditions", msg: "Weather is favorable. Good time for field operations, transplanting, and routine crop maintenance." });
  }

  return advisories;
}

/* ─────────────────────────────────────────────
   SOIL MOISTURE ESTIMATOR
───────────────────────────────────────────── */
function estimateSoilMoisture(precipitation, temperature) {
  let moisture = 40; // base %
  moisture += Math.min(precipitation * 4, 40);
  moisture -= Math.max(0, (temperature - 25) * 0.5);
  moisture = Math.max(5, Math.min(95, moisture));
  return Math.round(moisture);
}

function getSoilMoistureLabel(pct, t) {
  if (pct >= 75) return { label: t("weather.soilSaturated"), color: "#3b82f6" };
  if (pct >= 55) return { label: t("weather.soilAdequate"), color: "#22c55e" };
  if (pct >= 35) return { label: t("weather.soilModerate"), color: "#f59e0b" };
  return { label: t("weather.soilDry"), color: "#ef4444" };
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function WeatherIntelligence() {
  const { t } = useI18n();
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState("Pune");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const states = useMemo(() => Object.keys(INDIA_DISTRICTS).sort(), []);
  const districts = useMemo(() => Object.keys(INDIA_DISTRICTS[selectedState] || {}).sort(), [selectedState]);

  useEffect(() => {
    if (districts.length > 0 && !districts.includes(selectedDistrict)) {
      setSelectedDistrict(districts[0]);
    }
  }, [selectedState, districts, selectedDistrict]);

  const fetchWeather = useCallback(async () => {
    const coords = INDIA_DISTRICTS[selectedState]?.[selectedDistrict];
    if (!coords) return;

    setLoading(true);
    setError(null);

    const [lat, lng] = coords;

    try {
      const { data } = await axios.get(
        `https://api.open-meteo.com/v1/forecast`, {
          params: {
            latitude: lat,
            longitude: lng,
            current: [
              "temperature_2m", "relative_humidity_2m", "apparent_temperature",
              "precipitation", "weather_code", "wind_speed_10m", "wind_direction_10m",
              "uv_index", "visibility", "is_day"
            ].join(","),
            hourly: [
              "temperature_2m", "precipitation_probability", "precipitation",
              "weather_code", "wind_speed_10m", "relative_humidity_2m"
            ].join(","),
            daily: [
              "weather_code", "temperature_2m_max", "temperature_2m_min",
              "precipitation_sum", "precipitation_probability_max",
              "wind_speed_10m_max", "uv_index_max", "sunrise", "sunset"
            ].join(","),
            timezone: "Asia/Kolkata",
            forecast_days: 7,
          }
        }
      );

      const c = data.current;
      setWeather({
        temperature: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        precipitation: c.precipitation,
        weatherCode: c.weather_code,
        windspeed: Math.round(c.wind_speed_10m),
        windDirection: c.wind_direction_10m,
        uvIndex: c.uv_index,
        visibility: c.visibility ? Math.round(c.visibility / 1000) : null,
        isDay: c.is_day,
      });

      // 7-day forecast
      const d = data.daily;
      const days = d.time.map((date, i) => ({
        date,
        wmo: d.weather_code[i],
        maxTemp: Math.round(d.temperature_2m_max[i]),
        minTemp: Math.round(d.temperature_2m_min[i]),
        rain: d.precipitation_sum[i],
        rainProb: d.precipitation_probability_max[i],
        windMax: Math.round(d.wind_speed_10m_max[i]),
        uvMax: d.uv_index_max[i],
        sunrise: d.sunrise[i]?.split("T")[1]?.slice(0, 5),
        sunset: d.sunset[i]?.split("T")[1]?.slice(0, 5),
      }));
      setForecast(days);

      // Hourly (next 24h)
      const now = new Date();
      const h = data.hourly;
      const hourlyData = h.time
        .map((t, i) => ({
          time: t,
          hour: new Date(t).getHours(),
          temp: Math.round(h.temperature_2m[i]),
          rainProb: h.precipitation_probability[i],
          rain: h.precipitation[i],
          wind: Math.round(h.wind_speed_10m[i]),
          humidity: h.relative_humidity_2m[i],
          wmo: h.weather_code[i],
        }))
        .filter((h) => {
          const t = new Date(h.time);
          return t >= now && t < new Date(now.getTime() + 24 * 60 * 60 * 1000);
        })
        .slice(0, 12);
      setHourly(hourlyData);

      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      setError("Unable to fetch weather data. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedDistrict]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const advisories = useMemo(() => getCropAdvisory(weather), [weather]);
  const soilMoisture = useMemo(() => weather ? estimateSoilMoisture(weather.precipitation, weather.temperature) : 45, [weather]);
  const soilLabel = useMemo(() => getSoilMoistureLabel(soilMoisture, t), [soilMoisture, t]);

  const sprayRisk = useMemo(() => {
    if (!weather) return null;
    const { windspeed, precipitation, humidity } = weather;
    if (windspeed > 25 || precipitation > 2) return { level: "AVOID", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
    if (windspeed > 15 || humidity > 85) return { level: "CAUTION", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
    return { level: "SAFE", color: "#22c55e", bg: "rgba(34,197,94,0.15)" };
  }, [weather]);

  const windDirectionLabel = (deg) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };

  const maxRainProb = Math.max(...hourly.map((h) => h.rainProb || 0), 1);

  return (
    <div className="weather-page">
      {/* ── ANIMATED BACKGROUND ── */}
      <div className="weather-bg" aria-hidden="true">
        <div className="weather-bg-orb weather-bg-orb-1" />
        <div className="weather-bg-orb weather-bg-orb-2" />
        <div className="weather-bg-grid" />
      </div>

      {/* ── PAGE HEADER ── */}
      <div className="weather-hero-header">
        <div className="weather-hero-glow" />
        <div className="weather-hero-content">
          <div className="weather-hero-badge">{t("weather.badge")}</div>
          <h1 className="weather-hero-title">
            {t("weather.title")}
            <span className="weather-hero-accent"> {t("weather.titleAccent")}</span>
          </h1>
          <p className="weather-hero-subtitle">
            {t("weather.subtitle")}
          </p>
        </div>
      </div>

      <div className="weather-main-container">
        {/* ── LOCATION SELECTOR ── */}
        <div className="weather-location-bar">
          <div className="weather-loc-icon">📍</div>
          <div className="weather-loc-selects">
            <div className="weather-loc-group">
              <label>{t("weather.state")}</label>
              <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); }}>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="weather-loc-divider">›</div>
            <div className="weather-loc-group">
              <label>{t("weather.district")}</label>
              <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <button className="weather-refresh-btn" onClick={fetchWeather} disabled={loading} title="Refresh weather data">
            <span className={loading ? "spin-icon" : ""}>🔄</span>
            {loading ? t("weather.fetching") : t("weather.refresh")}
          </button>
          {lastUpdated && <div className="weather-updated-tag">{t("weather.updated")} {lastUpdated}</div>}
        </div>

        {/* ── ERROR STATE ── */}
        {error && (
          <div className="weather-error-banner">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={fetchWeather}>{t("weather.retry")}</button>
          </div>
        )}

        {/* ── LOADING SKELETON ── */}
        {loading && !weather && (
          <div className="weather-skeleton-grid">
            {[1, 2, 3, 4].map((i) => <div key={i} className="weather-skeleton-card" />)}
          </div>
        )}

        {weather && (
          <>
            {/* ── CURRENT WEATHER HERO CARD ── */}
            <div className="weather-current-card">
              <div className="weather-current-main">
                <div className="weather-current-icon-wrap">
                  <span className="weather-current-icon">
                    {getWeatherIcon(weather.weatherCode, weather.isDay)}
                  </span>
                </div>
                <div className="weather-current-temp-block">
                  <div className="weather-current-temp">{weather.temperature}°C</div>
                  <div className="weather-current-desc">{getWeatherDesc(weather.weatherCode, t)}</div>
                  <div className="weather-current-location">
                    📍 {selectedDistrict}, {selectedState}
                  </div>
                  <div className="weather-current-feels">{t("weather.feelsLike")} {weather.feelsLike}°C</div>
                </div>
              </div>

              <div className="weather-current-stats">
                <div className="weather-stat-item">
                  <div className="weather-stat-icon">💧</div>
                  <div className="weather-stat-value">{weather.humidity}%</div>
                  <div className="weather-stat-label">{t("weather.humidity")}</div>
                </div>
                <div className="weather-stat-item">
                  <div className="weather-stat-icon">💨</div>
                  <div className="weather-stat-value">{weather.windspeed} km/h</div>
                  <div className="weather-stat-label">{t("weather.wind")} {windDirectionLabel(weather.windDirection)}</div>
                </div>
                <div className="weather-stat-item">
                  <div className="weather-stat-icon">🌧️</div>
                  <div className="weather-stat-value">{weather.precipitation} mm</div>
                  <div className="weather-stat-label">{t("weather.rainfall")}</div>
                </div>
                <div className="weather-stat-item">
                  <div className="weather-stat-icon">☀️</div>
                  <div className="weather-stat-value">{weather.uvIndex}</div>
                  <div className="weather-stat-label">{t("weather.uvIndex")}</div>
                </div>
                {weather.visibility !== null && (
                  <div className="weather-stat-item">
                    <div className="weather-stat-icon">👁️</div>
                    <div className="weather-stat-value">{weather.visibility} km</div>
                    <div className="weather-stat-label">{t("weather.visibility")}</div>
                  </div>
                )}
                {sprayRisk && (
                  <div className="weather-stat-item">
                    <div className="weather-stat-icon">🌿</div>
                    <div className="weather-stat-value" style={{ color: sprayRisk.color }}>{sprayRisk.level}</div>
                    <div className="weather-stat-label">{t("weather.sprayWindow")}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── QUICK METRICS ROW ── */}
            <div className="weather-quick-row">
              {/* Soil Moisture */}
              <div className="weather-quick-card">
                <div className="weather-quick-header">
                  <span className="weather-quick-icon">🌱</span>
                  <span className="weather-quick-title">{t("weather.soilMoisture")}</span>
                </div>
                <div className="weather-moisture-bar-wrap">
                  <div className="weather-moisture-bar">
                    <div
                      className="weather-moisture-fill"
                      style={{ width: `${soilMoisture}%`, background: soilLabel.color }}
                    />
                  </div>
                  <span className="weather-moisture-pct">{soilMoisture}%</span>
                </div>
                <div className="weather-moisture-label" style={{ color: soilLabel.color }}>
                  {soilLabel.label}
                </div>
                <div className="weather-quick-note">{t("weather.soilNote")}</div>
              </div>

              {/* Spray Window */}
              {sprayRisk && (
                <div className="weather-quick-card" style={{ border: `1px solid ${sprayRisk.color}44` }}>
                  <div className="weather-quick-header">
                    <span className="weather-quick-icon">🌾</span>
                    <span className="weather-quick-title">{t("weather.sprayWindowRisk")}</span>
                  </div>
                  <div className="weather-spray-badge" style={{ color: sprayRisk.color, background: sprayRisk.bg }}>
                    {sprayRisk.level} {t("weather.toSpray")}

                  </div>
                  <div className="weather-spray-factors">
                    <span className={weather.windspeed > 15 ? "factor-bad" : "factor-ok"}>
                      💨 Wind: {weather.windspeed} km/h
                    </span>
                    <span className={weather.precipitation > 1 ? "factor-bad" : "factor-ok"}>
                      🌧️ Rain: {weather.precipitation} mm
                    </span>
                    <span className={weather.humidity > 85 ? "factor-bad" : "factor-ok"}>
                      💧 Humidity: {weather.humidity}%
                    </span>
                  </div>
                </div>
              )}

              {/* Sunrise / Sunset */}
              {forecast.length > 0 && (
                <div className="weather-quick-card">
                  <div className="weather-quick-header">
                    <span className="weather-quick-icon">🌅</span>
                    <span className="weather-quick-title">{t("weather.sunSchedule")}</span>
                  </div>
                  <div className="weather-sun-row">
                    <div className="weather-sun-item">
                      <span>🌄</span>
                      <span className="weather-sun-time">{forecast[0].sunrise}</span>
                      <span className="weather-sun-lbl">{t("weather.sunrise")}</span>
                    </div>
                    <div className="weather-sun-divider" />
                    <div className="weather-sun-item">
                      <span>🌇</span>
                      <span className="weather-sun-time">{forecast[0].sunset}</span>
                      <span className="weather-sun-lbl">{t("weather.sunset")}</span>
                    </div>
                  </div>
                  <div className="weather-quick-note">{t("weather.fieldWork")}</div>
                </div>
              )}
            </div>

            {/* ── CROP ADVISORIES ── */}
            <div className="weather-section">
              <div className="weather-section-header">
                <span>🌾</span>
                <h2>{t("weather.cropAdvisory")}</h2>
                <span className="weather-section-sub">{t("weather.cropAdvisoryDesc")}</span>
              </div>
              <div className="weather-advisory-grid">
                {advisories.map((adv, i) => (
                  <div key={i} className={`weather-advisory-card advisory-${adv.type}`}>
                    <div className="advisory-icon">{adv.icon}</div>
                    <div className="advisory-body">
                      <div className="advisory-title">{adv.title}</div>
                      <div className="advisory-msg">{adv.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 24H RAIN PROBABILITY CHART ── */}
            {hourly.length > 0 && (
              <div className="weather-section">
                <div className="weather-section-header">
                  <span>⏱️</span>
                  <h2>{t("weather.rainProb")}</h2>
                  <span className="weather-section-sub">{t("weather.rainProbDesc")}</span>
                </div>
                <div className="weather-hourly-chart">
                  <div className="hourly-bars">
                    {hourly.map((h, i) => (
                      <div key={i} className="hourly-bar-col">
                        <div className="hourly-bar-label">{h.rainProb}%</div>
                        <div className="hourly-bar-wrap">
                          <div
                            className="hourly-bar-fill"
                            style={{ height: `${(h.rainProb / maxRainProb) * 100}%`, background: h.rainProb > 60 ? "#3b82f6" : h.rainProb > 30 ? "#60a5fa" : "#93c5fd" }}
                          />
                        </div>
                        <div className="hourly-bar-icon">{getWeatherIcon(h.wmo)}</div>
                        <div className="hourly-bar-time">{h.hour}:00</div>
                        <div className="hourly-bar-temp">{h.temp}°</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 7-DAY FORECAST ── */}
            {forecast.length > 0 && (
              <div className="weather-section">
                <div className="weather-section-header">
                  <span>📅</span>
                  <h2>{t("weather.forecast")}</h2>
                  <span className="weather-section-sub">{t("weather.forecastDesc")}</span>
                </div>
                <div className="weather-forecast-strip">
                  {forecast.map((day, i) => (
                    <div key={i} className={`weather-forecast-card ${i === 0 ? "forecast-today" : ""}`}>
                      <div className="forecast-day">{i === 0 ? t("weather.today") : formatDate(day.date)}</div>
                      <div className="forecast-icon">{getWeatherIcon(day.wmo)}</div>
                      <div className="forecast-desc">{getWeatherDesc(day.wmo, t)}</div>
                      <div className="forecast-temps">
                        <span className="temp-max">{day.maxTemp}°</span>
                        <span className="temp-min">{day.minTemp}°</span>
                      </div>
                      <div className="forecast-rain-bar-wrap">
                        <div className="forecast-rain-bar">
                          <div className="forecast-rain-fill" style={{ width: `${day.rainProb}%` }} />
                        </div>
                        <span className="forecast-rain-pct">{day.rainProb}%</span>
                      </div>
                      <div className="forecast-detail">
                        <span>💧 {day.rain}mm</span>
                        <span>💨 {day.windMax}km/h</span>
                      </div>
                      {day.rainProb > 70 && <div className="forecast-tag tag-rain">{t("weather.rainLikely")}</div>}
                      {day.uvMax >= 8 && <div className="forecast-tag tag-uv">{t("weather.highUV")}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FARMING WINDOW TABLE ── */}
            <div className="weather-section">
              <div className="weather-section-header">
                <span>🗓️</span>
                <h2>{t("weather.farmingWindow")}</h2>
                <span className="weather-section-sub">{t("weather.farmingWindowDesc")}</span>
              </div>
              <div className="weather-activity-table">
                {[
                  { activity: t("weather.pestSpraying"), condition: weather.windspeed < 15 && weather.precipitation < 1, reason: weather.windspeed >= 15 ? `High wind (${weather.windspeed} km/h)` : weather.precipitation >= 1 ? `Active rainfall (${weather.precipitation}mm)` : "Good wind & dry conditions" },
                  { activity: t("weather.irrigation"), condition: soilMoisture < 45, reason: soilMoisture >= 45 ? `Soil moisture adequate (${soilMoisture}%)` : `Soil moisture low (${soilMoisture}%)` },
                  { activity: t("weather.ploughing"), condition: soilMoisture > 20 && soilMoisture < 70, reason: soilMoisture <= 20 ? "Soil too dry — may damage structure" : soilMoisture >= 70 ? "Soil waterlogged — wait for dry spell" : "Soil moisture in optimal range" },
                  { activity: t("weather.fertilizer"), condition: weather.windspeed < 20 && weather.precipitation < 2, reason: weather.windspeed >= 20 ? "Strong wind may disperse fertilizer" : weather.precipitation >= 2 ? "Rain may wash off fertilizer" : "Good conditions for absorption" },
                  { activity: t("weather.harvesting"), condition: weather.precipitation < 1 && weather.humidity < 80, reason: weather.precipitation >= 1 ? "Active rain may damage harvest quality" : weather.humidity >= 80 ? `High humidity (${weather.humidity}%) may cause mold` : "Dry conditions ideal for harvesting" },
                  { activity: t("weather.transplanting"), condition: weather.temperature < 35 && weather.temperature > 12 && weather.uvIndex < 9, reason: weather.temperature >= 35 ? "Extreme heat stress for seedlings" : weather.temperature <= 12 ? "Too cold for transplanting" : weather.uvIndex >= 9 ? "Very high UV — transplant in evening" : "Temperature & UV within range" },
                ].map((row, i) => (
                  <div key={i} className={`weather-activity-row ${row.condition ? "activity-ok" : "activity-no"}`}>
                    <div className="activity-status-dot" style={{ background: row.condition ? "#22c55e" : "#ef4444" }} />
                    <div className="activity-name">{row.activity}</div>
                    <div className={`activity-badge ${row.condition ? "badge-ok" : "badge-no"}`}>
                      {row.condition ? t("weather.recommended") : t("weather.notAdvised")}
                    </div>
                    <div className="activity-reason">{row.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
