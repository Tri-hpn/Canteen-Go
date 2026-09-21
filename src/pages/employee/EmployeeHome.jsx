import { useEffect, useState } from "react";
import { ShoppingBag, Clock, AlertTriangle, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { money, StatusBadge } from "../../components/UI";
import CheckInOutCard from "../../components/CheckInOutCard";
import { useTranslation } from "../../i18n";

export default function EmployeeHome() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.orders.all("Tất cả").then((d) => setOrders((d || []))).catch(() => {});
    api.stats().then(setStats).catch(() => {});
  }, []);

  const pending = orders.filter((o) => o.status === "Chờ xác nhận").length;
  const processing = orders.filter((o) => o.status === "Đang chuẩn bị" || o.status === "Đã xác nhận").length;
  const needAction = orders.filter((o) => ["Chờ xác nhận", "Đã xác nhận", "Đang chuẩn bị"].includes(o.status));
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = orders.filter((o) => (o.created_at || "").startsWith(todayStr)).length;

  return (
    <div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18, marginBottom: 18 }}>
        <CheckInOutCard />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <ShoppingBag size={22} style={{ color: "#2634d5" }} />
            <div><b style={{ fontSize: 20 }}>{todayCount}</b><div style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{t("employee.ordersToday")}</div></div>
          </div>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <Clock size={22} style={{ color: "#f59e0b" }} />
            <div><b style={{ fontSize: 20 }}>{pending}</b><div style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{t("employee.pendingOrders")}</div></div>
          </div>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <Utensils size={22} style={{ color: "#8b5cf6" }} />
            <div><b style={{ fontSize: 20 }}>{processing}</b><div style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>Đang chuẩn bị</div></div>
          </div>
          <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <AlertTriangle size={22} style={{ color: "#f59e0b" }} />
            <div><b style={{ fontSize: 20 }}>{stats?.lowStock ?? 0}</b><div style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{t("employee.lowStock")}</div></div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, color: "var(--text-primary, #172033)" }}>{t("employee.processOrder")}</h3>
            <span style={{ color: "var(--text-light, #8993a3)", fontSize: 12 }}>{t("employee.priority")}</span>
          </div>
          <Link to="/employee/orders" style={{ color: "#2634d5", fontSize: 13, textDecoration: "none" }}>{t("employee.viewAll")} →</Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("orders.code")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Customer</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("cart.total")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("common.status")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}></th>
            </tr>
          </thead>
          <tbody>
            {needAction.map((o) => (
              <tr key={o._id || o.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                <td style={{ padding: 11 }}><b>{o.code}</b></td>
                <td style={{ padding: 11 }}>{o.customer_name}</td>
                <td style={{ padding: 11 }}><b>{money(o.total)}</b></td>
                <td style={{ padding: 11 }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: 11 }}>
                  <Link to="/employee/orders" style={{ padding: "6px 12px", background: "var(--bg-tertiary, #f5f7fb)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6, fontSize: 12, textDecoration: "none", color: "var(--text-primary, #172033)" }}>
                    {t("employee.process")}
                  </Link>
                </td>
              </tr>
            ))}
            {!needAction.length && (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>"Không có đơn cần xử lý"</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
