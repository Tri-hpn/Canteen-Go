import { useEffect, useState, useMemo } from "react";
import {
  Plus, Search, Trash2, Edit, Ticket, Gift, Save, Check, Download,
  Power, BarChart3, Globe, User as UserIcon, Eye, X, Users, Copy
} from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";

export default function OwnerVouchers() {
  const [list, setList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [claimsModal, setClaimsModal] = useState(null);
  const [claims, setClaims] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [vRes, uRes] = await Promise.all([
        api.vouchers.all().catch(() => []),
        api.users.list("CUSTOMER").catch(() => [])
      ]);
      setList(Array.isArray(vRes) ? vRes : []);
      setCustomers(Array.isArray(uRes) ? uRes : []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = [...list];
    if (q.trim()) {
      const s = q.toLowerCase();
      result = result.filter(v =>
        v.code?.toLowerCase().includes(s) ||
        String(v.user_id || "").includes(s) ||
        String(v.value).includes(s)
      );
    }
    if (filterStatus === "used") result = result.filter(v => v.used);
    if (filterStatus === "unused") result = result.filter(v => !v.used);
    if (filterSource === "public") result = result.filter(v => !v.user_id && !v.claimed_from);
    if (filterSource === "personal") result = result.filter(v => v.user_id);
    if (filterCustomer !== "all") {
      if (filterCustomer === "none") result = result.filter(v => !v.user_id);
      else result = result.filter(v => String(v.user_id) === String(filterCustomer));
    }
    if (sortBy === "newest") result.sort((a, b) => (b.id || 0) - (a.id || 0));
    if (sortBy === "oldest") result.sort((a, b) => (a.id || 0) - (b.id || 0));
    if (sortBy === "value-desc") result.sort((a, b) => (b.value || 0) - (a.value || 0));
    if (sortBy === "value-asc") result.sort((a, b) => (a.value || 0) - (b.value || 0));
    return result;
  }, [list, q, filterStatus, filterSource, filterCustomer, sortBy]);

  const stats = useMemo(() => {
    const publicTemplates = list.filter(v => !v.user_id && !v.claimed_from);
    const personal = list.filter(v => v.user_id);
    const totalClaims = personal.filter(v => v.claimed_from).length;
    return {
      total: list.length,
      public: publicTemplates.length,
      personal: personal.length,
      available: personal.filter(v => !v.used).length,
      used: list.filter(v => v.used).length,
      totalClaims,
      totalValue: list.reduce((s, v) => s + (v.value || 0), 0)
    };
  }, [list]);

  const getSource = (v) => {
    if (v.claimed_from) return { label: "Đã nhận từ ƯĐ", color: "#8b5cf6", bg: "#ede9fe" };
    if (!v.user_id) return { label: "Toàn hệ thống", color: "#ec4899", bg: "#fce7f3" };
    return { label: "Cá nhân", color: "#2634d5", bg: "#eef2ff" };
  };

  const getClaimsCount = (templateId) => {
    return list.filter(v => v.claimed_from === templateId).length;
  };

  const loadClaims = async (templateId) => {
    try {
      const data = await api.vouchers.claims(templateId).catch(() => []);
      setClaims(Array.isArray(data) ? data : []);
      setClaimsModal(templateId);
    } catch (e) {
      toast(e.message || "Lỗi tải danh sách", "error");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      code: f.get("code")?.toUpperCase(),
      value: +f.get("value"),
      user_id: f.get("user_id") ? +f.get("user_id") : null,
      points_used: +f.get("points_used") || 0
    };
    try {
      if (modal?.id) {
        await api.vouchers.update(modal.id, data);
        toast("Đã cập nhật voucher", "success");
      } else {
        await api.vouchers.create(data);
        toast("Đã tạo voucher " + data.code, "success");
      }
      setModal(null);
      load();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa voucher này?")) return;
    try {
      await api.vouchers.remove(id);
      toast("Đã xóa", "success");
      setSelected(s => s.filter(x => x !== id));
      load();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    }
  };

  const removeSelected = async () => {
    if (!selected.length) return;
    if (!confirm("Xóa " + selected.length + " voucher đã chọn?")) return;
    try {
      await Promise.all(selected.map(id => api.vouchers.remove(id)));
      toast("Đã xóa " + selected.length + " voucher", "success");
      setSelected([]);
      load();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    }
  };

  const toggleUsed = async (v) => {
    try {
      await api.vouchers.update(v.id, { used: !v.used });
      toast(v.used ? "Đã đánh dấu chưa dùng" : "Đã đánh dấu đã dùng", "success");
      load();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    }
  };

  const copyCode = (v) => {
    navigator.clipboard.writeText(v.code);
    setCopiedId(v.id);
    toast("Đã sao chép mã " + v.code, "success");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportCSV = () => {
    const rows = [
      ["Mã", "Giá trị", "Nguồn", "Khách hàng", "Điểm đổi", "Trạng thái", "Ngày tạo"],
      ...filtered.map(v => {
        const c = customers.find(x => x.id === v.user_id);
        const src = getSource(v).label;
        return [
          v.code,
          v.value,
          src,
          c ? c.name : (v.user_id ? "User #" + v.user_id : "Toàn hệ thống"),
          v.points_used || 0,
          v.used ? "Đã dùng" : "Chưa dùng",
          v.created_at ? new Date(v.created_at).toLocaleString("vi-VN") : ""
        ];
      })
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vouchers-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Đã xuất CSV", "success");
  };

  const generateCode = () => {
    const n = Math.max(0, ...list.map(v => v.id)) + 1;
    return "VOUCHER" + String(n).padStart(4, "0");
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(v => v.id));
  };

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
        <Stat label="Tổng voucher" value={stats.total} color="#2634d5" icon={<Ticket size={16} />} />
        <Stat label="Toàn hệ thống" value={stats.public} color="#ec4899" icon={<Globe size={16} />} />
        <Stat label="Cá nhân" value={stats.personal} color="#8b5cf6" icon={<UserIcon size={16} />} />
        <Stat label="Chưa dùng" value={stats.available} color="#18a967" icon={<Gift size={16} />} />
        <Stat label="Đã dùng" value={stats.used} color="#ef4444" icon={<Check size={16} />} />
        <Stat label="Lượt nhận" value={stats.totalClaims} color="#f59e0b" icon={<Users size={16} />} />
      </div>

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-tertiary, #f5f7fb)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ color: "var(--text-light, #8993a3)" }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Tìm mã, giá trị, khách..."
              style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: "var(--text-primary, #172033)", fontSize: 13 }}
            />
          </div>

          <div style={{ display: "inline-flex", gap: 3, background: "var(--bg-tertiary, #f5f7fb)", padding: 4, borderRadius: 10 }}>
            {[
              { id: "all", label: "Tất cả" },
              { id: "public", label: "🌐 Public" },
              { id: "personal", label: "👤 Cá nhân" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterSource(f.id)}
                style={{
                  padding: "7px 12px",
                  background: filterSource === f.id ? "#2634d5" : "transparent",
                  color: filterSource === f.id ? "#fff" : "var(--text-muted, #475569)",
                  border: 0, borderRadius: 7, cursor: "pointer",
                  fontSize: 12, fontWeight: 600, whiteSpace: "nowrap"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="all">Tất cả TT</option>
            <option value="unused">Chưa dùng</option>
            <option value="used">Đã dùng</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="value-desc">Giá trị ↓</option>
            <option value="value-asc">Giá trị ↑</option>
          </select>

          <button onClick={exportCSV} style={toolBtn}>
            <Download size={14} /> Xuất
          </button>
          <button onClick={() => setModal({ code: generateCode() })} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#2634d5", color: "#fff", padding: "9px 16px",
            border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13
          }}>
            <Plus size={16} /> Tạo voucher
          </button>
        </div>

        {selected.length > 0 && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>
              Đã chọn <b>{selected.length}</b> voucher
            </span>
            <button onClick={removeSelected} style={{
              padding: "6px 14px", background: "#ef4444", color: "#fff",
              border: 0, borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12,
              display: "inline-flex", alignItems: "center", gap: 4
            }}>
              <Trash2 size={13} /> Xóa {selected.length}
            </button>
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-light, #8993a3)" }}>
          Hiển thị <b>{filtered.length}</b> / {list.length} voucher
        </div>
      </div>

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>
            <Ticket size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>{list.length === 0 ? "Chưa có voucher nào" : "Không có voucher khớp bộ lọc"}</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
                <th style={{ ...th, width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th style={th}>Mã</th>
                <th style={th}>Giá trị</th>
                <th style={th}>Nguồn</th>
                <th style={th}>Khách / Lượt nhận</th>
                <th style={th}>Trạng thái</th>
                <th style={th}>Ngày</th>
                <th style={{ ...th, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const cust = customers.find(c => c.id === v.user_id);
                const src = getSource(v);
                const isTemplate = !v.user_id && !v.claimed_from;
                const claimCount = isTemplate ? getClaimsCount(v.id) : 0;
                return (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={selected.includes(v.id)}
                        onChange={() => toggleSelect(v.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <b style={{ color: "#2634d5", fontFamily: "monospace", fontSize: 12 }}>{v.code}</b>
                        <button
                          onClick={() => copyCode(v)}
                          title="Sao chép"
                          style={{ background: "transparent", border: 0, cursor: "pointer", color: copiedId === v.id ? "#18a967" : "var(--text-light, #94a3b8)", padding: 2 }}
                        >
                          {copiedId === v.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td style={td}><b style={{ color: "#18a967" }}>{money(v.value)}</b></td>
                    <td style={td}>
                      <span style={{
                        padding: "3px 9px", borderRadius: 12,
                        fontSize: 10.5, fontWeight: 700,
                        background: src.bg, color: src.color,
                        display: "inline-flex", alignItems: "center", gap: 3,
                        whiteSpace: "nowrap"
                      }}>
                        {!v.user_id && !v.claimed_from ? <Globe size={10} /> : <UserIcon size={10} />}
                        {src.label}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: 12 }}>
                      {isTemplate ? (
                        <button
                          onClick={() => loadClaims(v.id)}
                          style={{
                            background: "transparent", border: 0, cursor: "pointer",
                            color: claimCount > 0 ? "#2634d5" : "var(--text-light, #94a3b8)",
                            fontWeight: claimCount > 0 ? 700 : 400,
                            display: "inline-flex", alignItems: "center", gap: 4,
                            fontSize: 12, padding: 0
                          }}
                        >
                          <Users size={12} />
                          {claimCount > 0 ? claimCount + " khách đã nhận" : "Chưa ai nhận"}
                        </button>
                      ) : cust ? (
                        cust.name
                      ) : v.user_id ? (
                        <span style={{ color: "var(--text-muted, #64748b)" }}>User #{v.user_id}</span>
                      ) : (
                        <span style={{ color: "var(--text-light, #94a3b8)" }}>—</span>
                      )}
                    </td>
                    <td style={td}>
                      <span style={{
                        padding: "3px 9px", borderRadius: 12,
                        fontSize: 10.5, fontWeight: 700,
                        background: v.used ? "#fee2e2" : "#e8f9f1",
                        color: v.used ? "#ef4444" : "#18a967"
                      }}>
                        {v.used ? "Đã dùng" : "Chưa dùng"}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: 11, color: "var(--text-muted, #64748b)" }}>
                      {v.created_at ? new Date(v.created_at).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        {isTemplate && (
                          <button onClick={() => loadClaims(v.id)} title="Xem lượt nhận" style={{ ...btnIcon, color: "#8b5cf6" }}>
                            <Eye size={14} />
                          </button>
                        )}
                        <button onClick={() => toggleUsed(v)} title={v.used ? "Đánh dấu chưa dùng" : "Đánh dấu đã dùng"} style={{
                          ...btnIcon,
                          color: v.used ? "#18a967" : "#f59e0b"
                        }}>
                          <Power size={14} />
                        </button>
                        <button onClick={() => setModal(v)} title="Sửa" style={btnIcon}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => remove(v.id)} title="Xóa" style={{ ...btnIcon, color: "#ef4444" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
                <Ticket size={20} /> {modal.id ? "Sửa voucher" : "Tạo voucher mới"}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={save}>
              <label style={label}>Mã voucher *</label>
              <input name="code" defaultValue={modal.code || generateCode()} required style={{ ...input, fontFamily: "monospace", textTransform: "uppercase" }} />

              <label style={label}>Giá trị (VNĐ) *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
                {[10000, 20000, 50000, 100000].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={e => e.target.form.value.value = v}
                    style={{ padding: "6px 4px", background: "var(--bg-tertiary, #f5f7fb)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--text-primary, #172033)" }}
                  >
                    {v / 1000}K
                  </button>
                ))}
              </div>
              <input name="value" type="number" defaultValue={modal.value || 10000} required style={input} />

              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "rgba(236, 72, 153, 0.08)", border: "1px solid rgba(236, 72, 153, 0.25)",
                borderRadius: 8, fontSize: 12, color: "#ec4899", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6
              }}>
                <Globe size={14} /> Để trống "Khách hàng" → voucher sẽ hiện ở trang "Ưu đãi" cho mọi khách nhận
              </div>

              <label style={label}>Khách hàng (để trống = toàn hệ thống)</label>
              <select name="user_id" defaultValue={modal.user_id || ""} style={input}>
                <option value="">— Toàn hệ thống —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>

              <label style={label}>Số điểm đổi (nếu có)</label>
              <input name="points_used" type="number" defaultValue={modal.points_used || 0} style={input} />

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setModal(null)} style={{ flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", cursor: "pointer", color: "var(--text-primary, #172033)", fontWeight: 600 }}>
                  Hủy
                </button>
                <button type="submit" style={{ flex: 1, padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Save size={14} /> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {claimsModal && (
        <div onClick={() => setClaimsModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 110, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={20} /> Khách đã nhận voucher
              </h3>
              <button onClick={() => setClaimsModal(null)} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>×</button>
            </div>

            {claims.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>
                Chưa có khách nào nhận voucher này
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
                    <th style={th}>Khách hàng</th>
                    <th style={th}>Mã cá nhân</th>
                    <th style={th}>Ngày nhận</th>
                    <th style={th}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(c => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                      <td style={td}>
                        <b style={{ fontSize: 13 }}>{c.user_name}</b>
                        <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>{c.user_email}</div>
                      </td>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 11 }}>{c.code}</td>
                      <td style={{ ...td, fontSize: 11, color: "var(--text-muted, #64748b)" }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td style={td}>
                        <span style={{
                          padding: "3px 9px", borderRadius: 12,
                          fontSize: 10.5, fontWeight: 700,
                          background: c.used ? "#fee2e2" : "#e8f9f1",
                          color: c.used ? "#ef4444" : "#18a967"
                        }}>
                          {c.used ? "Đã dùng" : "Chưa dùng"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button onClick={() => setClaimsModal(null)} style={{
              marginTop: 16, width: "100%", padding: 12,
              background: "#2634d5", color: "#fff", border: 0, borderRadius: 8,
              fontWeight: 700, cursor: "pointer", fontSize: 13
            }}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color, icon }) {
  return (
    <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: color + "18", color, display: "grid", placeItems: "center" }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

const th = { padding: 10, textAlign: "left", fontSize: 11.5, color: "var(--text-muted, #64748b)", fontWeight: 600 };
const td = { padding: 10, fontSize: 13, color: "var(--text-primary, #172033)" };
const btnIcon = { padding: 6, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6, background: "var(--card-bg, #fff)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-primary, #172033)", width: 28, height: 28 };
const label = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 12, color: "var(--text-muted, #475569)" };
const input = { width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, outline: "none", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 13, boxSizing: "border-box" };
const selectStyle = { padding: "9px 12px", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, outline: "none", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 12, cursor: "pointer" };
const toolBtn = { padding: "9px 14px", background: "var(--bg-tertiary, #f5f7fb)", color: "var(--text-primary, #172033)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 };