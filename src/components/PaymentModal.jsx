import { useState, useEffect } from "react";
import { X, Banknote, QrCode, CreditCard, Printer, Check, Wallet } from "lucide-react";
import { money } from "./UI";
import { api } from "../api";

const METHODS = [
  { id: "Tiền mặt", label: "Tiền mặt", desc: "Trả khi nhận món", icon: Banknote, color: "#18a967" },
  { id: "QR",       label: "QR Code",  desc: "Quét VietQR / MoMo", icon: QrCode, color: "#2634d5" },
  { id: "Thẻ",      label: "Quẹt thẻ", desc: "Visa / Master / ATM", icon: CreditCard, color: "#f59e0b" },
  { id: "Ví Canteen", label: "Ví Canteen", desc: "Trừ số dư ví", icon: Wallet, color: "#8b5cf6", needsWallet: true }
];

export default function PaymentModal({ order, onClose, onConfirm, walletBalance = 0 }) {
  const [method, setMethod] = useState("Tiền mặt");
  const [confirmed, setConfirmed] = useState(false);
  const [settings, setSettings] = useState({
    bank: "VCB",
    account: "1234567890",
    accountName: "CANTEEN VWA"
  });

  // Fetch settings khi mount
  useEffect(() => {
    api.settings.get()
      .then((d) => {
        setSettings({
          bank: d.bank || "VCB",
          account: d.account || "1234567890",
          accountName: d.accountName || "CANTEEN VWA"
        });
      })
      .catch(() => {});
  }, []);

  if (!order) return null;

  const transferContent = "CANTEEN " + order.code;
  const vietQR =
    "https://img.vietqr.io/image/" + settings.bank + "-" + settings.account + "-compact2.png" +
    "?amount=" + order.total +
    "&addInfo=" + encodeURIComponent(transferContent) +
    "&accountName=" + encodeURIComponent(settings.accountName);

  const printQR = () => {
    const w = window.open("", "_blank", "width=400,height=600");
    w.document.write(`
      <html>
        <head>
          <title>In QR - ${order.code}</title>
          <style>
            body { font-family: monospace; padding: 20px; text-align: center; }
            h2 { margin: 0 0 8px; }
            .code { font-size: 14px; margin: 8px 0 16px; }
            img { width: 280px; height: 280px; }
            .total { font-size: 22px; font-weight: 800; margin: 16px 0; }
            .info { font-size: 12px; color: #333; line-height: 1.6; text-align: left; margin-top: 16px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h2>CANTEEN VWA</h2>
          <p style="margin:0;font-size:12px">Hệ thống Canteen VWA</p>
          <p class="code">Mã đơn: <b>${order.code}</b></p>
          <img src="${vietQR}" alt="VietQR" />
          <div class="total">${money(order.total)}</div>
          <div class="info">
            <div>Ngân hàng: <b>${settings.bank}</b></div>
            <div>STK: <b>${settings.account}</b></div>
            <div>Chủ TK: <b>${settings.accountName}</b></div>
            <div>Nội dung: <b>${transferContent}</b></div>
          </div>
          <script>window.onload = () => setTimeout(() => window.print(), 400);</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  const confirm = () => {
    if (method === "Ví Canteen" && walletBalance < (order?.total || 0)) {
      alert("Số dư ví không đủ. Cần thêm " + ((order?.total || 0) - walletBalance).toLocaleString("vi-VN") + "đ");
      return;
    }
    setConfirmed(true);
    onConfirm?.(method);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 200,
        padding: 20,
        overflowY: "auto"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18
          }}
        >
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>
            Chọn phương thức thanh toán
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: 0,
              fontSize: 24,
              color: "var(--text-light, #8993a3)",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Đơn hàng tóm tắt */}
        <div
          style={{
            background: "var(--bg-tertiary, #f5f7fb)",
            borderRadius: 10,
            padding: 14,
            marginBottom: 18,
            fontSize: 13
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "var(--text-muted, #64748b)" }}>Mã đơn</span>
            <b style={{ color: "#2634d5" }}>{order.code}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted, #64748b)" }}>Tổng tiền</span>
            <b style={{ color: "#18a967", fontSize: 18 }}>{money(order.total)}</b>
          </div>
        </div>

        {/* Chọn phương thức */}
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: active ? m.color + "15" : "var(--card-bg, #fff)",
                  border: active ? "2px solid " + m.color : "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: m.color + "20",
                    color: m.color,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--text-primary, #172033)"
                    }}
                  >
                    {m.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>
                    {m.desc}
                    {m.id === "Ví Canteen" && (
                      <span style={{ marginLeft: 6, color: walletBalance >= (order?.total || 0) ? "#18a967" : "#ef4444", fontWeight: 700 }}>
                        · Số dư: {walletBalance.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                </div>
                {active && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: m.color,
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      flexShrink: 0
                    }}
                  >
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Nếu chọn QR → hiện QR code */}
        {method === "QR" && !confirmed && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              border: "1px solid var(--border-color, #e5e9ef)",
              marginBottom: 18
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted, #64748b)",
                marginBottom: 10
              }}
            >
              Quét mã QR để thanh toán
            </div>
            <img
              src={vietQR}
              alt="VietQR"
              style={{
                width: 220,
                height: 220,
                margin: "0 auto",
                display: "block",
                borderRadius: 8
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-light, #8993a3)",
                lineHeight: 1.6
              }}
            >
              <div><b>{settings.bank}</b> · {settings.account}</div>
              <div>Chủ TK: <b>{settings.accountName}</b></div>
              <div>Nội dung: <b>{transferContent}</b></div>
            </div>
            <button
              onClick={printQR}
              style={{
                marginTop: 14,
                padding: "10px 16px",
                background: "#2634d5",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Printer size={14} /> In mã QR
            </button>
          </div>
        )}

        {/* Nút xác nhận */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              background: "var(--card-bg, #fff)",
              color: "var(--text-primary, #172033)",
              border: "1px solid var(--border-color, #e5e9ef)",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Hủy
          </button>
          <button
            onClick={confirm}
            disabled={confirmed}
            style={{
              flex: 2,
              padding: 12,
              background: confirmed ? "#94a3b8" : "#2634d5",
              color: "#fff",
              border: 0,
              borderRadius: 10,
              fontWeight: 700,
              cursor: confirmed ? "not-allowed" : "pointer",
              fontSize: 14
            }}
          >
            {confirmed ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
