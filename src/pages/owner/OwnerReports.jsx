import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { api } from "../../api";
import { money } from "../../components/UI";

const COLORS = ["#18a967", "#f59e0b", "#2634d5", "#ef4444", "#8b5cf6"];

const PERIODS = [
  { id: "day", label: "Theo ngày" },
  { id: "week", label: "Theo tuần" },
  { id: "month", label: "Theo tháng" },
  { id: "year", label: "Theo năm" }
];

export default function OwnerReports() {
  const [period, setPeriod] = useState("day");
  const [data, setData] = useState({ data: [], totalRevenue: 0, totalOrders: 0, avgOrder: 0, topItems: [] });
  const [stats, setStats] = useState({ revenue: 0, orderCount: 0, customerCount: 0, byStatus: [] });
  const [loading, setLoading] = useState(false);

  const loadReports = () => {
    setLoading(true);
    api.reports.revenue(period)
      .then(setData)
      .catch(() => setData({ data: [], totalRevenue: 0, totalOrders: 0, avgOrder: 0, topItems: [] }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 15000); // realtime 15s
    return () => clearInterval(interval);
  }, [period]);

  const chartData = (data.data || []).map(d => ({ day: d.label, value: d.revenue }));

  const statusData = stats.byStatus?.length
    ? stats.byStatus.map((s) => ({ name: s._id, value: s.count }))
    : [
        { name: "Hoàn thành", value: 0 },
        { name: "Đã hủy", value: 0 }
      ];

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <KPI
          icon={<DollarSign size={22} />}
          label="Doanh thu hôm nay"
          value={money(stats.revenue || 0)}
          color="#18a967"
        />
        <KPI
          icon={<ShoppingBag size={22} />}
          label={`Tổng đơn (${PERIODS.find(p => p.id === period)?.label})`}
          value={data.totalOrders || 0}
          color="#2634d5"
        />
        <KPI
          icon={<TrendingUp size={22} />}
          label="Giá trị TB / đơn"
          value={money(data.avgOrder || 0)}
          color="#f59e0b"
        />
        <KPI
          icon={<DollarSign size={22} />}
          label={`Tổng DT (${PERIODS.find(p => p.id === period)?.label})`}
          value={money(data.totalRevenue || 0)}
          color="#8b5cf6"
        />
      </div>

      {/* Filter Period + Refresh */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 20,
                border: period === p.id ? "1px solid #2634d5" : "1px solid var(--border-color, #e5e9ef)",
                background: period === p.id ? "#2634d5" : "var(--card-bg, #fff)",
                color: period === p.id ? "#fff" : "var(--text-muted, #475569)",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: period === p.id ? 700 : 500,
                transition: "all 0.2s"
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          style={{
            padding: "10px 16px",
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color, #e5e9ef)",
            borderRadius: 10,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 13,
            color: "var(--text-primary, #172033)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, color: "var(--text-primary, #172033)" }}>
            Doanh thu {PERIODS.find(p => p.id === period)?.label.toLowerCase()}
          </h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
          <h3 style={{ marginTop: 0, marginBottom: 16, color: "var(--text-primary, #172033)" }}>Trạng thái đơn</h3>
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

      {/* Top 5 mon ban chay — REALTIME */}
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>🔥 Top 5 món bán chạy (realtime)</h3>
          <span style={{ fontSize: 11, color: "var(--text-light, #94a3b8)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#18a967", animation: "pulse 1.5s infinite" }} />
            Cập nhật mỗi 15s
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>#</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Món</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Đã bán</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {(data.topItems || []).map((item, i) => {
              const isTop3 = i < 3;
              return (
                <tr key={item.id || i} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                  <td style={{ padding: 11 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isTop3 ? "rgba(245, 158, 11, 0.2)" : "var(--bg-tertiary, #f1f5f9)",
                      color: isTop3 ? "#f59e0b" : "var(--text-muted, #64748b)",
                      display: "inline-grid", placeItems: "center",
                      fontWeight: 700, fontSize: 13,
                      border: isTop3 ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid transparent"
                    }}>{i + 1}</span>
                  </td>
                  <td style={{ padding: 11, color: "var(--text-primary, #172033)" }}><b>{item.name}</b></td>
                  <td style={{ padding: 11, textAlign: "right", color: "var(--text-muted, #64748b)" }}>{item.sold} suất</td>
                  <td style={{ padding: 11, textAlign: "right" }}>
                    <b style={{ color: "#18a967" }}>{money(item.revenue)}</b>
                  </td>
                </tr>
              );
            })}
            {!data.topItems?.length && (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>
                Chưa có dữ liệu
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

function KPI({ icon, label, value, color }) {
  return (
    <div style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #e7ebf0)",
      borderRadius: 12, padding: 18,
      display: "flex", gap: 12, alignItems: "center"
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: color + "18", color, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{label}</span>
        <h2 style={{ margin: "4px 0 0", fontSize: 18, color: "var(--text-primary, #172033)" }}>{value}</h2>
      </div>
    </div>
  );
}