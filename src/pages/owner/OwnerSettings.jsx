import { useEffect, useState } from "react";
import { CreditCard, Save, QrCode, Building2, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

export default function OwnerSettings() {
  const [form, setForm] = useState({
    bank: "VCB",
    account: "",
    accountName: "",
    hotline: "",
    email: "",
    address: "",
    qrCustomImage: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    api.settings.get()
      .then(setForm)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.settings.update(form);
      toast("Đã lưu cài đặt!", "success");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleQRUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Ảnh vượt quá 2MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, qrCustomImage: reader.result });
      toast("Đã chọn ảnh QR mới", "success");
    };
    reader.readAsDataURL(file);
  };

  // VietQR preview URL
  const vietQR = "https://img.vietqr.io/image/" + form.bank + "-" + form.account + "-compact2.png?amount=35000&addInfo=" + encodeURIComponent("CANTEEN TEST") + "&accountName=" + encodeURIComponent(form.accountName || "CANTEEN VWA");

  const banks = [
    { code: "VCB", name: "Vietcombank" },
    { code: "TCB", name: "Techcombank" },
    { code: "VIB", name: "VIB" },
    { code: "MBB", name: "MB Bank" },
    { code: "ACB", name: "ACB" },
    { code: "TPB", name: "TPBank" },
    { code: "VPB", name: "VPBank" },
    { code: "STB", name: "Sacombank" },
    { code: "BIDV", name: "BIDV" },
    { code: "ICB", name: "Vietinbank" },
    { code: "AGB", name: "Agribank" }
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        {/* Form */}
        <div>
          {/* Bank */}
          <div style={{
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color, #e7ebf0)",
            borderRadius: 12, padding: 20, marginBottom: 16
          }}>
            <h3 style={{
              marginTop: 0, marginBottom: 16,
              color: "var(--text-primary, #172033)",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <CreditCard size={18} /> Tài khoản nhận tiền
            </h3>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
              Ngân hàng
            </label>
            <select
              value={form.bank}
              onChange={update("bank")}
              style={{
                width: "100%", padding: "10px 12px",
                border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14,
                background: "var(--bg-secondary, #fff)",
                color: "var(--text-primary, #172033)",
                fontSize: 13, outline: "none"
              }}
            >
              {banks.map(b => (
                <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
              ))}
            </select>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
              Số tài khoản
            </label>
            <input
              value={form.account}
              onChange={update("account")}
              placeholder="VD: 1234567890"
              style={{
                width: "100%", padding: "10px 12px",
                border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14,
                background: "var(--bg-secondary, #fff)",
                color: "var(--text-primary, #172033)",
                fontSize: 13, outline: "none"
              }}
            />

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
              Chủ tài khoản
            </label>
            <input
              value={form.accountName}
              onChange={update("accountName")}
              placeholder="VD: NGUYEN VAN A"
              style={{
                width: "100%", padding: "10px 12px",
                border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8,
                background: "var(--bg-secondary, #fff)",
                color: "var(--text-primary, #172033)",
                fontSize: 13, outline: "none"
              }}
            />
          </div>

          {/* Contact */}
          <div style={{
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color, #e7ebf0)",
            borderRadius: 12, padding: 20, marginBottom: 16
          }}>
            <h3 style={{
              marginTop: 0, marginBottom: 16,
              color: "var(--text-primary, #172033)",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <Building2 size={18} /> Thông tin liên hệ (footer)
            </h3>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
              <Phone size={12} style={{ display: "inline", marginRight: 4 }} />
              Hotline
            </label>
            <input
              value={form.hotline}
              onChange={update("hotline")}
              placeholder="VD: 0328 866 959"
              style={{
                width: "100%", padding: "10px 12px",
                border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14,
                background: "var(--bg-secondary, #fff)",
                color: "var(--text-primary, #172033)",
                fontSize: 13, outline: "none"
              }}
            />

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
              <Mail size={12} style={{ display: "inline", marginRight: 4 }} />
              Email
            </label>
            <input
              value={form.email}
              onChange={update("email")}
              placeholder="admin@vwa.vn"
              style={{
                width: "100%", padding: "10px 12px",
                border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14,
                background: "var(--bg-secondary, #fff)",
                color: "var(--text-primary, #172033)",
                fontSize: 13, outline: "none"
              }}
            />

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
              <MapPin size={12} style={{ display: "inline", marginRight: 4 }} />
              Địa chỉ
            </label>
            <input
              value={form.address}
              onChange={update("address")}
              placeholder="VD: 68 Nguyen Chi Thanh, Ha Noi"
              style={{
                width: "100%", padding: "10px 12px",
                border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8,
                background: "var(--bg-secondary, #fff)",
                color: "var(--text-primary, #172033)",
                fontSize: 13, outline: "none"
              }}
            />
          </div>

          {/* Save button */}
          <button
            onClick={save}
            disabled={saving}
            style={{
              width: "100%", padding: 14,
              background: saving ? "#94a3b8" : (saved ? "#18a967" : "#2634d5"),
              color: "#fff", border: 0, borderRadius: 10,
              fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              fontSize: 14,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            {saved ? <><CheckCircle2 size={18} /> Đã lưu</> : <><Save size={18} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}</>}
          </button>
        </div>

        {/* Preview */}
        <div style={{ position: "sticky", top: 90, height: "fit-content" }}>
          <div style={{
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color, #e7ebf0)",
            borderRadius: 12, padding: 20
          }}>
            <h3 style={{
              marginTop: 0, marginBottom: 16,
              color: "var(--text-primary, #172033)",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <QrCode size={18} /> Xem trước QR
            </h3>

            <div style={{
              background: "var(--bg-tertiary, #f8fafc)",
              padding: 16, borderRadius: 10,
              display: "flex", justifyContent: "center", marginBottom: 14
            }}>
              {form.qrCustomImage ? (
                <img
                  src={form.qrCustomImage}
                  alt="Custom QR"
                  style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 8 }}
                />
              ) : (
                <img
                  src={vietQR}
                  alt="VietQR"
                  style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 8 }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>

            <div style={{ fontSize: 12, color: "var(--text-muted, #64748b)", lineHeight: 1.7, marginBottom: 14 }}>
              <div><b>NH:</b> {banks.find(b => b.code === form.bank)?.name || form.bank}</div>
              <div><b>STK:</b> {form.account || "(chưa nhập)"}</div>
              <div><b>Chủ TK:</b> {form.accountName || "(chưa nhập)"}</div>
            </div>

            {/* Upload QR tuy chinh */}
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-muted, #475569)" }}>
              Hoặc tải ảnh QR riêng lên
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleQRUpload}
              style={{
                width: "100%", padding: 8,
                background: "var(--bg-tertiary, #f5f7fb)",
                border: "1px dashed var(--border-color, #cbd5e1)",
                borderRadius: 8, fontSize: 12, cursor: "pointer",
                color: "var(--text-muted, #64748b)"
              }}
            />

            {form.qrCustomImage && (
              <button
                onClick={() => setForm({ ...form, qrCustomImage: "" })}
                style={{
                  width: "100%", padding: 8, marginTop: 8,
                  background: "var(--card-bg, #fff)",
                  color: "#ef4444", border: "1px solid #ef4444",
                  borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600
                }}
              >
                Xóa ảnh QR riêng — dùng VietQR tự động
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}