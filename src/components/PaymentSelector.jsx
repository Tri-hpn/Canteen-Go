import { Banknote, QrCode, CreditCard, Check } from "lucide-react";

const METHODS = [
  { id: "Tiền mặt", label: "Tiền mặt", desc: "Trả tiền khi nhận món tại quầy", icon: Banknote, color: "#18a967", badge: "Phổ biến" },
  { id: "QR", label: "QR Code", desc: "Quét mã QR bằng app ngân hàng / MoMo", icon: QrCode, color: "#2634d5", badge: "Nhanh" },
  { id: "Thẻ", label: "Quẹt thẻ", desc: "Visa, Master, ATM nội địa", icon: CreditCard, color: "#f59e0b", badge: "An toàn" }
];

export default function PaymentSelector({ value, onChange }) {
  return (
    <div className="payment-selector">
      <h4>Chọn hình thức thanh toán</h4>
      <div className="payment-grid">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              className={"payment-card " + (active ? "active" : "")}
              onClick={() => onChange(m.id)}
              style={{ "--pm-color": m.color }}
            >
              <div className="pm-icon" style={{ background: m.color + "18", color: m.color }}>
                <Icon size={26} />
              </div>
              <div className="pm-body">
                <div className="pm-head">
                  <b>{m.label}</b>
                  {m.badge && <span className="pm-badge">{m.badge}</span>}
                </div>
                <span>{m.desc}</span>
              </div>
              {active && <div className="pm-check" style={{ background: m.color }}><Check size={14} /></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}