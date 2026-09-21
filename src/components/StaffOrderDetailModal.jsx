import { useState, useEffect } from "react";
import { X, Package, Clock, ChefHat, CheckCircle2, Truck, CreditCard, Banknote, QrCode, User, MapPin, ShoppingBag, RefreshCw } from "lucide-react";
import { api } from "../api";
import { money } from "./UI";

const STATUS_FLOW = {
  "Cho xac nhan": { step: 1, label: "Cho xac nhan", color: "#f59e0b" },
  "Da xac nhan": { step: 2, label: "Da xac nhan", color: "#2634d5" },
  "Dang chuan bi": { step: 3, label: "Dang chuan bi", color: "#8b5cf6" },
  "San sang nhan": { step: 4, label: "San sang nhan", color: "#18a967" },
  "Hoan thanh": { step: 5, label: "Hoan thanh", color: "#18a967" },
  "Da huy": { step: 0, label: "Da huy", color: "#ef4444" },
  "Chờ xác nhận": { step: 1, label: "Chờ xác nhận", color: "#f59e0b" },
  "Đã xác nhận": { step: 2, label: "Đã xác nhận", color: "#2634d5" },
  "Đang chuẩn bị": { step: 3, label: "Đang chuẩn bị", color: "#8b5cf6" },
  "Sẵn sàng nhận": { step: 4, label: "Sẵn sàng nhận", color: "#18a967" },
  "Hoàn thành": { step: 5, label: "Hoàn thành", color: "#18a967" },
  "Đã hủy": { step: 0, label: "Đã hủy", color: "#ef4444" }
};

const ALL_STEPS = [
  { step: 1, label: "Chờ xác nhận", icon: Clock },
  { step: 2, label: "Đã xác nhận", icon: CheckCircle2 },
  { step: 3, label: "Đang chuẩn bị", icon: ChefHat },
  { step: 4, label: "Sẵn sàng nhận", icon: Truck },
  { step: 5, label: "Hoàn thành", icon: CheckCircle2 }
];

const PAYMENT_ICONS = {
  "Tiền mặt": Banknote,
  "QR": QrCode,
  "Thẻ": CreditCard
};

export default function StaffOrderDetailModal({ order: initialOrder, onClose }) {
  const [order, setOrder] = useState(initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  if (!order) return null;

  const refresh = async () => {
    if (!order?._id && !order?.id) return;
    setRefreshing(true);
    try {
      const id = order._id || order.id;
      const list = await api.orders.all("Tất cả");
      const updated = (list || []).find(o => (o._id || o.id) === id);
      if (updated) {
        setOrder(updated);
        setLastUpdated(new Date());
      }
    } catch (e) {}
    finally { setRefreshing(false); }
  };

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [order?._id, order?.id]);

  const current = STATUS_FLOW[order.status] || STATUS_FLOW["Chờ xác nhận"];
  const isCancelled = order.status === "Đã hủy" || order.status === "Da huy";
  const isCompleted = order.status === "Hoàn thành" || order.status === "Hoan thanh";
  const pickupMatch = (order.note || "").match(/Nhận lúc (\d{2}:\d{2}(?:\s*-\s*\d{2}:\d{2})?)/);
  const pickupTime = pickupMatch ? pickupMatch[1] : null;
  const paymentStatus = isCompleted ? "Đã thanh toán" : (isCancelled ? "Đã hủy" : "Chưa thanh toán");
  const paymentColor = isCompleted ? "#18a967" : (isCancelled ? "#ef4444" : "#f59e0b");
  const paymentBg = isCompleted ? "#e8f9f1" : (isCancelled ? "#fee2e2" : "#fff4d8");
  const PaymentIcon = PAYMENT_ICONS[order.payment] || Banknote;
  const totalQty = (order.items || []).reduce((s, it) => s + (it.qty || 0), 0);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 200, padding: 20, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#2634d5,#20c779)", color: "#fff", display: "grid", placeItems: "center" }}>
              <Package size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>Chi tiết đơn hàng</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <b style={{ fontSize: 13, color: "#2634d5" }}>{order.code}</b>
                <span style={{ fontSize: 10, color: "var(--text-light, #94a3b8)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: refreshing ? "#f59e0b" : "#18a967" }} />
                  {refreshing ? "Đang cập nhật..." : "Realtime"}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={refresh} style={{ background: "var(--bg-tertiary, #f5f7fb)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, cursor: "pointer", padding: 8, color: "var(--text-primary, #172033)" }}>
              <RefreshCw size={16} />
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>
        </div>

        {!isCancelled && (
          <div style={{ background: "var(--bg-tertiary, #f5f7fb)", borderRadius: 12, padding: 18, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {ALL_STEPS.map((s, i) => {
                const active = current.step >= s.step;
                const Icon = s.icon;
                return (
                  <div key={s.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                    {i < ALL_STEPS.length - 1 && (
                      <div style={{ position: "absolute", top: 16, left: "50%", right: "-50%", height: 2, background: current.step > s.step ? "#18a967" : "var(--border-color, #e5e9ef)", zIndex: 0 }} />
                    )}
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: active ? "#18a967" : "var(--card-bg, #fff)", color: active ? "#fff" : "var(--text-light, #94a3b8)", border: "2px solid " + (active ? "#18a967" : "var(--border-color, #e5e9ef)"), display: "grid", placeItems: "center", position: "relative", zIndex: 1 }}>
                      <Icon size={14} />
                    </div>
                    <span style={{ fontSize: 10, marginTop: 6, textAlign: "center", color: active ? "var(--text-primary, #172033)" : "var(--text-light, #94a3b8)", fontWeight: active ? 700 : 500 }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div style={{ background: "#fee2e2", borderRadius: 12, padding: 14, marginBottom: 18, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <X size={20} color="#ef4444" />
            <b style={{ color: "#991b1b", fontSize: 14 }}>Đơn hàng đã bị hủy</b>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
          <div style={{ padding: 12, borderRadius: 10, background: paymentBg, border: "1px solid " + paymentColor + "40" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: paymentColor, fontWeight: 700, marginBottom: 4 }}>
              <PaymentIcon size={14} /> THANH TOÁN
            </div>
            <b style={{ fontSize: 13, color: paymentColor, display: "block" }}>{paymentStatus}</b>
            <span style={{ fontSize: 11, color: paymentColor, opacity: 0.8 }}>{order.payment || "Tiền mặt"}</span>
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: "rgba(38, 52, 213, 0.08)", border: "1px solid rgba(38, 52, 213, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#2634d5", fontWeight: 700, marginBottom: 4 }}>
              <Clock size={14} /> GIỜ NHẬN
            </div>
            <b style={{ fontSize: 13, color: "#2634d5", display: "block" }}>{pickupTime || "Chưa đặt"}</b>
            <span style={{ fontSize: 11, color: "#2634d5", opacity: 0.8 }}>Khung giờ khách chọn</span>
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8b5cf6", fontWeight: 700, marginBottom: 4 }}>
              <ShoppingBag size={14} /> SỐ LƯỢNG
            </div>
            <b style={{ fontSize: 13, color: "#8b5cf6", display: "block" }}>{totalQty} phần</b>
            <span style={{ fontSize: 11, color: "#8b5cf6", opacity: 0.8 }}>{(order.items || []).length} loại món</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 12, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              <User size={11} style={{ display: "inline", marginRight: 4 }} /> Khách hàng
            </div>
            <b style={{ fontSize: 14, color: "var(--text-primary, #172033)" }}>{order.customer_name || "Khách"}</b>
          </div>
          <div style={{ padding: 12, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              <Clock size={11} style={{ display: "inline", marginRight: 4 }} /> Thời gian đặt
            </div>
            <b style={{ fontSize: 13, color: "var(--text-primary, #172033)" }}>
              {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "—"}
            </b>
          </div>
        </div>

        <h4 style={{ margin: "0 0 10px", color: "var(--text-primary, #172033)", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <ShoppingBag size={16} /> Món đã đặt
        </h4>
        <div style={{ background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "6px 0", textAlign: "left", fontSize: 11, color: "var(--text-light, #94a3b8)", fontWeight: 600 }}>MÓN</th>
                <th style={{ padding: "6px 0", textAlign: "center", fontSize: 11, color: "var(--text-light, #94a3b8)", fontWeight: 600, width: 60 }}>SL</th>
                <th style={{ padding: "6px 0", textAlign: "right", fontSize: 11, color: "var(--text-light, #94a3b8)", fontWeight: 600, width: 100 }}>ĐƠN GIÁ</th>
                <th style={{ padding: "6px 0", textAlign: "right", fontSize: 11, color: "var(--text-light, #94a3b8)", fontWeight: 600, width: 100 }}>TỔNG</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border-color, #eef2f7)" }}>
                  <td style={{ padding: "10px 0", color: "var(--text-primary, #172033)", fontSize: 13 }}>{it.name}</td>
                  <td style={{ padding: "10px 0", textAlign: "center", color: "var(--text-primary, #172033)", fontSize: 13, fontWeight: 700 }}>×{it.qty}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", color: "var(--text-muted, #64748b)", fontSize: 13 }}>{money(it.price)}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", color: "var(--text-primary, #172033)", fontSize: 13, fontWeight: 700 }}>{money(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px dashed var(--border-color, #e5e9ef)", fontSize: 13 }}>
          <span style={{ color: "var(--text-muted, #64748b)" }}>Tạm tính</span>
          <b style={{ color: "var(--text-primary, #172033)" }}>{money(order.subtotal || order.total)}</b>
        </div>

        {order.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted, #64748b)" }}>Giảm giá</span>
            <b style={{ color: "#18a967" }}>-{money(order.discount)}</b>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid var(--border-color, #eef2f7)", marginTop: 6 }}>
          <b style={{ color: "var(--text-primary, #172033)", fontSize: 15 }}>TỔNG CỘNG</b>
          <strong style={{ color: "#2634d5", fontSize: 22 }}>{money(order.total)}</strong>
        </div>

        {order.note && (
          <div style={{ marginTop: 12, padding: 12, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 8, fontSize: 12, color: "var(--text-muted, #64748b)", display: "flex", gap: 8 }}>
            <MapPin size={14} style={{ color: "#2634d5", flexShrink: 0, marginTop: 2 }} />
            <span><b style={{ color: "var(--text-primary, #172033)" }}>Ghi chú:</b> {order.note}</span>
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-light, #94a3b8)" }}>
            Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
          </span>
          <button onClick={onClose} style={{ padding: "10px 24px", background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
