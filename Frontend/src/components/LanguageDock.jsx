import { useI18n } from "../i18n/I18nProvider";
import { LANGUAGES } from "../i18n/translations";

function LanguageDock() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="language-dock" role="group" aria-label={t("common.language")}>
      <label htmlFor="language-dock-select">{t("common.language")}</label>
      <select
        id="language-dock-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageDock;
