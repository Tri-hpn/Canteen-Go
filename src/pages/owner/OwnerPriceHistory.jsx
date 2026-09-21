import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Search, Calendar } from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";

export default function OwnerPriceHistory() {
  const [history, setHistory] = useState([]);
  const [menu, setMenu] = useState([]);
  const [q, setQ] = useState("");
  const [filterItem, setFilterItem] = useState("");

  const load = async () => {
    try {
      const data = await api.priceHistory.list(filterItem);
      setHistory(data || []);
    } catch { setHistory([]); }
  };

  useEffect(() => {
    api.menu.list("", "Tất cả", "popular", true).then(setMenu).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterItem]);

  const filtered = history.filter(h =>
    h.menu_item_name?.toLowerCase().includes(q.toLowerCase())
  );

  const totalChanges = filtered.length;
  const avgIncrease = filtered
    .filter(h => h.new_price > h.old_price)
    .reduce((s, h) => s + (h.new_price - h.old_price), 0) / (filtered.filter(h => h.new_price > h.old_price).length || 1);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<TrendingUp />} label="Tổng lần đổi giá" value={totalChanges} color="#2634d5" />
        <StatCard icon={<TrendingUp />} label="Tăng giá" value={filtered.filter(h => h.new_price > h.old_price).length} color="#ef4444" />
        <StatCard icon={<TrendingDown />} label="Giảm giá" value={filtered.filter(h => h.new_price < h.old_price).length} color="#18a967" />
      </div>

      {/* Filters */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 16, marginBottom: 16,
        display: "flex", gap: 12, flexWrap: "wrap"
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--bg-tertiary, #f5f7fb)",
          border: "1px solid var(--border-color, #e5e9ef)",
          borderRadius: 8, padding: "8px 12px", flex: 1, maxWidth: 300
        }}>
          <Search size={16} style={{ color: "var(--text-light, #8993a3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên món..."
            style={{
              border: 0, outline: "none", background: "transparent",
              color: "var(--text-primary, #172033)", fontSize: 13, flex: 1
            }}
          />
        </div>

        <select
          value={filterItem}
          onChange={(e) => setFilterItem(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border-color, #e5e9ef)",
            borderRadius: 8, outline: "none", fontSize: 13,
            background: "var(--bg-secondary, #fff)",
            color: "var(--text-primary, #172033)",
            cursor: "pointer", minWidth: 200
          }}
        >
          <option value="">Tất cả món</option>
          {menu.map(m => (
            <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* History table */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20
      }}>
        <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>
          <Calendar size={18} style={{ display: "inline", marginRight: 8 }} />
          Lịch sử thay đổi giá ({filtered.length})
        </h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Thời gian</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Món ăn</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Giá cũ</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Giá mới</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Chênh lệch</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Người đổi</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Lý do</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => {
              const diff = h.new_price - h.old_price;
              const percent = ((diff / h.old_price) * 100).toFixed(1);
              const isUp = diff > 0;
              return (
                <tr key={h.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                  <td style={{ padding: 11, fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                    {new Date(h.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td style={{ padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" }}>
                    <b>{h.menu_item_name}</b>
                  </td>
                  <td style={{ padding: 11, textAlign: "right", fontSize: 13, color: "var(--text-muted, #64748b)" }}>
                    {money(h.old_price)}
                  </td>
                  <td style={{ padding: 11, textAlign: "right", fontSize: 13, color: "var(--text-primary, #172033)" }}>
                    <b>{money(h.new_price)}</b>
                  </td>
                  <td style={{ padding: 11, textAlign: "right", fontSize: 13 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      color: isUp ? "#ef4444" : "#18a967",
                      fontWeight: 700
                    }}>
                      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isUp ? "+" : ""}{money(diff).replace("-", "")}
                      <span style={{ fontSize: 11, opacity: 0.8 }}>({isUp ? "+" : ""}{percent}%)</span>
                    </span>
                  </td>
                  <td style={{ padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" }}>
                    {h.changed_by}
                  </td>
                  <td style={{ padding: 11, fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                    {h.reason || "—"}
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>
                  Chưa có lịch sử thay đổi giá
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
        width: 46, height: 46, borderRadius: 12,
        background: color + "20", color,
        display: "grid", placeItems: "center"
      }}>
        {icon}
      </div>
      <div>
        <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{label}</span>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary, #172033)" }}>{value}</div>
      </div>
    </div>
  );
}
