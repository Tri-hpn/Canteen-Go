import { X, Package } from "lucide-react";
import { money } from "./UI";

export default function OrderDetailModal({ order, onClose, role }) {
  if (!order) return null;

  const canPrint = role === "EMPLOYEE" || role === "ADMIN";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 100,
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: 14,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary, #172033)" }}>
            <Package size={20} /> Chi tiết đơn hàng
          </h3>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted, #64748b)" }}>Mã đơn</span>
            <b style={{ color: "var(--text-primary, #172033)" }}>{order.code}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted, #64748b)" }}>Thời gian</span>
            <b style={{ color: "var(--text-primary, #172033)" }}>
              {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "—"}
            </b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted, #64748b)" }}>Trạng thái</span>
            <b style={{ color: "var(--text-primary, #172033)" }}>{order.status}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted, #64748b)" }}>Thanh toán</span>
            <b style={{ color: "var(--text-primary, #172033)" }}>{order.payment || "Tiền mặt"}</b>
          </div>
        </div>

        <h4 style={{ margin: "16px 0 12px", color: "var(--text-primary, #172033)" }}>Món đã đặt</h4>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 8, textAlign: "left", fontSize: 11, color: "var(--text-muted, #64748b)" }}>Món</th>
              <th style={{ padding: 8, textAlign: "center", fontSize: 11, color: "var(--text-muted, #64748b)" }}>SL</th>
              <th style={{ padding: 8, textAlign: "right", fontSize: 11, color: "var(--text-muted, #64748b)" }}>Tiền</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((it, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                <td style={{ padding: 8, fontSize: 13, color: "var(--text-primary, #172033)" }}>{it.name}</td>
                <td style={{ padding: 8, textAlign: "center", fontSize: 13, color: "var(--text-muted, #64748b)" }}>{it.qty}</td>
                <td style={{ padding: 8, textAlign: "right", fontSize: 13, color: "var(--text-primary, #172033)" }}>{money(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "14px 0",
          borderTop: "2px solid var(--border-color, #eef2f7)",
          marginTop: 8
        }}>
          <b style={{ color: "var(--text-primary, #172033)" }}>Tổng cộng</b>
          <strong style={{ color: "#2634d5", fontSize: 20 }}>{money(order.total)}</strong>
        </div>

        {order.note && (
          <div style={{
            marginTop: 12,
            padding: 12,
            background: "var(--bg-tertiary, #f8fafc)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-muted, #64748b)"
          }}>
            <b style={{ color: "var(--text-primary, #172033)" }}>Ghi chú:</b> {order.note}
          </div>
        )}

        {!canPrint && (
          <p style={{
            marginTop: 16,
            padding: 10,
            background: "var(--bg-tertiary, #eef2ff)",
            color: "var(--text-muted, #2634d5)",
            borderRadius: 8,
            fontSize: 12,
            textAlign: "center"
          }}>
            ℹ️ Hóa đơn in sẽ do nhân viên Canteen thực hiện.
          </p>
        )}
      </div>
    </div>
  );
}
