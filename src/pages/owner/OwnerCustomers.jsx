import { useEffect, useState } from "react";
import { Search, Lock, Unlock, Trash2, Eye, Edit, Mail, Phone, Ticket, Gift, Clock, Ban, X, Copy, Check, Users, Globe, User as UserIcon } from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

export default function OwnerCustomers() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [voucherModal, setVoucherModal] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [voucherStats, setVoucherStats] = useState({ total: 0, used: 0, available: 0, totalValue: 0 });
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherTab, setVoucherTab] = useState("active");
  const [copiedId, setCopiedId] = useState(null);

  const load = () => api.users.list("CUSTOMER").then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = list.filter((c) =>
    c.name?.toLowerCase().includes(q.toLowerCase()) ||
    c.email?.toLowerCase().includes(q.toLowerCase()) ||
    (c.phone || "").includes(q)
  );

  const toggleLock = async (c) => {
    const newStatus = c.status === "Hoạt động" ? "Bị khóa" : "Hoạt động";
    if (!confirm(`${newStatus === "Bị khóa" ? "Khóa" : "Mở khóa"} tài khoản ${c.name}?`)) return;
    try {
      await api.users.update(c.id, { status: newStatus });
      toast(`Đã ${newStatus === "Bị khóa" ? "khóa" : "mở khóa"} tài khoản`, "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const remove = async (c) => {
    if (!confirm(`Xóa vĩnh viễn tài khoản ${c.name}?`)) return;
    try {
      await api.users.remove(c.id);
      toast("Đã xóa tài khoản", "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const loadVouchers = async (c) => {
    setLoadingVouchers(true);
    setVoucherModal(c);
    setVoucherTab("active");
    try {
      const res = await fetch("/api/vouchers/user/" + c.id, {
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
      }).then(r => r.json());
      setVouchers(res.vouchers || []);
      setVoucherStats(res.stats || { total: 0, used: 0, available: 0, totalValue: 0 });
    } catch (e) {
      setVouchers([]);
      setVoucherStats({ total: 0, used: 0, available: 0, totalValue: 0 });
    } finally {
      setLoadingVouchers(false);
    }
  };

  const revokeVoucher = async (v) => {
    if (!confirm("Thu hồi voucher " + v.code + " (giá trị " + (v.value || 0).toLocaleString("vi-VN") + "đ)?")) return;
    try {
      const res = await fetch("/api/vouchers/revoke/" + v.id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi thu hồi");
      toast("Đã thu hồi voucher", "success");
      if (voucherModal) loadVouchers(voucherModal);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const copyCode = (v) => {
    navigator.clipboard.writeText(v.code);
    setCopiedId(v.id);
    toast("Đã sao chép " + v.code, "success");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getVoucherSource = (v) => {
    if (v.claimed_from) return { label: "Nhận từ ƯĐ", color: "#8b5cf6", bg: "#ede9fe", icon: Globe };
    if (v.points_used > 0) return { label: "Đổi điểm", color: "#f59e0b", bg: "#fef3c7", icon: Gift };
    return { label: "Admin tặng", color: "#2634d5", bg: "#eef2ff", icon: UserIcon };
  };

  const save = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await api.users.update(editModal.id, {
        name: f.get("name"),
        phone: f.get("phone"),
        status: f.get("status")
      });
      toast("Đã cập nhật", "success");
      setEditModal(null);
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e5e9ef", borderRadius: 10, padding: "10px 14px", flex: 1, maxWidth: 400 }}>
          <Search size={18} style={{ color: "#8993a3" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên, email, SĐT..." style={{ flex: 1, border: 0, outline: "none", fontSize: 13 }} />
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 12, padding: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f7fb" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12 }}>ID</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12 }}>Khách hàng</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12 }}>Liên hệ</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12 }}>Điểm</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12 }}>Trạng thái</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #eef2f7" }}>
                <td style={{ padding: 11 }}>KH{c.id}</td>
                <td style={{ padding: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
                      {(c.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <b>{c.name}</b>
                  </div>
                </td>
                <td style={{ padding: 11, fontSize: 12, color: "#64748b" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span><Mail size={12} style={{ display: "inline", marginRight: 4 }} />{c.email}</span>
                    <span><Phone size={12} style={{ display: "inline", marginRight: 4 }} />{c.phone || "—"}</span>
                  </div>
                </td>
                <td style={{ padding: 11 }}><b style={{ color: "#f59e0b" }}>{c.points || 0} điểm</b></td>
                <td style={{ padding: 11 }}>
                  <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.status === "Hoạt động" ? "#e8f9f1" : "#fde8e8", color: c.status === "Hoạt động" ? "#18a967" : "#ef4444" }}>
                    {c.status || "Hoạt động"}
                  </span>
                </td>
                <td style={{ padding: 11 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => loadVouchers(c)} title="Ví voucher" style={{ padding: 6, border: "1px solid #8b5cf6", borderRadius: 6, background: "#f5f3ff", cursor: "pointer", color: "#8b5cf6" }}>
                      <Ticket size={15} />
                    </button>
                    <button onClick={() => setDetail(c)} title="Xem" style={{ padding: 6, border: "1px solid #e5e9ef", borderRadius: 6, background: "#fff", cursor: "pointer" }}>
                      <Eye size={15} />
                    </button>
                    <button onClick={() => setEditModal(c)} title="Sửa" style={{ padding: 6, border: "1px solid #e5e9ef", borderRadius: 6, background: "#fff", cursor: "pointer" }}>
                      <Edit size={15} />
                    </button>
                    <button onClick={() => toggleLock(c)} title={c.status === "Hoạt động" ? "Khóa" : "Mở"} style={{ padding: 6, border: "1px solid #e5e9ef", borderRadius: 6, background: "#fff", cursor: "pointer", color: c.status === "Hoạt động" ? "#ef4444" : "#18a967" }}>
                      {c.status === "Hoạt động" ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>
                    <button onClick={() => remove(c)} title="Xóa" style={{ padding: 6, border: "1px solid #e5e9ef", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#ef4444" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "#8993a3" }}>Chưa có khách hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "#0007", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, textAlign: "center" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 24, margin: "0 auto 12px" }}>
              {detail.name.slice(0, 2).toUpperCase()}
            </div>
            <h3 style={{ margin: "0 0 6px" }}>{detail.name}</h3>
            <p style={{ color: "#8993a3", margin: 0 }}>{detail.email}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20, textAlign: "left" }}>
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: "#8993a3" }}>Mã KH</span>
                <div><b>KH{detail.id}</b></div>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: "#8993a3" }}>SĐT</span>
                <div><b>{detail.phone || "—"}</b></div>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: "#8993a3" }}>Điểm tích lũy</span>
                <div><b style={{ color: "#f59e0b" }}>{detail.points || 0}</b></div>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: "#8993a3" }}>Trạng thái</span>
                <div><b>{detail.status}</b></div>
              </div>
            </div>
            <button onClick={() => setDetail(null)} style={{ width: "100%", padding: 12, marginTop: 20, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {voucherModal && (
        <div onClick={() => setVoucherModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>
                  {(voucherModal.name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#172033", display: "flex", alignItems: "center", gap: 6 }}>
                    <Ticket size={18} style={{ color: "#8b5cf6" }} /> Ví voucher
                  </h3>
                  <div style={{ fontSize: 12, color: "#8993a3", marginTop: 2 }}>
                    <b style={{ color: "#172033" }}>{voucherModal.name}</b> · {voucherModal.email}
                  </div>
                </div>
              </div>
              <button onClick={() => setVoucherModal(null)} style={{ background: "transparent", border: 0, fontSize: 24, color: "#8993a3", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "#eef2ff", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#2634d5", fontWeight: 600, marginBottom: 4 }}>TỔNG</div>
                <b style={{ fontSize: 20, color: "#2634d5" }}>{voucherStats.total}</b>
              </div>
              <div style={{ background: "#e8f9f1", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#18a967", fontWeight: 600, marginBottom: 4 }}>KHẢ DỤNG</div>
                <b style={{ fontSize: 20, color: "#18a967" }}>{voucherStats.available}</b>
              </div>
              <div style={{ background: "#fee2e2", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 600, marginBottom: 4 }}>ĐÃ DÙNG</div>
                <b style={{ fontSize: 20, color: "#ef4444" }}>{voucherStats.used}</b>
              </div>
              <div style={{ background: "#fff4d8", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, marginBottom: 4 }}>TỔNG GIÁ TRỊ</div>
                <b style={{ fontSize: 16, color: "#f59e0b" }}>{(voucherStats.totalValue || 0).toLocaleString("vi-VN")}đ</b>
              </div>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "#f5f7fb", padding: 4, borderRadius: 10 }}>
              {[
                { id: "active", label: "Khả dụng", count: vouchers.filter(v => !v.used).length, color: "#18a967" },
                { id: "used", label: "Đã dùng", count: vouchers.filter(v => v.used).length, color: "#ef4444" }
              ].map(t => (
                <button key={t.id} onClick={() => setVoucherTab(t.id)} style={{
                  flex: 1, padding: "10px 12px",
                  background: voucherTab === t.id ? t.color : "transparent",
                  color: voucherTab === t.id ? "#fff" : "#475569",
                  border: 0, borderRadius: 8, cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  {t.label}
                  <span style={{
                    background: voucherTab === t.id ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                    color: voucherTab === t.id ? "#fff" : "#475569",
                    minWidth: 22, height: 20, padding: "0 7px", borderRadius: 10,
                    fontSize: 11, fontWeight: 700,
                    display: "inline-flex", alignItems: "center", justifyContent: "center"
                  }}>{t.count}</span>
                </button>
              ))}
            </div>

            {loadingVouchers ? (
              <div style={{ textAlign: "center", padding: 40, color: "#8993a3" }}>Đang tải...</div>
            ) : vouchers.filter(v => voucherTab === "active" ? !v.used : v.used).length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#8993a3", background: "#f8fafc", borderRadius: 10 }}>
                <Ticket size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13 }}>
                  {voucherTab === "active" ? "Khách chưa có voucher khả dụng" : "Khách chưa dùng voucher nào"}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {vouchers.filter(v => voucherTab === "active" ? !v.used : v.used).map(v => {
                  const src = getVoucherSource(v);
                  const SrcIcon = src.icon;
                  const isCopied = copiedId === v.id;
                  return (
                    <div key={v.id} style={{
                      background: v.used ? "#f8fafc" : "#fff",
                      border: "1px solid " + (v.used ? "#e5e9ef" : "#8b5cf6"),
                      borderRadius: 12, padding: 14,
                      display: "flex", alignItems: "center", gap: 12,
                      opacity: v.used ? 0.75 : 1
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 10,
                        background: v.used ? "linear-gradient(135deg, #94a3b8, #64748b)" : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                        color: "#fff", display: "grid", placeItems: "center", flexShrink: 0
                      }}>
                        <Ticket size={22} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <b style={{ fontSize: 12, fontFamily: "monospace", color: "#8b5cf6" }}>{v.code}</b>
                          <button onClick={() => copyCode(v)} style={{ background: "transparent", border: 0, cursor: "pointer", color: isCopied ? "#18a967" : "#94a3b8", padding: 2 }}>
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, background: src.bg, color: src.color, padding: "2px 8px", borderRadius: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <SrcIcon size={10} /> {src.label}
                          </span>
                          {v.created_at && (
                            <span style={{ fontSize: 10, color: "#94a3b8" }}>
                              {new Date(v.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: v.used ? "#64748b" : "#18a967" }}>
                          {v.value.toLocaleString("vi-VN")}đ
                        </div>
                        <span style={{ fontSize: 10, color: v.used ? "#ef4444" : "#18a967", fontWeight: 700 }}>
                          {v.used ? "Đã dùng" : "Khả dụng"}
                        </span>
                      </div>
                      {!v.used && (
                        <button onClick={() => revokeVoucher(v)} title="Thu hồi" style={{
                          padding: 6, border: "1px solid #ef4444", borderRadius: 6,
                          background: "#fff", cursor: "pointer", color: "#ef4444",
                          display: "grid", placeItems: "center", flexShrink: 0
                        }}>
                          <Ban size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={() => setVoucherModal(null)} style={{
              marginTop: 16, width: "100%", padding: 12,
              background: "#2634d5", color: "#fff", border: 0, borderRadius: 8,
              fontWeight: 700, cursor: "pointer", fontSize: 13
            }}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "#0007", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480 }}>
            <h3 style={{ marginTop: 0 }}>Chỉnh sửa khách hàng</h3>
            <form onSubmit={save}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Họ tên</label>
              <input name="name" defaultValue={editModal.name} required style={{ width: "100%", padding: 10, border: "1px solid #e5e9ef", borderRadius: 8, marginBottom: 14 }} />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>SĐT</label>
              <input name="phone" defaultValue={editModal.phone || ""} style={{ width: "100%", padding: 10, border: "1px solid #e5e9ef", borderRadius: 8, marginBottom: 14 }} />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Trạng thái</label>
              <select name="status" defaultValue={editModal.status || "Hoạt động"} style={{ width: "100%", padding: 10, border: "1px solid #e5e9ef", borderRadius: 8, marginBottom: 14, background: "#fff" }}>
                <option>Hoạt động</option>
                <option>Bị khóa</option>
              </select>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setEditModal(null)} style={{ flex: 1, padding: 12, border: "1px solid #e5e9ef", borderRadius: 8, background: "#fff", cursor: "pointer" }}>Hủy</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
