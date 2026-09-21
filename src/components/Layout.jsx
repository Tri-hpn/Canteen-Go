import Sidebar from "./Sidebar";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import Footer from "./Footer";
import HeaderNav from "./HeaderNav";
import BottomNav from "./BottomNav";
import { ChevronDown, Menu, ShoppingCart, LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { t } from "../i18n";
import { useEffect, useState } from "react";

function TopbarLogo({ role }) {
  const home = role === "ADMIN" ? "/owner" : role === "EMPLOYEE" ? "/employee" : "/customer";
  return (
    <Link to={home} className="topbar-logo" title="Canteen VWA">
      <img src="/icon.svg" alt="Canteen VWA" className="topbar-logo-img" />
      <div className="topbar-logo-text">
        <b>CANTEEN</b>
        <small>VWA</small>
      </div>
    </Link>
  );
}

function CartTopbarIcon() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("canteen_cart");
        const cart = raw ? JSON.parse(raw) : {};
        setCount(Object.values(cart).reduce((s, m) => s + (m.qty || 0), 0));
      } catch { setCount(0); }
    };
    read();
    window.addEventListener("cart-updated", read);
    window.addEventListener("refresh-cart", read);
    return () => {
      window.removeEventListener("cart-updated", read);
      window.removeEventListener("refresh-cart", read);
    };
  }, []);
  return (
    <Link to="/customer/cart" className="cart-topbar-icon" title="Giỏ hàng">
      <ShoppingCart size={18} />
      {count > 0 && <span className="badge">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}

export default function Layout({ role, children, title, subtitle, onLogout, user, hideHeading = false, showFooter = false }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem("canteen_lang") || "vi");
  const initials = (user?.name || "VWA").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = role === "ADMIN" ? t("role.admin", lang) : role === "EMPLOYEE" ? t("role.employee", lang) : t("role.customer", lang);

    useEffect(() => {
    if (role === "CUSTOMER") document.body.classList.add("has-bottom-nav");
    else document.body.classList.remove("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, [role]);

useEffect(() => {
    const handler = (e) => setLang(e.detail);
    window.addEventListener("langchange", handler);
    return () => window.removeEventListener("langchange", handler);
  }, []);

  // ============ INLINE STYLES ============
  const topbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    padding: "0 24px",
    height: 64,
    background: "var(--card-bg, #fff)",
    borderBottom: "1px solid var(--border-color, #e5e9ef)",
    position: "sticky",
    top: 0,
    zIndex: 10
  };

  const topbarLeftStyle = {
    flex: "1 1 auto",
    minWidth: 0,
    maxWidth: "none",
    display: "flex",
    alignItems: "center"
  };

  const topbarRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0
  };

  const profileMiniStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 10px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 30,
    cursor: "pointer",
    maxWidth: 220,
    transition: "all 0.2s"
  };

  const avatarStyle = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2634d5, #20c779)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    overflow: "hidden",
    objectFit: "cover"
  };

  const profileInfoStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 2,
    lineHeight: 1.2,
    overflow: "hidden",
    minWidth: 0,
    maxWidth: 140
  };

  const profileNameStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary, #172033)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 140,
    margin: 0,
    padding: 0
  };

  const profileRoleStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 400,
    color: "var(--text-light, #8993a3)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 140,
    margin: 0,
    padding: 0
  };

  return (
    <div className={"app-shell" + (role === "CUSTOMER" ? " customer-layout" : "")}>
      {role !== "CUSTOMER" && <Sidebar role={role} onLogout={onLogout} user={user} />}

      <main className="main">
        {/* ============ TOPBAR ============ */}
        <header style={topbarStyle}>
          <div style={topbarLeftStyle}>
            {role === "CUSTOMER" && <TopbarLogo role={role} />}

            {/* Nut 3 gach — chi hien mobile */}
            {role !== "CUSTOMER" && (
              <button
              className="hamburger-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
            )}

            {role === "CUSTOMER" && <GlobalSearch role={role} />}
          </div>

          <div style={topbarRightStyle}>
            {role === "CUSTOMER" && <CartTopbarIcon />}
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell />

            <button
              onClick={() => { if (confirm("Đăng xuất khỏi Canteen VWA?")) onLogout(); }}
              className="icon-btn topbar-icon-btn topbar-icon-logout"
              title="Đăng xuất"
              style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)" }}
            >
              <LogOut size={18} />
            </button>

            <button
              style={{ display: "none" }}
              onClick={() => navigate(role === "ADMIN" ? "/owner/profile" : role === "EMPLOYEE" ? "/employee/profile" : "/customer/profile")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-tertiary, #f5f7fb)";
                e.currentTarget.style.borderColor = "var(--border-color, #e5e9ef)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={avatarStyle} />
              ) : (
                <span style={avatarStyle}>{initials}</span>
              )}

              <span style={profileInfoStyle}>
                <b style={profileNameStyle}>{user?.name || "Người dùng"}</b>
                <small style={profileRoleStyle}>{roleLabel}</small>
              </span>

              <ChevronDown size={16} style={{ color: "var(--text-light, #94a3b8)", flexShrink: 0 }} />
            </button>
          </div>
        </header>

        {role === "CUSTOMER" && <HeaderNav />}

        {/* ============ PAGE CONTENT ============ */}
        <section className="page-content">
                    {children}

          {showFooter && <Footer />}
        </section>
      </main>

      {role === "CUSTOMER" && <BottomNav />}
    </div>
  );
}