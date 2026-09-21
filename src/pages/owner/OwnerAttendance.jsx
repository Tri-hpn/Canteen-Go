import { useEffect, useState } from "react";
import { Calendar, Filter, Clock, TrendingUp, AlertTriangle, Search } from "lucide-react";
import { api } from "../../api";

export default function OwnerAttendance() {
  const [list, setList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({
    month: new Date().toISOString().slice(0, 7),
    employee_id: "",
    status: ""
  });
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const params = { month: filter.month };
      if (filter.employee_id) params.employee_id = filter.employee_id;
      const data = await api.attendance.all(params);
      setList(data || []);
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    api.attendance.employees().then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filter.month, filter.employee_id]);

  const filtered = list.filter(a => {
    if (filter.status && a.status !== filter.status) return false;
    if (search && !a.employee_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Thống kê
  const stats = {
    total: filtered.length,
    onTime: filtered.filter(a => a.status === "Đúng giờ").length,
    late: filtered.filter(a => a.status === "Đi muộn").length,
    totalHours: filtered.reduce((s, a) => s + (a.hours || 0), 0)
  };

  const fmt = (d) => d ? new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";
  const fmtDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
  };

  const statusColor = (s) => {
    if (s === "Đúng giờ") return { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
    if (s === "Đi muộn") return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
    if (s === "Về sớm") return { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" };
    return { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
  };

  const isDark = () => document.documentElement.classList.contains("dark-mode");
  const getStatusStyle = (s) => {
    const c = statusColor(s);
    if (isDark()) {
      if (s === "Đúng giờ") return { bg: "#065f46", color: "#d1fae5", border: "#10b981" };
      if (s === "Đi muộn") return { bg: "#92400e", color: "#fef3c7", border: "#f59e0b" };
      if (s === "Về sớm") return { bg: "#1e3a8a", color: "#dbeafe", border: "#3b82f6" };
      return { bg: "#991b1b", color: "#fee2e2", border: "#ef4444" };
    }
    return c;
  };

  return (
    <div>
      {/* Thống kê */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Calendar />} label="Tổng ngày công" value={stats.total} color="#2634d5" />
        <StatCard icon={<TrendingUp />} label="Đúng giờ" value={stats.onTime} color="#18a967" />
        <StatCard icon={<AlertTriangle />} label="Đi muộn" value={stats.late} color="#f59e0b" />
        <StatCard icon={<Clock />} label="Tổng giờ làm" value={stats.totalHours.toFixed(1) + "h"} color="#8b5cf6" />
      </div>

      {/* Filters */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 16, marginBottom: 16,
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={16} style={{ color: "var(--text-light, #8993a3)" }} />
          <input
            type="month"
            value={filter.month}
            onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            style={{
              padding: "8px 12px", border: "1px solid var(--border-color, #e5e9ef)",
              borderRadius: 8, outline: "none", fontSize: 13,
              background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
            }}
          />
        </div>

        <select
          value={filter.employee_id}
          onChange={(e) => setFilter({ ...filter, employee_id: e.target.value })}
          style={{
            padding: "8px 12px", border: "1px solid var(--border-color, #e5e9ef)",
            borderRadius: 8, outline: "none", fontSize: 13,
            background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)",
            cursor: "pointer"
          }}
        >
          <option value="">Tất cả nhân viên</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          style={{
            padding: "8px 12px", border: "1px solid var(--border-color, #e5e9ef)",
            borderRadius: 8, outline: "none", fontSize: 13,
            background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)",
            cursor: "pointer"
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option>Đúng giờ</option>
          <option>Đi muộn</option>
          <option>Về sớm</option>
        </select>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-tertiary, #f5f7fb)",
          border: "1px solid var(--border-color, #e5e9ef)",
          borderRadius: 8, padding: "8px 12px", flex: 1, maxWidth: 300
        }}>
          <Search size={16} style={{ color: "var(--text-light, #8993a3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên..."
            style={{
              border: 0, outline: "none", background: "transparent",
              color: "var(--text-primary, #172033)", fontSize: 13, flex: 1
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Ngày</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Nhân viên</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Check-in</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Check-out</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Giờ làm</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const st = getStatusStyle(a.status);
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                  <td style={{ padding: 11, color: "var(--text-primary, #172033)", fontSize: 13 }}>
                    <b>{fmtDate(a.date)}</b>
                  </td>
                  <td style={{ padding: 11 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg,#2634d5,#20c779)",
                        color: "#fff", display: "grid", placeItems: "center",
                        fontWeight: 700, fontSize: 11
                      }}>
                        {(a.employee_name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <b style={{ color: "var(--text-primary, #172033)", fontSize: 13 }}>{a.employee_name}</b>
                    </div>
                  </td>
                  <td style={{ padding: 11, color: "var(--text-primary, #172033)", fontSize: 13 }}>{fmt(a.checkIn)}</td>
                  <td style={{ padding: 11, color: "var(--text-muted, #64748b)", fontSize: 13 }}>{fmt(a.checkOut)}</td>
                  <td style={{ padding: 11, textAlign: "right", color: "var(--text-primary, #172033)", fontSize: 13 }}>
                    <b>{a.hours ? a.hours + "h" : "—"}</b>
                  </td>
                  <td style={{ padding: 11 }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: st.bg, color: st.color, border: "1px solid " + st.border
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>
                  Không có dữ liệu chấm công
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #e7ebf0)",
      borderRadius: 12, padding: 18,
      display: "flex", gap: 12, alignItems: "center"
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: color + "20", color,
        display: "grid", placeItems: "center"
      }}>
        {icon}
      </div>
      <div>
        <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{label}</span>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary, #172033)" }}>{value}</div>
      </div>
    </div>
  );
}
