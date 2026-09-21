import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { api } from "../../api";
import { money } from "../../components/UI";

const COLORS = ["#18a967", "#f59e0b", "#2634d5", "#ef4444", "#8b5cf6"];

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orderCount: 0, customerCount: 0, lowStock: 0, byStatus: [] });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.orders.all("Tất cả").then((d) => setOrders(d.slice(0, 5))).catch(() => {});
  }, []);

  // Doanh thu đơn vị ĐỒNG (giống OwnerReports)
  const revenueData = [
    { day: "T2", value: 780000 },
    { day: "T3", value: 940000 },
    { day: "T4", value: 1120000 },
    { day: "T5", value: 980000 },
    { day: "T6", value: 1260000 },
    { day: "T7", value: 870000 },
    { day: "CN", value: 420000 }
  ];

  const statusData = stats.byStatus?.length
    ? stats.byStatus.map((s) => ({ name: s._id, value: s.count }))
    : [
        { name: "Chờ xác nhận", value: 3 },
        { name: "Đang chuẩn bị", value: 5 },
        { name: "Hoàn thành", value: 12 },
        { name: "Đã hủy", value: 1 }
      ];

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <KPI icon={<DollarSign />} label="Doanh thu hôm nay" value={money(stats.revenue || 0)} trend="+14.2%" color="#18a967" />
        <KPI icon={<ShoppingBag />} label="Đơn hàng" value={(stats.orderCount || 0) + " đơn"} trend="+8.4%" color="#2634d5" />
        <KPI icon={<Users />} label="Khách hàng" value={(stats.customerCount || 0) + " người"} trend="+5.2%" color="#f59e0b" />
        <KPI icon={<AlertTriangle />} label="Sắp hết hàng" value={(stats.lowStock || 0) + " món"} trend="Cần nhập" color="#ef4444" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: "var(--text-primary, #172033)" }}>Doanh thu 7 ngày</h3>
            <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>Đơn vị: triệu đồng</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #eef2f7)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted, #64748b)" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-muted, #64748b)" }}
                  tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
                />
                <Tooltip formatter={(v) => [money(v), "Doanh thu"]} />
                <Bar dataKey="value" fill="#2634d5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 15, color: "var(--text-primary, #172033)" }}>Trạng thái đơn</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 10 }}>
            {statusData.map((s, i) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                <span style={{ flex: 1, color: "var(--text-muted, #64748b)" }}>{s.name}</span>
                <b style={{ color: "var(--text-primary, #172033)" }}>{s.value}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Đơn hàng mới */}
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 15, color: "var(--text-primary, #172033)" }}>Đơn hàng mới nhất</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Mã đơn</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Khách</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Tổng tiền</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id || o.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                <td style={{ padding: 11, color: "var(--text-primary, #172033)" }}><b>{o.code}</b></td>
                <td style={{ padding: 11, color: "var(--text-primary, #172033)" }}>{o.customer_name}</td>
                <td style={{ padding: 11, color: "var(--text-primary, #172033)" }}><b>{money(o.total)}</b></td>
                <td style={{ padding: 11 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: o.status === "Hoàn thành" ? "#e8f9f1" : "rgba(245, 158, 11, 0.2)", color: o.status === "Hoàn thành" ? "#18a967" : "#c47d10" }}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>Chưa có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, trend, color }) {
  return (
    <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 18, display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: color + "18", color, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{label}</span>
        <h2 style={{ margin: "4px 0", fontSize: 18, color: "var(--text-primary, #172033)" }}>{value}</h2>
        <small style={{ color, fontSize: 11, fontWeight: 600 }}>{trend}</small>
      </div>
    </div>
  );
}