import { useEffect, useState, useMemo } from "react";
import { Eye, RefreshCw, Package, Clock, CheckCircle2, XCircle, TrendingUp, ShoppingBag, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { toast } from "../../components/Effects";
import { money, StatusBadge } from "../../components/UI";
import CustomerOrderDetail from "../../components/CustomerOrderDetail";

const STATUSES = [
  { id: "Tất cả", label: "Tất cả", icon: Package, color: "#2634d5" },
  { id: "Chờ xác nhận", label: "Chờ xác nhận", icon: Clock, color: "#f59e0b" },
  { id: "Đã xác nhận", label: "Đã xác nhận", icon: CheckCircle2, color: "#2634d5" },
  { id: "Đang chuẩn bị", label: "Đang chuẩn bị", icon: ShoppingBag, color: "#8b5cf6" },
  { id: "Sẵn sàng nhận", label: "Sẵn sàng nhận", icon: CheckCircle2, color: "#18a967" },
  { id: "Hoàn thành", label: "Hoàn thành", icon: CheckCircle2, color: "#18a967" },
  { id: "Đã hủy", label: "Đã hủy", icon: XCircle, color: "#ef4444" }
];

export default function CustomerOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Tất cả");

  const load = () => {
    setLoading(true);
    api.orders.myOrders()
      .then((data) => {
        const sorted = [...(data || [])].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setOrders(sorted);
      })
      .catch(() => setOrders([]))
      .finally(() => { setLoading(false); });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("orders_last_seen", Date.now().toString());
    window.dispatchEvent(new CustomEvent("orders-seen"));
  }, []);

  const filtered = status === "Tất cả" ? orders : orders.filter(o => o.status === status);

  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => ["Chờ xác nhận", "Đã xác nhận", "Đang chuẩn bị", "Sẵn sàng nhận"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "Hoàn thành").length,
    cancelled: orders.filter(o => o.status === "Đã hủy").length,
    totalSpent: orders.filter(o => o.status === "Hoàn thành").reduce((s, o) => s + (o.total || 0), 0)
  }), [orders]);

  const counts = useMemo(() => {
    const m = { "Tất cả": orders.length };
    orders.forEach(o => { m[o.status] = (m[o.status] || 0) + 1; });
    return m;
  }, [orders]);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard icon={<Package size={20} />} label="Tổng đơn" value={stats.total} color="#2634d5" />
        <StatCard icon={<Clock size={20} />} label="Đang xử lý" value={stats.active} color="#f59e0b" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Hoàn thành" value={stats.completed} color="#18a967" />
        <StatCard icon={<DollarSign size={20} />} label="Tổng chi tiêu" value={money(stats.totalSpent)} color="#8b5cf6" />
      </div>

      {/* Filter */}
      <div className="order-filter-box" style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 12, marginBottom: 20 }}>
        <div className="order-filter-row" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map((s) => {
            const Icon = s.icon;
            const active = status === s.id;
            const count = counts[s.id] || 0;
            return (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: active ? "1px solid " + s.color : "1px solid var(--border-color, #e5e9ef)",
                  background: active ? s.color : "var(--bg-tertiary, #f5f7fb)",
                  color: active ? "#fff" : "var(--text-muted, #475569)",
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontWeight: active ? 700 : 500,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s"
                }}
              >
                <Icon size={13} />
                {s.label}
                {count > 0 && (
                  <span style={{
                    background: active ? "rgba(255,255,255,0.3)" : "var(--card-bg, #e2e8f0)",
                    color: active ? "#fff" : "var(--text-muted, #64748b)",
                    minWidth: 18,
                    height: 18,
                    padding: "0 6px",
                    borderRadius: 9,
                    fontSize: 10.5,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
          📦 Danh sách đơn hàng
          <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)", fontWeight: 400 }}>
            ({filtered.length} đơn)
          </span>
        </h3>
        <button
          onClick={() => { load(); toast("Đã làm mới", "success"); }}
          disabled={loading}
          style={{
            padding: "8px 14px",
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color, #e5e9ef)",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 12.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-primary, #172033)",
            opacity: loading ? 0.6 : 1
          }}
        >
          <RefreshCw size={13} className={loading ? "spin" : ""} />
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
    <div className="order-card" style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e7ebf0)",
          borderRadius: 14, padding: 60, textAlign: "center"
        }}>
          <Package size={50} style={{ color: "var(--text-light, #8993a3)", opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ margin: "0 0 6px", color: "var(--text-primary, #172033)", fontSize: 15 }}>
            {status === "Tất cả" ? "Chưa có đơn hàng nào" : `Không có đơn "${status}"`}
          </h3>
          <p style={{ margin: "0 0 16px", color: "var(--text-muted, #64748b)", fontSize: 13 }}>
            {status === "Tất cả" ? "Đặt món để bắt đầu trải nghiệm nhé!" : "Thử chọn trạng thái khác"}
          </p>
          {status === "Tất cả" && (
            <Link to="/customer/menu" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#2634d5", color: "#fff",
              padding: "10px 20px", borderRadius: 10,
              textDecoration: "none", fontWeight: 700, fontSize: 13
            }}>
              <ShoppingBag size={15} /> Đặt món ngay
            </Link>
          )}
        </div>
      ) : (
        <div className="orders-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {filtered.map((o) => (
            <OrderCard
              key={o._id || o.id}
              order={o}
              onView={() => setSelected(o)}
            />
          ))}
        </div>
      )}

      {selected && (
        <CustomerOrderDetail order={selected} user={user} onClose={() => setSelected(null)} onUpdate={load} />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

/* ============ ORDER CARD ============ */
function OrderCard({ order, onView }) {
  const statusColor = {
    "Chờ xác nhận": "#f59e0b",
    "Đã xác nhận": "#2634d5",
    "Đang chuẩn bị": "#8b5cf6",
    "Sẵn sàng nhận": "#18a967",
    "Hoàn thành": "#18a967",
    "Đã hủy": "#ef4444"
  }[order.status] || "#64748b";

  const statusBg = {
    "Chờ xác nhận": "#fef3c7",
    "Đã xác nhận": "#dbeafe",
    "Đang chuẩn bị": "#ede9fe",
    "Sẵn sàng nhận": "#d1fae5",
    "Hoàn thành": "#d1fae5",
    "Đã hủy": "#fee2e2"
  }[order.status] || "#f1f5f9";

  const items = order.items || [];
  const previewItems = items.slice(0, 3);
  const remaining = items.length - previewItems.length;

  return (
    <div className="order-card" style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #e7ebf0)",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.2s"
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px dashed var(--border-color, #eef2f7)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--bg-tertiary, #f8fafc)"
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", fontWeight: 600, marginBottom: 2 }}>
            MÃ ĐƠN
          </div>
          <b style={{ fontSize: 14, color: "#2634d5", fontFamily: "monospace" }}>{order.code}</b>
        </div>
        <span style={{
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          background: statusBg,
          color: statusColor,
          whiteSpace: "nowrap"
        }}>
          {order.status}
        </span>
      </div>

      {/* Items preview */}
      <div style={{ padding: 14, flex: 1 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: "linear-gradient(135deg, #2634d5, #3b82f6, #8b5cf6, #ec4899, #2634d5)", backgroundSize: "300% 300%", animation: "rainbow 4s ease infinite", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, flexShrink: 0, boxShadow: "0 4px 16px rgba(38, 52, 213, 0.4)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 7 12 3 21 7 12 11 3 7"/>
              <polyline points="3 7 3 17 12 21 12 11"/>
              <polyline points="21 7 21 17 12 21"/>
              <line x1="8" y1="13" x2="8" y2="18"/>
              <ellipse cx="8" cy="12" rx="1.2" ry="1"/>
              <line x1="16" y1="13" x2="16" y2="18"/>
              <line x1="15" y1="12" x2="15" y2="13.5"/>
              <line x1="17" y1="12" x2="17" y2="13.5"/>
            </svg>
            <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: 0.3, lineHeight: 1, marginTop: 1 }}>CANTEEN</span>
            <span style={{ fontSize: 6, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1, opacity: 0.9 }}>VWA</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, marginLeft: 4 }}>
            <b style={{ fontSize: 13, color: "var(--text-primary, #172033)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {items[0]?.name || "Đơn hàng"}
              {items.length > 1 && <span style={{ color: "var(--text-muted, #64748b)", fontWeight: 400 }}> +{items.length - 1} món</span>}
            </b>
            <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>
              {items.reduce((s, it) => s + (it.qty || 0), 0)} phần
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-light, #8993a3)" }}>
            <Calendar size={12} />
            {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border-color, #eef2f7)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--bg-tertiary, #f8fafc)"
      }}>
        <div>
          <span style={{ fontSize: 10, color: "var(--text-light, #8993a3)", display: "block" }}>TỔNG CỘNG</span>
          <b style={{ fontSize: 17, color: "#2634d5" }}>{money(order.total)}</b>
        </div>
        <button
          onClick={onView}
          style={{
            padding: "9px 16px",
            background: "#2634d5",
            color: "#fff",
            border: 0,
            borderRadius: 9,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Eye size={14} /> Chi tiết
        </button>
      </div>
    </div>
  );
}

/* ============ STAT CARD ============ */
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #e7ebf0)",
      borderRadius: 12,
      padding: 16,
      display: "flex",
      alignItems: "center",
      gap: 12
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: color + "18",
        color,
        display: "grid", placeItems: "center",
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 11.5, color: "var(--text-light, #8993a3)", display: "block" }}>{label}</span>
        <b style={{ fontSize: 18, color, fontWeight: 800 }}>{value}</b>
      </div>
    </div>
  );
}