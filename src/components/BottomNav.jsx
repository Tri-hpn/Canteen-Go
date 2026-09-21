import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingCart, Package, User, Menu, Wallet, Gift, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";

const TABS = [
  { key: "home",   label: "Trang chủ", icon: Home,            path: "/customer" },
  { key: "menu",   label: "Thực đơn",  icon: UtensilsCrossed, path: "/customer/menu" },
  { key: "cart",   label: "Giỏ hàng",  icon: ShoppingCart,    path: "/customer/cart", badge: "cart" },
  { key: "orders", label: "Đơn hàng",  icon: Package,         path: "/customer/orders", badge: "orders" }
];

const MORE_ITEMS = [
  { key: "wallet",     label: "Ví Canteen",  icon: Wallet,   path: "/customer/wallet" },
  { key: "promotions", label: "Khuyến mãi",  icon: Gift,     path: "/customer/promotions" },
  { key: "profile",    label: "Hồ sơ",       icon: User,     path: "/customer/profile" }
];

export default function BottomNav() {
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const readCart = () => {
    try {
      const raw = localStorage.getItem("canteen_cart");
      const cart = raw ? JSON.parse(raw) : {};
      setCartCount(Object.values(cart).reduce((s, m) => s + (m.qty || 0), 0));
    } catch { setCartCount(0); }
  };

  const readOrders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/orders/me", {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      const lastSeen = parseInt(localStorage.getItem("orders_last_seen") || "0");
      const pending = (data || []).filter(o => new Date(o.created_at || 0).getTime() > lastSeen).length;
      setOrderCount(pending);
    } catch { setOrderCount(0); }
  };

  useEffect(() => {
    readCart();
    readOrders();
    const onCart = () => readCart();
    const onOrder = () => readOrders();
    window.addEventListener("cart-updated", onCart);
    window.addEventListener("refresh-cart", onCart);
    window.addEventListener("orders-seen", onOrder);
    window.addEventListener("order-updated", onOrder);
    const t = setInterval(readOrders, 30000);
    return () => {
      window.removeEventListener("cart-updated", onCart);
      window.removeEventListener("refresh-cart", onCart);
      window.removeEventListener("orders-seen", onOrder);
      window.removeEventListener("order-updated", onOrder);
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const getBadge = (key) => {
    if (key === "cart") return cartCount;
    if (key === "orders") return orderCount;
    return 0;
  };

  const isMoreActive = MORE_ITEMS.some(i => location.pathname.startsWith(i.path));

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("canteen_cart");
    window.location.href = "/";
  };

  return (
    <>
      {showMore && (
        <div className="bottom-nav-more-overlay" onClick={() => setShowMore(false)}>
          <div className="bottom-nav-more-menu" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-nav-more-head">
              <span>Menu</span>
              <button onClick={() => setShowMore(false)} className="bottom-nav-more-close">
                <X size={16} />
              </button>
            </div>
            {MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.key}
                  className={"bottom-nav-more-item" + (active ? " active" : "")}
                  onClick={() => { setShowMore(false); navigate(item.path); }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="bottom-nav-more-sep" />
            <button className="bottom-nav-more-item danger" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const badge = getBadge(tab.badge);
          return (
            <NavLink
              key={tab.key}
              to={tab.path}
              end={tab.path === "/customer"}
              className={({ isActive }) => "bottom-nav-item" + (isActive ? " active" : "")}
            >
              <div className="bottom-nav-icon">
                <Icon size={22} />
                {badge > 0 && (
                  <span className="bottom-nav-badge">{badge > 99 ? "99+" : badge}</span>
                )}
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          className={"bottom-nav-item" + (isMoreActive || showMore ? " active" : "")}
          onClick={() => setShowMore(!showMore)}
        >
          <div className="bottom-nav-icon">
            <Menu size={22} />
          </div>
          <span className="bottom-nav-label">Thêm</span>
        </button>
      </nav>
    </>
  );
}