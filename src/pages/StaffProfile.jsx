import { useState } from "react";
import {
  User, Mail, Phone, MapPin, Save, Shield, Camera,
  Pencil, X, Check, Lock, KeyRound, Eye, EyeOff
} from "lucide-react";
import { api } from "../api";
import { toast } from "../components/Effects";

export default function StaffProfile({ user, setUser, canEditEmail = false }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    avatar: user?.avatar || ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password modal
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const resetForm = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      avatar: user?.avatar || ""
    });
    setErrors({});
  };

  const startEdit = () => { resetForm(); setEditing(true); };
  const cancelEdit = () => { resetForm(); setEditing(false); };

  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: "" });
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast("Ảnh vượt quá 2MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, avatar: reader.result }));
      toast("Đã chọn ảnh mới", "success");
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên";
    if (canEditEmail) {
      if (!form.email.trim()) errs.email = "Vui lòng nhập email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Email không hợp lệ";
    }
    if (form.phone && !/^[0-9]{10,11}$/.test(form.phone.trim())) errs.phone = "SĐT phải 10-11 số";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (!validate()) { toast("Kiểm tra lại thông tin", "error"); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        avatar: form.avatar
      };
      if (canEditEmail) payload.email = form.email.trim().toLowerCase();
      
      const updated = await api.updateProfile(payload);
      if (setUser) setUser((u) => ({ ...u, ...updated }));
      window.dispatchEvent(new CustomEvent("refresh-user"));
      toast("Đã lưu thay đổi!", "success");
      setEditing(false);
    } catch (err) {
      toast(err.message || "Không lưu được", "error");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    setPwdError("");
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      setPwdError("Nhập đầy đủ thông tin");
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError("Mật khẩu mới phải từ 6 ký tự");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("Xác nhận mật khẩu không khớp");
      return;
    }
    setPwdLoading(true);
    try {
      await api.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      toast("Đổi mật khẩu thành công!", "success");
      setShowPwdModal(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      window.dispatchEvent(new CustomEvent("refresh-user"));
    } catch (e) {
      setPwdError(e.message || "Lỗi đổi mật khẩu");
    } finally {
      setPwdLoading(false);
    }
  };

  const roleLabel = user?.role === "ADMIN" ? "Quản trị viên" : "Nhân viên";
  const displayName = editing ? form.name : user?.name || "";
  const initials = (displayName || "VWA").trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarSrc = editing ? form.avatar : user?.avatar;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
      {/* LEFT: AVATAR + ROLE */}
      <div style={cardStyle}>
        <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 14px" }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: avatarSrc ? "url(" + avatarSrc + ") center/cover" : "linear-gradient(135deg, #2634d5, #20c779)",
            color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 36,
            border: "3px solid var(--border-color, #e5e9ef)", overflow: "hidden"
          }}>
            {!avatarSrc && initials}
          </div>
          {editing && (
            <label title="Đổi ảnh" style={{
              position: "absolute", bottom: 0, right: 0,
              width: 34, height: 34, borderRadius: "50%",
              background: "#2634d5", color: "#fff", display: "grid", placeItems: "center",
              cursor: "pointer", border: "2px solid #fff"
            }}>
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
            </label>
          )}
        </div>

        <h3 style={{ margin: "0 0 4px", color: "var(--text-primary, #172033)", textAlign: "center" }}>{user?.name}</h3>
        <p style={{ margin: 0, color: "var(--text-light, #8993a3)", fontSize: 13, textAlign: "center" }}>{user?.email}</p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 20,
            background: user?.role === "ADMIN" ? "#fef3c7" : "#eef2ff",
            color: user?.role === "ADMIN" ? "#92400e" : "#2634d5",
            fontSize: 11, fontWeight: 700
          }}>
            <Shield size={12} /> {roleLabel}
          </div>
        </div>

        <button onClick={() => setShowPwdModal(true)} style={{
          width: "100%", marginTop: 20, padding: 12,
          background: "var(--bg-tertiary, #f5f7fb)",
          color: "var(--text-primary, #172033)",
          border: "1px solid var(--border-color, #e5e9ef)",
          borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13,
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
        }}>
          <KeyRound size={15} /> Đổi mật khẩu
        </button>
      </div>

      {/* RIGHT: INFO / EDIT FORM */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>Hồ sơ cá nhân</h3>
            <p style={{ margin: "4px 0 0", color: "var(--text-light, #8993a3)", fontSize: 13 }}>
              {editing ? "Chỉnh sửa thông tin bên dưới" : "Thông tin tài khoản của bạn"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!editing ? (
              <button onClick={startEdit} style={btnEdit}><Pencil size={14} /> Sửa</button>
            ) : (
              <>
                <button onClick={cancelEdit} disabled={loading} style={btnCancel}><X size={14} /> Hủy</button>
                <button onClick={save} disabled={loading} style={btnSave}>
                  <Save size={14} /> {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* VIEW MODE */}
        {!editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <InfoRow icon={<User size={16} />} label="Họ và tên" value={user?.name} />
            <InfoRow icon={<Mail size={16} />} label="Email" value={user?.email} note={!canEditEmail ? "Do admin quản lý" : null} />
            <InfoRow icon={<Phone size={16} />} label="Số điện thoại" value={user?.phone || "—"} />
            <InfoRow icon={<MapPin size={16} />} label="Địa chỉ" value={user?.address || "—"} />
          </div>
        )}

        {/* EDIT MODE */}
        {editing && (
          <div>
            <label style={labelStyle}>Họ và tên *</label>
            <div style={inputWrap(errors.name)}>
              <User size={16} style={iconStyle} />
              <input value={form.name} onChange={update("name")} style={inputInner} placeholder="Nguyễn Văn A" />
            </div>
            {errors.name && <div style={errStyle}>{errors.name}</div>}

            <label style={labelStyle}>
              Email {canEditEmail ? "*" : "(không được sửa)"}
            </label>
            <div style={{ ...inputWrap(errors.email), opacity: canEditEmail ? 1 : 0.6 }}>
              <Mail size={16} style={iconStyle} />
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                style={inputInner}
                disabled={!canEditEmail}
              />
            </div>
            {errors.email && <div style={errStyle}>{errors.email}</div>}

            <label style={labelStyle}>Số điện thoại</label>
            <div style={inputWrap(errors.phone)}>
              <Phone size={16} style={iconStyle} />
              <input value={form.phone} onChange={update("phone")} style={inputInner} placeholder="0901234567" />
            </div>
            {errors.phone && <div style={errStyle}>{errors.phone}</div>}

            <label style={labelStyle}>Địa chỉ</label>
            <div style={inputWrap()}>
              <MapPin size={16} style={iconStyle} />
              <input value={form.address} onChange={update("address")} style={inputInner} placeholder="Ký túc xá VWA" />
            </div>
          </div>
        )}
      </div>

      {/* MODAL ĐỔI MẬT KHẨU */}
      {showPwdModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", zIndex: 100, padding: 20
        }} onClick={() => setShowPwdModal(false)}>
          <div style={{
            background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24,
            width: "100%", maxWidth: 460
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={20} /> Đổi mật khẩu
              </h3>
              <button onClick={() => setShowPwdModal(false)} style={{
                background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer"
              }}>×</button>
            </div>

            {pwdError && (
              <div style={{ background: "#fde8e8", color: "#ef4444", padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 14 }}>
                {pwdError}
              </div>
            )}

            <label style={labelStyle}>Mật khẩu hiện tại</label>
            <div style={inputWrap()}>
              <Lock size={16} style={iconStyle} />
              <input
                type={showPwd ? "text" : "password"}
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                style={inputInner}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-light, #8993a3)" }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label style={labelStyle}>Mật khẩu mới</label>
            <div style={inputWrap()}>
              <KeyRound size={16} style={iconStyle} />
              <input
                type={showPwd ? "text" : "password"}
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                style={inputInner}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <label style={labelStyle}>Xác nhận mật khẩu mới</label>
            <div style={inputWrap()}>
              <Check size={16} style={iconStyle} />
              <input
                type={showPwd ? "text" : "password"}
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                style={inputInner}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowPwdModal(false)} style={{
                flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, background: "var(--card-bg, #fff)",
                cursor: "pointer", color: "var(--text-primary, #172033)", fontWeight: 600
              }}>Hủy</button>
              <button onClick={changePassword} disabled={pwdLoading} style={{
                flex: 1, padding: 12, background: pwdLoading ? "#94a3b8" : "#2634d5",
                color: "#fff", border: 0, borderRadius: 8, fontWeight: 700,
                cursor: pwdLoading ? "not-allowed" : "pointer"
              }}>
                {pwdLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ SUB-COMPONENTS ============ */
function InfoRow({ icon, label, value, note }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: 14,
      background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "#eef2ff", color: "#2634d5",
        display: "grid", placeItems: "center", flexShrink: 0
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
          {label}
          {note && <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600 }}>({note})</span>}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-primary, #172033)", fontWeight: 600, wordBreak: "break-word" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg, #fff)",
  border: "1px solid var(--border-color, #e7ebf0)",
  borderRadius: 12, padding: 24
};
const btnEdit = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
  background: "#2634d5", color: "#fff", border: 0, borderRadius: 8,
  fontWeight: 600, fontSize: 13, cursor: "pointer"
};
const btnCancel = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
  background: "var(--card-bg, #fff)", color: "var(--text-primary, #475569)",
  border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8,
  fontWeight: 600, fontSize: 13, cursor: "pointer"
};
const btnSave = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
  background: "#18a967", color: "#fff", border: 0, borderRadius: 8,
  fontWeight: 600, fontSize: 13, cursor: "pointer"
};
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  marginBottom: 4, color: "var(--text-muted, #475569)", marginTop: 14
};
const iconStyle = { color: "var(--text-light, #8993a3)" };
const inputInner = {
  flex: 1, border: 0, outline: "none", background: "transparent",
  color: "var(--text-primary, #172033)", fontSize: 13
};
const inputWrap = (err) => ({
  display: "flex", alignItems: "center", gap: 10,
  border: err ? "2px solid #ef4444" : "1px solid var(--border-color, #e5e9ef)",
  borderRadius: 8, padding: "8px 12px",
  background: "var(--bg-secondary, #fff)"
});
const errStyle = { color: "#ef4444", fontSize: 12, marginTop: 4 };