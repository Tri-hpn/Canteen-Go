import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Utensils, ShoppingBag, Users, X } from "lucide-react";
import { api } from "../api";
import { money } from "./UI";

export default function GlobalSearch({ role }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ menu: [], orders: [], users: [] });
  const boxRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults({ menu: [], orders: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const menu = await api.menu.list(q, "Tất cả", "popular").catch(() => []);
        setResults({ menu: (menu || []).slice(0, 5), orders: [], users: [] });
        setOpen(true);
      } catch {
        // ignore
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  const goTo = (path) => {
    navigate(path);
    setQ("");
    setOpen(false);
  };

  const total = results.menu.length + results.orders.length + results.users.length;

  return (
    <div ref={boxRef} className="global-search">
      <div className="global-search-input">
        <Search size={16} />
        <input
          value={q}
          onChange={(e) => {
          const val = e.target.value;
          setQ(val);
          setOpen(true);
          // Phát sự kiện để trang Menu lắng nghe
          window.dispatchEvent(new CustomEvent("globalsearch", { detail: val }));
        }}
          onFocus={() => q && setOpen(true)}
          placeholder="Tìm món ăn..."
        />
        {q && (
          <button onClick={() => { setQ(""); setOpen(false); }} className="clear-btn">
            <X size={14} />
          </button>
        )}
      </div>

      {open && q && (
        <div className="global-search-dropdown">
          {total === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-light, #8993a3)", fontSize: 13 }}>
              Không tìm thấy "{q}"
            </div>
          )}

          {results.menu.length > 0 && (
            <div>
              <div className="dropdown-section-title">
                <Utensils size={12} /> Món ăn
              </div>
              {results.menu.map((m) => (
                <button
                  key={m._id || m.id}
                  onClick={() => goTo("/customer/menu")}
                  className="dropdown-item"
                >
                  <img src={m.image} alt="" />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary, #172033)" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>{m.category}</div>
                  </div>
                  <b style={{ color: "#18a967", fontSize: 12 }}>{money(m.price)}</b>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
