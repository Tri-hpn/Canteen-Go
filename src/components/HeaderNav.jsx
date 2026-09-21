import { NavLink } from "react-router-dom";
import {
  Home, UtensilsCrossed, ShoppingCart, Package, Wallet, Gift, User
} from "lucide-react";

const TABS = [
  { key: "home",       label: "Trang chủ",  icon: Home,            path: "/customer" },
  { key: "menu",       label: "Thực đơn",   icon: UtensilsCrossed, path: "/customer/menu" },
  { key: "orders",     label: "Đơn hàng",   icon: Package,         path: "/customer/orders" },
  { key: "wallet",     label: "Ví Canteen", icon: Wallet,          path: "/customer/wallet" },
  { key: "promotions", label: "Khuyến mãi", icon: Gift,            path: "/customer/promotions" },
  { key: "profile",    label: "Hồ sơ",      icon: User,            path: "/customer/profile" }
];

export default function HeaderNav() {
  return (
    <nav className="header-nav">
      <div className="header-nav-inner">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.key}
              to={tab.path}
              end={tab.path === "/customer"}
              className={({ isActive }) => "header-nav-item" + (isActive ? " active" : "")}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}