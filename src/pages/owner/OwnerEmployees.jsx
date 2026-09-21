import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, KeyRound, Eye, EyeOff, Pencil, X, Save, User as UserIcon, Mail, Phone, Lock, Shield } from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

export default function OwnerEmployees() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailMode, setDetailMode] = useState("view"); // "view" | "edit"
  const [addModal, setAddModal] = useState(null);
  const [showPw, setShowPw] = useState(false);

  const load = () => api.users.list("EMPLOYEE").then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = list.filter((e) =>
    e.name?.toLowerCase().includes(q.toLowerCase()) ||
    e.email?.toLowerCase().includes(q.toLowerCase())
  );

  const openDetail = (emp) => {
    setDetail(emp);
    setDetailMode("view");
    setShowPw(false);
  };

  const closeDetail = () => {
    setDetail(null);
    setDetailMode("view");
    setShowPw(false);
  };

  // Save edit
  const saveEdit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: f.get("name"),
      phone: f.get("phone"),
      status: f.get("status")
    };
    const newPwd = f.get("password");
    if (newPwd && newPwd.trim()) data.password = newPwd.trim();

    try {
      await api.users.update(detail.id, data);
      toast("Đã cập nhật nhân viên", "success");
      const updated = await api.users.list("EMPLOYEE");
      setList(updated);
      const newDetail = updated.find(u => u.id === detail.id);
      setDetail(newDetail);
      setDetailMode("view");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  // Add new
  const saveAdd = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone"),
      role: "EMPLOYEE",
      status: f.get("status"),
      password: f.get("password") || "123456"
    };
    try {
      await api.users.create(data);
      toast("Đã thêm nhân viên mới", "success");
      setAddModal(null);
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const remove = async (emp) => {
    if (!confirm(`Xóa nhân viên ${emp.name}?`)) return;
    try {
      await api.users.remove(emp.id);
      toast("Đã xóa nhân viên", "success");
      closeDetail();
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const resetPassword = async (emp) => {
    if (!confirm(`Reset mật khẩu cho ${emp.name} về "123456"?`)) return;
    try {
      await api.users.update(emp.id, { password: "123456" });
      toast("Đã reset mật khẩu về 123456", "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 10, padding: "10px 14px", flex: 1, maxWidth: 400 }}>
          <Search size={18} style={{ color: "var(--text-light, #8993a3)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm nhân viên..." style={{ flex: 1, border: 0, outline: "none", fontSize: 13, background: "transparent", color: "var(--text-primary, #172033)" }} />
        </div>
        <button onClick={() => setAddModal({})} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2634d5", color: "#fff", padding: "10px 16px", border: 0, borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          <Plus size={16} /> Thêm nhân viên
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={th}>ID</th>
              <th style={th}>Họ tên</th>
              <th style={th}>Email</th>
              <th style={th}>SĐT</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                <td style={td}>NV{e.id}</td>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2634d5,#20c779)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
                      {(e.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <b style={{ color: "var(--text-primary, #172033)" }}>{e.name}</b>
                  </div>
                </td>
                <td style={{ ...td, color: "var(--text-muted, #64748b)" }}>{e.email}</td>
                <td style={{ ...td, color: "var(--text-muted, #64748b)" }}>{e.phone || "—"}</td>
                <td style={td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: e.status === "Hoạt động" ? "#e8f9f1" : "#fde8e8", color: e.status === "Hoạt động" ? "#18a967" : "#ef4444" }}>
                    {e.status || "Hoạt động"}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openDetail(e)} title="Xem chi tiết" style={actionBtn}>
                      <Eye size={15} />
                    </button>
                    <button onClick={() => { openDetail(e); setTimeout(() => setDetailMode("edit"), 50); }} title="Sửa" style={actionBtn}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => resetPassword(e)} title="Reset mật khẩu" style={{ ...actionBtn, color: "#f59e0b" }}>
                      <KeyRound size={15} />
                    </button>
                    <button onClick={() => remove(e)} title="Xóa" style={{ ...actionBtn, color: "#ef4444" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>Chưa có nhân viên</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ============ DETAIL MODAL ============ */}
      {detail && (
        <div onClick={closeDetail} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>

            {/* --- VIEW MODE --- */}
            {detailMode === "view" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
                    <UserIcon size={20} /> Chi tiết nhân viên
                  </h3>
                  <button onClick={closeDetail} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#2634d5,#20c779)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
                    {(detail.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <h3 style={{ margin: "0 0 4px", color: "var(--text-primary, #172033)" }}>{detail.name}</h3>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#eef2ff", color: "#2634d5" }}>
                    <Shield size={12} /> Nhân viên
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  <InfoRow icon={<UserIcon size={16} />} label="Mã nhân viên" value={`NV${detail.id}`} />
                  <InfoRow icon={<UserIcon size={16} />} label="Họ và tên" value={detail.name} />
                  <InfoRow icon={<Mail size={16} />} label="Email" value={detail.email} />
                  <InfoRow icon={<Phone size={16} />} label="Số điện thoại" value={detail.phone || "—"} />

                  {/* Password row with show/hide */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef3c7", color: "#92400e", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Lock size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                        Mật khẩu hiện tại
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text-primary, #172033)", fontWeight: 600, fontFamily: "monospace" }}>
                        {detail.plainPassword
                          ? (showPw ? detail.plainPassword : "•".repeat(detail.plainPassword.length || 6))
                          : "(Chưa có - user tạo trước khi bật tính năng)"}
                      </div>
                    </div>
                    {detail.plainPassword && (
                      <button onClick={() => setShowPw(!showPw)} style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--text-light, #8993a3)", padding: 4 }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>

                  <InfoRow
                    icon={<UserIcon size={16} />}
                    label="Trạng thái"
                    value={
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: detail.status === "Hoạt động" ? "#e8f9f1" : "#fde8e8", color: detail.status === "Hoạt động" ? "#18a967" : "#ef4444" }}>
                        {detail.status || "Hoạt động"}
                      </span>
                    }
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button onClick={closeDetail} style={{ padding: 12, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", cursor: "pointer", color: "var(--text-primary, #172033)", fontWeight: 600 }}>
                    Đóng
                  </button>
                  <button onClick={() => setDetailMode("edit")} style={{ padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Pencil size={14} /> Sửa
                  </button>
                </div>
              </>
            )}

            {/* --- EDIT MODE --- */}
            {detailMode === "edit" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>Sửa nhân viên</h3>
                  <button onClick={closeDetail} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>

                <form onSubmit={saveEdit}>
                  <label style={label}>Họ và tên *</label>
                  <input name="name" defaultValue={detail.name || ""} required style={input} />

                  <label style={label}>Email *</label>
                  <input name="email" type="email" defaultValue={detail.email || ""} disabled style={{ ...input, background: "var(--bg-tertiary, #f5f7fb)", cursor: "not-allowed" }} />

                  <label style={label}>Số điện thoại</label>
                  <input name="phone" defaultValue={detail.phone || ""} style={input} />

                  <label style={label}>Mật khẩu mới (để trống giữ nguyên)</label>
                  <div style={{ position: "relative" }}>
                    <input name="password" type={showPw ? "text" : "password"} placeholder="Nhập mật khẩu mới nếu muốn đổi" style={input} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: 12, background: "none", border: 0, cursor: "pointer", color: "var(--text-light, #8993a3)" }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <label style={label}>Trạng thái</label>
                  <select name="status" defaultValue={detail.status || "Hoạt động"} style={input}>
                    <option>Hoạt động</option>
                    <option>Bị khóa</option>
                  </select>

                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button type="button" onClick={() => setDetailMode("view")} style={{ flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", cursor: "pointer", color: "var(--text-primary, #172033)", fontWeight: 600 }}>
                      <X size={14} style={{ display: "inline", marginRight: 4 }} /> Hủy
                    </button>
                    <button type="submit" style={{ flex: 1, padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Save size={14} /> Lưu
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ ADD MODAL ============ */}
      {addModal && (
        <div onClick={() => setAddModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>Thêm nhân viên</h3>
            <form onSubmit={saveAdd}>
              <label style={label}>Họ và tên *</label>
              <input name="name" required style={input} />

              <label style={label}>Email *</label>
              <input name="email" type="email" required style={input} />

              <label style={label}>Số điện thoại</label>
              <input name="phone" style={input} />

              <label style={label}>Mật khẩu (mặc định: 123456)</label>
              <input name="password" placeholder="123456" style={input} />

              <label style={label}>Trạng thái</label>
              <select name="status" defaultValue="Hoạt động" style={input}>
                <option>Hoạt động</option>
                <option>Bị khóa</option>
              </select>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setAddModal(null)} style={{ flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", cursor: "pointer", color: "var(--text-primary, #172033)" }}>Hủy</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eef2ff", color: "#2634d5", display: "grid", placeItems: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-primary, #172033)", fontWeight: 600, wordBreak: "break-word" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* Styles */
const th = { padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" };
const td = { padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" };
const actionBtn = {
  padding: 6, border: "1px solid var(--border-color, #e5e9ef)",
  borderRadius: 6, background: "var(--card-bg, #fff)",
  cursor: "pointer", display: "grid", placeItems: "center",
  color: "var(--text-primary, #172033)", width: 30, height: 30
};
const label = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 12, color: "var(--text-muted, #475569)" };
const input = {
  width: "100%", padding: 10,
  border: "1px solid var(--border-color, #e5e9ef)",
  borderRadius: 8, outline: "none",
  background: "var(--bg-secondary, #fff)",
  color: "var(--text-primary, #172033)",
  fontSize: 13, boxSizing: "border-box"
};