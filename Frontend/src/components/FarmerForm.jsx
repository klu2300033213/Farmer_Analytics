

import { useEffect, useState } from "react";
import {
  playAnalyzeErrorSound,
  playAnalyzeStartSound,
  playAnalyzeSuccessSound,
  playSelectSound,
} from "../services/uiSounds";
import { useI18n } from "../i18n/I18nProvider";
import { localizeLabelByType, localizeStateName } from "../i18n/dataLocalization";

function FarmerForm({ setLiveRows, setSelection, setSelectedCrop, setResult, onAnalyzeSuccess }) {
  const { t, language } = useI18n();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [date, setDate] = useState("");

  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [dateList, setDateList] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL|| 'http://localhost:8081'}/api/live/states`)
      .then(res => res.json())
      .then(list => {
        setStateList(list);
        if (list.length > 0) setState(list[0]);
      });
  }, []);

  useEffect(() => {
    if (!state) return;

    fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/live/districts?state=${encodeURIComponent(state)}`)
      .then(res => res.json())
      .then(list => {
        setDistrictList(list);
        setDistrict("");
        setCrop("");
        setDate("");
        setCropList([]);
        setDateList([]);
      });
  }, [state]);

  useEffect(() => {
    if (!state || !district) return;

    fetch(
      `${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/live/crops?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
    )
      .then(res => res.json())
      .then(list => {
        setCropList(list);
        setCrop("");
        setDate("");
        setDateList([]);
      });
  }, [state, district]);

  useEffect(() => {
    if (!state || !district || !crop) return;

    setSelectedCrop(crop);

    fetch(
      `${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/live/dates?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&crop=${encodeURIComponent(crop)}`
    )
      .then(res => res.json())
      .then(list => {
        setDateList(list);
        setDate("");
      });
  }, [state, district, crop, setSelectedCrop]);

  const analyze = async () => {
    if (!state || !district || !crop || !date) {
      playAnalyzeErrorSound();
      alert(t("form.requiredFieldError"));
      return;
    }

    playAnalyzeStartSound();

    setLoading(true);
    try {
      const liveUrl = `${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/live/filter?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&crop=${encodeURIComponent(crop)}&date=${encodeURIComponent(date)}`;
      const analyzeUrl = `${import.meta.env.VITE_API_URL||"http://localhost:8081"}/api/analyze?crop=${encodeURIComponent(crop)}`;

      const [liveRes, analyzeRes] = await Promise.all([
        fetch(liveUrl),
        fetch(analyzeUrl),
      ]);

      const liveData = await liveRes.json();
      const analytics = await analyzeRes.json();

      const selection = { state, district, crop, date };

      localStorage.setItem("pdf_live_rows", JSON.stringify(liveData));
      localStorage.setItem("pdf_selection", JSON.stringify(selection));
      localStorage.setItem("pdf_result", JSON.stringify(analytics));
      localStorage.setItem("pdf_crop", crop);

      setSelection(selection);
      setLiveRows(liveData);
      setResult(analytics);
      playAnalyzeSuccessSound();
      onAnalyzeSuccess();
    } catch (e) {
      console.error(e);
      playAnalyzeErrorSound();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-page analytics-crop-pro">
      <div className="card crop-select-card">
        <h3 className="crop-select-title">{t("form.selectStateTitle")}</h3>

        <select value={state} onChange={e => {
          playSelectSound();
          setState(e.target.value);
        }}>
          <option value="">{t("form.selectState")}</option>
          {stateList.map(s => (
            <option key={s} value={s}>{localizeStateName(s, language)}</option>
          ))}
        </select>

        {districtList.length > 0 && (
          <select value={district} onChange={e => {
            playSelectSound();
            setDistrict(e.target.value);
          }}>
            <option value="">{t("form.selectDistrict")}</option>
            {districtList.map(d => (
              <option key={d} value={d}>{localizeLabelByType(d, language, "district")}</option>
            ))}
          </select>
        )}

        {cropList.length > 0 && (
          <select value={crop} onChange={e => {
            playSelectSound();
            setCrop(e.target.value);
          }}>
            <option value="">{t("form.selectCrop")}</option>
            {cropList.map(c => (
              <option key={c} value={c}>{localizeLabelByType(c, language, "crop")}</option>
            ))}
          </select>
        )}

        {dateList.length > 0 && (
          <select value={date} onChange={e => {
            playSelectSound();
            setDate(e.target.value);
          }}>
            <option value="">{t("form.selectDate")}</option>
            {dateList.map(d => (
              <option key={d} value={d}>{localizeLabelByType(d, language, "term")}</option>
            ))}
          </select>
        )}

        <button onClick={analyze} disabled={loading}>
          {loading ? t("form.analyzing") : t("form.analyze")}
        </button>
      </div>
    </div>
  );
}

export default FarmerForm;








