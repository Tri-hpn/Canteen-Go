import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard, Utensils, ShoppingBag, Users, UserCog, Warehouse,
  BarChart3, LogOut, ClipboardList, Bell, UserRound, Menu, X, CreditCard,
  ShoppingCart, Gift, MessageCircle, CalendarCheck, Database, TrendingUp,
  Shield, Wallet, Ticket
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../api";
import { t } from "../i18n";

const icons = {
  dashboard: LayoutDashboard, menu: Utensils, orders: ShoppingBag,
  customers: Users, employees: UserCog, inventory: Warehouse,
  reports: BarChart3, process: ClipboardList, notifications: Bell,
  profile: UserRound, points: Gift,
  chat: MessageCircle, attendance: CalendarCheck, backup: Database,
  price: TrendingUp, permissions: Shield,
  orders_admin: ShoppingBag, finance: Wallet, vouchers: Ticket, promotions: Gift, wallet: CreditCard, wallet_admin: CreditCard
};

export default function Sidebar({ role, onLogout, user }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem("canteen_lang") || "vi");

  // Badge counts
  const [cartCount, setCartCount] = useState(0);
  const [orderPending, setOrderPending] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);

  // ===== Listen langchange =====
  useEffect(() => {
    const handler = (e) => setLang(e.detail);
    window.addEventListener("langchange", handler);
    return () => window.removeEventListener("langchange", handler);
  }, []);

  // ===== Listen toggle-sidebar =====
  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("toggle-sidebar", toggle);
    return () => window.removeEventListener("toggle-sidebar", toggle);
  }, []);

  // ===== Cart count - doc localStorage + listen event =====
  const readCart = () => {
    try {
      const raw = localStorage.getItem("canteen_cart");
      const cart = raw ? JSON.parse(raw) : {};
      const total = Object.values(cart).reduce((s, m) => s + (m.qty || 0), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    if (role !== "CUSTOMER") return;
    readCart();
    const handler = () => readCart();
    window.addEventListener("cart-updated", handler);
    window.addEventListener("refresh-cart", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
      window.removeEventListener("refresh-cart", handler);
    };
  }, [role]);

  // ===== Fetch orders + vouchers (customer only) =====
  const fetchCounts = async () => {
    if (role !== "CUSTOMER") return;
    try {
      const [orders, vouchers] = await Promise.all([
        api.orders.myOrders().catch(() => []),
        api.vouchers.me().catch(() => [])
      ]);

      // Chi dem don Hoan thanh CHUA danh gia
      // Dem don moi hon lan xem cuoi
      const lastSeen = parseInt(localStorage.getItem("orders_last_seen") || "0");
      const pending = (orders || []).filter(o => {
        const created = new Date(o.created_at || 0).getTime();
        return created > lastSeen;
      }).length;
      setOrderPending(pending);

      // Voucher chua dung VA moi hon lan xem cuoi
      const lastSeenPoints = parseInt(localStorage.getItem("points_last_seen") || "0");
      const available = (vouchers || []).filter(v => {
        if (v.used) return false;
        const created = new Date(v.created_at || 0).getTime();
        return created > lastSeenPoints;
      }).length;
      setVoucherCount(available);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (role !== "CUSTOMER") return;
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);

    const onRefresh = () => fetchCounts();
    window.addEventListener("refresh-user", onRefresh);
    window.addEventListener("order-updated", onRefresh);
    window.addEventListener("points-seen", onRefresh);
    window.addEventListener("order-reviewed", onRefresh);
    window.addEventListener("orders-seen", onRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-user", onRefresh);
      window.removeEventListener("order-updated", onRefresh);
      window.removeEventListener("points-seen", onRefresh);
      window.removeEventListener("order-reviewed", onRefresh);
    window.removeEventListener("orders-seen", onRefresh);
    };
  }, [role]);

  const configs = {
    ADMIN: [
      ["dashboard", "nav.dashboard", "/owner"],
      ["orders_admin", "nav.orders", "/owner/orders"],
      ["menu", "nav.menu", "/owner/menu"],
      ["price", "nav.price", "/owner/price-history"],
      ["inventory", "nav.inventory", "/owner/inventory"],
      ["vouchers", "nav.vouchers", "/owner/vouchers"],
      ["finance", "nav.finance", "/owner/finance"],
      ["wallet_admin", "nav.wallet", "/owner/wallet"],
      ["reports", "nav.reports", "/owner/reports"],
      ["employees", "nav.employees", "/owner/employees"],
      ["attendance", "nav.shifts", "/owner/shifts"],
      ["customers", "nav.customers", "/owner/customers"],
      ["permissions", "nav.permissions", "/owner/permissions"],
      ["backup", "nav.backup", "/owner/backup"]
    ],
    EMPLOYEE: [
      ["dashboard", "nav.dashboard", "/employee"],
      ["process", "nav.process", "/employee/attendance"],
      ["orders", "nav.orders", "/employee/orders"],
      ["menu", "nav.menu", "/employee/menu"],
      ["chat", "nav.chat_staff", "/employee/chat"],
    ],
    CUSTOMER: [
      ["dashboard", "nav.home", "/customer"],
      ["menu", "nav.menu", "/customer/menu"],
      ["orders", "nav.orders", "/customer/orders"],
      ["wallet", "nav.wallet", "/customer/wallet"],
      ["promotions", "nav.promotions", "/customer/promotions"],
      ["chat", "nav.chat", "/customer/chat"],
      ["profile", "nav.profile", "/customer/profile"],
    ]
  };

  const list = configs[role] || configs.CUSTOMER;
  const cls = ({ isActive }) => "nav-link " + (isActive ? "active" : "");
  const roleLabel = role === "ADMIN" ? t("role.admin", lang) : role === "EMPLOYEE" ? t("role.employee", lang) : t("role.customer", lang);

  // Tra ve badge theo key
  const getBadge = (key) => {
    if (key === "orders" && orderPending > 0) return orderPending;
    if (key === "points" && voucherCount > 0) return voucherCount;
    return 0;
  };

  return (
    <>
      {open && (
        <div className="mobile-overlay active" onClick={() => setOpen(false)} />
      )}
      <aside className={"sidebar " + (open ? "mobile-open" : "")}>
        <div className="brand">
          <div className="brand-mark">C</div>
          <div className="brand-text">
            <strong>CANTEEN</strong>
            <small>VWA</small>
          </div>
        </div>
        <div className="role-chip">{roleLabel}</div>
        <nav>
          {list.map(([key, labelKey, to]) => {
            const Icon = icons[key] || ShoppingBag;
            const badge = getBadge(key);
            return (
              <NavLink
                key={to + labelKey}
                to={to}
                className={cls}
                end={to === "/owner" || to === "/employee" || to === "/customer"}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                <span>{t(labelKey, lang)}</span>
                {badge > 0 && (
                  <span className="nav-badge">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {role === "ADMIN" && user && (
          <Link
            to="/owner/profile"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginTop: 10,
              background: "transparent", borderRadius: 10,
              textDecoration: "none", transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#172635"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #2634d5, #20c779)",
              color: "#fff", display: "grid", placeItems: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: "hidden"
            }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user.name || "VWA").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name || "Người dùng"}
              </b>
              <small style={{ display: "block", fontSize: 11, color: "#8993a3" }}>
                Quản trị viên
              </small>
            </div>
          </Link>
        )}
        {role === "EMPLOYEE" && user && (
          <Link
            to="/employee/profile"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginTop: 10,
              background: "transparent", borderRadius: 10,
              textDecoration: "none", transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#172635"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #2634d5, #20c779)",
              color: "#fff", display: "grid", placeItems: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: "hidden"
            }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user.name || "VWA").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name || "Người dùng"}
              </b>
              <small style={{ display: "block", fontSize: 11, color: "#8993a3" }}>
                Nhân viên
              </small>
            </div>
          </Link>
        )}
        {role === "CUSTOMER" && user && (
          <Link
            to="/customer/profile"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginTop: 10,
              background: "transparent", borderRadius: 10,
              textDecoration: "none", transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#172635"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #2634d5, #20c779)",
              color: "#fff", display: "grid", placeItems: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: "hidden"
            }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user.name || "VWA").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name || "Người dùng"}
              </b>
              <small style={{ display: "block", fontSize: 11, color: "#8993a3" }}>
                Khách hàng
              </small>
            </div>
          </Link>
        )}
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} /> {t("common.logout", lang)}
        </button>
      </aside>
    </>
  );
}
