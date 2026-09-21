import { Printer, X } from "lucide-react";
import { money } from "./UI";

export default function PrintReceipt({ order, onClose }) {
  if (!order) return null;

  const print = () => window.print();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 30, width: "100%", maxWidth: 400 }} className="receipt-modal">
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 12px", border: "1px solid #e5e9ef", borderRadius: 8, background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <X size={16} /> Đóng
          </button>
          <button onClick={print} style={{ padding: "8px 16px", background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Printer size={16} /> In
          </button>
        </div>

        <div className="receipt" style={{ fontFamily: "monospace", fontSize: 12, color: "#000" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>CANTEEN VWA</h2>
            <p style={{ margin: 0, fontSize: 11 }}>Hệ thống quản lý Canteen</p>
            <p style={{ margin: "4px 0 0", fontSize: 11 }}>☎ 0900 000 000</p>
          </div>

          <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "10px 0", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Mã đơn:</span>
              <b>{order.code}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Khách:</span>
              <b>{order.customer_name || order.customerName || "Khách"}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Thời gian:</span>
              <b>{new Date(order.created_at || Date.now()).toLocaleString("vi-VN")}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Thanh toán:</span>
              <b>{order.payment || "Tiền mặt"}</b>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th style={{ textAlign: "left", padding: "6px 0", fontSize: 11 }}>Món</th>
                <th style={{ textAlign: "center", padding: "6px 0", fontSize: 11 }}>SL</th>
                <th style={{ textAlign: "right", padding: "6px 0", fontSize: 11 }}>Tiền</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, i) => (
                <tr key={i}>
                  <td style={{ padding: "4px 0", fontSize: 11 }}>{it.name}</td>
                  <td style={{ textAlign: "center", padding: "4px 0", fontSize: 11 }}>{it.qty}</td>
                  <td style={{ textAlign: "right", padding: "4px 0", fontSize: 11 }}>{money(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed #000", paddingTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
              <span>TỔNG CỘNG:</span>
              <span>{money(order.total)}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 11 }}>
            <p style={{ margin: 0 }}>Cảm ơn quý khách!</p>
            <p style={{ margin: "4px 0 0" }}>Hẹn gặp lại tại Canteen VWA</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .receipt-modal, .receipt-modal * { visibility: visible !important; }
          .receipt-modal { position: fixed !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 20px !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
