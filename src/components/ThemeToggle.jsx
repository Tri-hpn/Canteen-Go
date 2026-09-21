import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
    // Phát event cho component khác lắng nghe
    window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  }, [theme]);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button onClick={toggle} className="icon-btn topbar-icon-btn topbar-icon-theme" title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)" }}>
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
