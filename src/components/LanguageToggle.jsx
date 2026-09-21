import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import { getLang, setLang, translations } from "../i18n";

export default function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const [lang, setLangState] = useState(getLang());

  useEffect(() => {
    const handler = (e) => setLangState(e.detail);
    window.addEventListener("langchange", handler);
    return () => window.removeEventListener("langchange", handler);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".lang-toggle")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const change = (l) => {
    setLang(l);
    setLangState(l);
    setOpen(false);
  };

  return (
    <div className="lang-toggle" style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="icon-btn topbar-icon-btn topbar-icon-lang"
        title={translations[lang]?.["lang.select"] || "Language"}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#8b5cf6", background: "rgba(139,92,246,0.08)" }}
      >
        <Globe size={18} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{lang}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e5e9ef)",
          borderRadius: 10, boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
          minWidth: 160, overflow: "hidden", zIndex: 100
        }}>
          {["vi", "en"].map(l => (
            <button
              key={l}
              onClick={() => change(l)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 14px",
                background: lang === l ? "rgba(38, 52, 213, 0.08)" : "transparent",
                border: 0, cursor: "pointer", textAlign: "left",
                color: "var(--text-primary, #172033)", fontSize: 13,
                borderBottom: l === "vi" ? "1px solid var(--border-color, #f1f5f9)" : "none"
              }}
            >
              <span style={{ fontSize: 16 }}>{l === "vi" ? "🇻🇳" : "🇬🇧"}</span>
              <span style={{ flex: 1 }}>{translations[l]["lang." + l]}</span>
              {lang === l && <Check size={14} style={{ color: "#18a967" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
