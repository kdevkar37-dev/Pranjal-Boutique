import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../hooks/useAppContext";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppContext();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  return (
    <button
      type="button"
      className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--text-primary)]"
      onClick={() => setLanguage(language === "en" ? "mr" : "en")}
    >
      {language === "en" ? "मराठी" : "English"}
    </button>
  );
}
