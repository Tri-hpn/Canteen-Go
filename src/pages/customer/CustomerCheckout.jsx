import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Phone, Clock, FileText, Tag, CheckCircle2, CreditCard, Gift, X, Zap } from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";
import PaymentModal from "../../components/PaymentModal";

const TIME_SLOTS = [
  "07:00 - 07:30", "07:30 - 08:00", "08:00 - 08:30", "08:30 - 09:00",
  "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
  "11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30", "12:30 - 13:00",
  "13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00",
  "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00",
  "17:00 - 17:30", "17:30 - 18:00", "18:00 - 18:30"
];

export default function CustomerCheckout({ cart, setCart }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [myVouchers, setMyVouchers] = useState([]);
  const [points, setPoints] = useState(0);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const lines = Object.entries(cart).map(([key, item]) => ({ ...item, _key: key }));
  const subtotal = lines.reduce((s, m) => s + m.price * m.qty, 0);
  const total = Math.max(0, subtotal - discount);

  const loadVouchersAndPoints = async () => {
    try {
      const [list, pointsData] = await Promise.all([
        api.vouchers.me().catch(() => []),
        api.points.me().catch(() => ({ points: 0 }))
      ]);
      setMyVouchers((list || []).filter((v) => !v.used));
      setPoints(pointsData?.points || 0);
    } catch {}
  };

  useEffect(() => {
    loadVouchersAndPoints();
    api.wallet.me().then(w => setWalletBalance(w?.balance || 0)).catch(() => {});
  }, []);

  const applyVoucher = async (code) => {
    const useCode = code || voucherCode;
    if (!useCode.trim()) return;
    try {
      const res = await api.vouchers.validate(useCode);
      setDiscount(res.value);
      setVoucherCode(res.code);
      setAppliedVoucher({ code: res.code, value: res.value });
      toast("Áp dụng voucher: -" + money(res.value), "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const clearVoucher = () => {
    setVoucherCode("");
    setDiscount(0);
    setAppliedVoucher(null);
  };

  const selectVoucher = (v) => {
    setVoucherCode(v.code);
    applyVoucher(v.code);
  };

  // Đổi điểm thành voucher ngay tại checkout
  const redeemPoints = async () => {
    if (points < 100) {
      toast("Cần ít nhất 100 điểm để đổi voucher", "error");
      return;
    }
    setRedeemLoading(true);
    try {
      const voucher = await api.points.redeem({ points: 100 });
      toast("Đổi thành công " + voucher.code + " — Giảm " + money(voucher.value), "success");
      await loadVouchersAndPoints();
      // Tự động áp dụng voucher vừa đổi
      setTimeout(() => applyVoucher(voucher.code), 300);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setRedeemLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Vui lòng nhập tên người đặt";
    if (!phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10,11}$/.test(phone.trim()))
      errs.phone = "Số điện thoại phải 10-11 chữ số";
    if (!pickupTime.trim()) errs.pickupTime = "Vui lòng chọn giờ nhận hàng";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openPayment = () => {
    if (!lines.length) {
      toast("Giỏ hàng đang trống", "error");
      return;
    }
    if (!validate()) {
      toast("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }
    setPaymentOrder({
      code: "TMP-" + Date.now().toString().slice(-6),
      total,
      name,
      phone,
      pickupTime,
      note,
      discount,
      voucherCode: appliedVoucher?.code || ""
    });
  };

  const confirmPayment = async (paymentMethod) => {
    setLoading(true);
    try {
      const items = lines.map((m) => ({
        menuItem: m._originalId || m._id || m.id,
        qty: m.qty
      }));
      const order = await api.orders.create({
        items,
        payment: paymentMethod,
        note: (note ? note + " · " : "") + "Nhận lúc " + pickupTime,
        discount,
        voucherCode: appliedVoucher?.code || ""
      });
      const selRaw=localStorage.getItem("canteen_cart_selected");let selKeys=[];try{selKeys=selRaw?JSON.parse(selRaw):[];}catch{}const remainCart={};Object.entries(cart||{}).forEach(([k,v])=>{if(!selKeys.includes(k))remainCart[k]=v;});setCart(remainCart);try{localStorage.setItem("canteen_cart",JSON.stringify(remainCart));}catch{}
      localStorage.removeItem("canteen_cart_selected");
      toast("Đặt hàng thành công! Mã: " + order.code, "success");
      setPaymentOrder(null);
      navigate("/customer/orders", { state: { order } });
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!lines.length) {
    return (
      <div style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 60, textAlign: "center" }}>
        <h3 style={{ color: "var(--text-primary, #172033)" }}>Giỏ hàng đang trống</h3>
        <Link to="/customer/menu" style={{ color: "#2634d5", fontWeight: 600 }}>
          Khám phá thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-2col">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* ===== Người đặt ===== */}
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>Người đặt</h3>

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
            Tên người đặt *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: errors.name ? "2px solid #ef4444" : "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, padding: "8px 12px", marginBottom: errors.name ? 4 : 14, background: "var(--bg-secondary, #fff)" }}>
            <User size={16} style={{ color: "var(--text-light, #8993a3)" }} />
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: "" }); }}
              placeholder="Nguyễn Văn A"
              style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: "var(--text-primary, #172033)", fontSize: 13 }}
            />
          </div>
          {errors.name && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 14 }}>{errors.name}</div>}

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
            Số điện thoại *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: errors.phone ? "2px solid #ef4444" : "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, padding: "8px 12px", marginBottom: errors.phone ? 4 : 14, background: "var(--bg-secondary, #fff)" }}>
            <Phone size={16} style={{ color: "var(--text-light, #8993a3)" }} />
            <input
              value={phone}
              onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: "" }); }}
              placeholder="0901234567"
              style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: "var(--text-primary, #172033)", fontSize: 13 }}
            />
          </div>
          {errors.phone && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 14 }}>{errors.phone}</div>}

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
            Giờ nhận hàng *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: errors.pickupTime ? "2px solid #ef4444" : "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, padding: "8px 12px", marginBottom: errors.pickupTime ? 4 : 14, background: "var(--bg-secondary, #fff)" }}>
            <Clock size={16} style={{ color: "var(--text-light, #8993a3)" }} />
            <select value={pickupTime} onChange={(e) => { setPickupTime(e.target.value); if (errors.pickupTime) setErrors({ ...errors, pickupTime: "" }); }} style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: pickupTime ? "var(--text-primary, #172033)" : "var(--text-light, #8993a3)", fontSize: 13, cursor: "pointer" }}><option value="">-- Chọn khung giờ --</option>{TIME_SLOTS.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}</select>
          </div>
          {errors.pickupTime && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 14 }}>{errors.pickupTime}</div>}

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
            Ghi chú
          </label>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, padding: "8px 12px", background: "var(--bg-secondary, #fff)" }}>
            <FileText size={16} style={{ color: "var(--text-light, #8993a3)", marginTop: 4 }} />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: ít cay, không hành..."
              style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: "var(--text-primary, #172033)", fontSize: 13, minHeight: 60, resize: "vertical" }}
            />
          </div>
        </div>

        {/* ===== Voucher ===== */}
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={18} /> Mã voucher
          </h3>

          {/* Ô nhập + nút áp dụng */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã voucher..."
              disabled={!!appliedVoucher}
              style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, outline: "none", background: appliedVoucher ? "var(--bg-tertiary, #f5f7fb)" : "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 13, textTransform: "uppercase" }}
            />
            {appliedVoucher ? (
              <button
                onClick={clearVoucher}
                style={{ padding: "10px 20px", background: "var(--card-bg, #fff)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <X size={14} /> Hủy
              </button>
            ) : (
              <button
                onClick={() => applyVoucher()}
                style={{ padding: "10px 20px", background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
              >
                Áp dụng
              </button>
            )}
          </div>

          {/* Đã áp dụng */}
          {appliedVoucher && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#e8f9f1", borderRadius: 8, fontSize: 13, color: "#18a967", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={14} /> Đã áp dụng {appliedVoucher.code} — Giảm {money(appliedVoucher.value)}
            </div>
          )}

          {/* Có voucher chưa dùng */}
          {!appliedVoucher && myVouchers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted, #475569)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Gift size={14} /> Voucher của bạn ({myVouchers.length})
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {myVouchers.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVoucher(v)}
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-tertiary, #f5f7fb)",
                      border: "1px dashed #2634d5",
                      borderRadius: 10,
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <b style={{ color: "#2634d5", fontSize: 12 }}>{v.code}</b>
                      <span style={{ fontSize: 11, color: "#18a967", fontWeight: 800 }}>-{money(v.value)}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-light, #8993a3)" }}>
                      Dùng {v.points_used} điểm
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Không có voucher + đủ điểm → hiện nút đổi ngay */}
          {!appliedVoucher && myVouchers.length === 0 && points >= 100 && (
            <div style={{ marginTop: 16, padding: 14, background: "linear-gradient(135deg, rgba(38,52,213,0.05), rgba(32,199,121,0.05))", border: "1px dashed #2634d5", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Zap size={16} style={{ color: "#2634d5" }} />
                <b style={{ fontSize: 13, color: "var(--text-primary, #172033)" }}>
                  Bạn có {points} điểm — Đổi ngay 1 voucher 10.000đ
                </b>
              </div>
              <button
                onClick={redeemPoints}
                disabled={redeemLoading}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: redeemLoading ? "#94a3b8" : "#18a967",
                  color: "#fff",
                  border: 0,
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: redeemLoading ? "not-allowed" : "pointer",
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <Gift size={14} /> {redeemLoading ? "Đang đổi..." : "Đổi 100 điểm → Voucher 10.000đ"}
              </button>
            </div>
          )}

          {/* Không có voucher + không đủ điểm → thông báo */}
          {!appliedVoucher && myVouchers.length === 0 && points < 100 && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--bg-tertiary, #f5f7fb)", borderRadius: 8, fontSize: 12, color: "var(--text-muted, #64748b)", display: "flex", alignItems: "center", gap: 8 }}>
              <Gift size={14} />
              <span>
                Không có voucher khả dụng. Bạn có <b>{points}</b> điểm — cần thêm <b>{100 - points}</b> điểm để đổi voucher.{" "}
                <Link to="/customer/promotions" style={{ color: "#2634d5", fontWeight: 600 }}>
                  Xem điểm →
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== Tóm tắt ===== */}
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20, height: "fit-content", position: "sticky", top: 90 }}>
        <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>Tóm tắt đơn</h3>

        <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 14 }}>
          {lines.map((m) => (
            <div key={m._key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-color, #eef2f7)", fontSize: 13 }}>
              <span style={{ color: "var(--text-primary, #172033)" }}><b>{m.qty}×</b> {m.name}</span>
              <b style={{ color: "var(--text-muted, #64748b)" }}>{money(m.price * m.qty)}</b>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, color: "var(--text-muted, #64748b)" }}>
          <span>Tạm tính</span>
          <b>{money(subtotal)}</b>
        </div>

        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, color: "#18a967" }}>
            <span>Giảm giá</span>
            <b>-{money(discount)}</b>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "2px solid var(--border-color, #eef2f7)", marginTop: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary, #172033)" }}>Tổng cộng</span>
          <strong style={{ color: "#2634d5", fontSize: 22 }}>{money(total)}</strong>
        </div>

        <button
          onClick={openPayment}
          disabled={loading}
          style={{ width: "100%", padding: 14, background: loading ? "#94a3b8" : "#2634d5", color: "#fff", border: 0, borderRadius: 10, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 14, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <CreditCard size={18} /> Đặt hàng
        </button>
      </div>

      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onConfirm={confirmPayment}
          walletBalance={walletBalance}
        />
      )}
    </div>
  );
}