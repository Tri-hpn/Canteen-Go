import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, PackageOpen, AlertTriangle, Package, History } from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

export default function OwnerInventory() {
  const [list, setList] = useState([]);
  const [imports, setImports] = useState([]);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [importModal, setImportModal] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const load = async () => {
    try {
      const data = await api.inventory.list();
      setList(data || []);
    } catch { setList([]); }
  };

  const loadImports = async () => {
    try {
      const data = await api.inventory.imports();
      setImports(data || []);
    } catch { setImports([]); }
  };

  useEffect(() => { load(); loadImports(); }, []);

  const filtered = list.filter(x =>
    x.name?.toLowerCase().includes(q.toLowerCase()) ||
    x.code?.toLowerCase().includes(q.toLowerCase())
  );

  const lowStock = list.filter(x => x.qty < x.min);
  const outOfStock = list.filter(x => x.qty === 0);

  const save = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      code: f.get("code"),
      name: f.get("name"),
      qty: +f.get("qty"),
      unit: f.get("unit"),
      min: +f.get("min")
    };
    try {
      if (modal.code) {
        await api.inventory.update(modal.code, data);
        toast("Đã cập nhật nguyên liệu", "success");
      } else {
        await api.inventory.create(data);
        toast("Đã thêm nguyên liệu", "success");
      }
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const remove = async (code) => {
    if (!confirm("Xóa nguyên liệu này?")) return;
    try {
      await api.inventory.remove(code);
      toast("Đã xóa", "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const doImport = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      const res = await api.inventory.import(importModal.code, {
        qty: +f.get("qty"),
        supplier: f.get("supplier"),
        note: f.get("note")
      });
      toast("Đã nhập " + res.record.qty + " " + importModal.unit, "success");
      setImportModal(null);
      load();
      loadImports();
    } catch (e) { toast(e.message, "error"); }
  };

  const getStatusStyle = (status) => {
    const isDark = document.documentElement.classList.contains("dark-mode");
    if (isDark) {
      if (status === "Còn hàng") return { bg: "#065f46", color: "#d1fae5", border: "#10b981" };
      if (status === "Sắp hết") return { bg: "#92400e", color: "#fef3c7", border: "#f59e0b" };
      return { bg: "#991b1b", color: "#fee2e2", border: "#ef4444" };
    }
    if (status === "Còn hàng") return { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
    if (status === "Sắp hết") return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
    return { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
  };

  return (
    <div>
      {lowStock.length > 0 && (
        <div style={{
          display: "flex", gap: 14, alignItems: "center",
          background: "var(--bg-tertiary, #fff4d8)",
          border: "1px solid #fde68a",
          color: "#92400e", padding: "16px 20px", borderRadius: 12, marginBottom: 18
        }}>
          <AlertTriangle size={20} />
          <div>
            <b style={{ fontSize: 13 }}>Cảnh báo tồn kho thấp</b>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{lowStock.length} nguyên liệu dưới mức tối thiểu.</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e5e9ef)",
          borderRadius: 10, padding: "10px 14px", flex: 1, maxWidth: 400
        }}>
          <Search size={18} style={{ color: "var(--text-light, #8993a3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm nguyên liệu..."
            style={{
              flex: 1, border: 0, outline: "none", fontSize: 13,
              background: "transparent", color: "var(--text-primary, #172033)"
            }}
          />
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: showHistory ? "#18a967" : "var(--card-bg, #fff)",
            color: showHistory ? "#fff" : "var(--text-primary, #172033)",
            padding: "10px 16px", border: "1px solid var(--border-color, #e5e9ef)",
            borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13
          }}
        >
          <History size={16} /> Lịch sử nhập
        </button>
        <button
          onClick={() => setModal({})}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#2634d5", color: "#fff",
            padding: "10px 16px", border: 0, borderRadius: 10,
            fontWeight: 600, cursor: "pointer", fontSize: 13
          }}
        >
          <Plus size={16} /> Thêm nguyên liệu
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <StatBox label="Tổng nguyên liệu" value={list.length} color="#2634d5" />
        <StatBox label="Sắp hết" value={lowStock.length} color="#f59e0b" />
        <StatBox label="Hết hàng" value={outOfStock.length} color="#ef4444" />
        <StatBox label="Đủ hàng" value={list.length - lowStock.length} color="#18a967" />
      </div>

      {/* Table */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Mã</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Nguyên liệu</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Số lượng</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Đơn vị</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Tối thiểu</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Trạng thái</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x) => {
              const status = x.qty === 0 ? "Hết hàng" : x.qty < x.min ? "Sắp hết" : "Còn hàng";
              const st = getStatusStyle(status);
              return (
                <tr key={x.code} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                  <td style={{ padding: 11, color: "var(--text-primary, #172033)", fontSize: 13 }}><b>{x.code}</b></td>
                  <td style={{ padding: 11, color: "var(--text-primary, #172033)", fontSize: 13 }}>{x.name}</td>
                  <td style={{ padding: 11, textAlign: "right", color: st.color, fontWeight: 700, fontSize: 13 }}>{x.qty}</td>
                  <td style={{ padding: 11, color: "var(--text-muted, #64748b)", fontSize: 13 }}>{x.unit}</td>
                  <td style={{ padding: 11, textAlign: "right", color: "var(--text-muted, #64748b)", fontSize: 13 }}>{x.min}</td>
                  <td style={{ padding: 11 }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: st.bg, color: st.color, border: "1px solid " + st.border
                    }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: 11 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setImportModal(x)}
                        title="Nhập kho"
                        style={{
                          padding: 6, border: "1px solid #18a967", borderRadius: 6,
                          background: "#18a967", color: "#fff", cursor: "pointer"
                        }}
                      >
                        <Package size={15} />
                      </button>
                      <button onClick={() => setModal(x)} style={{
                        padding: 6, border: "1px solid var(--border-color, #e5e9ef)",
                        borderRadius: 6, background: "var(--card-bg, #fff)",
                        cursor: "pointer", color: "var(--text-primary, #172033)"
                      }}>
                        <Edit size={15} />
                      </button>
                      <button onClick={() => remove(x.code)} style={{
                        padding: 6, border: "1px solid var(--border-color, #e5e9ef)",
                        borderRadius: 6, background: "var(--card-bg, #fff)",
                        cursor: "pointer", color: "#ef4444"
                      }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>Chưa có nguyên liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* History */}
      {showHistory && (
        <div style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e7ebf0)",
          borderRadius: 12, padding: 20, marginTop: 20
        }}>
          <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>
            <History size={18} style={{ display: "inline", marginRight: 8 }} />
            Lịch sử nhập kho ({imports.length})
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
                <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Thời gian</th>
                <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Nguyên liệu</th>
                <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>SL nhập</th>
                <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Tồn sau</th>
                <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Người nhập</th>
                <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Nhà cung cấp</th>
              </tr>
            </thead>
            <tbody>
              {imports.slice(0, 30).map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                  <td style={{ padding: 11, fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                    {new Date(r.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td style={{ padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" }}>
                    <b>{r.name}</b> ({r.code})
                  </td>
                  <td style={{ padding: 11, textAlign: "right", fontSize: 13 }}>
                    <b style={{ color: "#18a967" }}>+{r.qty} {r.unit}</b>
                  </td>
                  <td style={{ padding: 11, textAlign: "right", fontSize: 13, color: "var(--text-primary, #172033)" }}>
                    {r.after} {r.unit}
                  </td>
                  <td style={{ padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" }}>{r.imported_by}</td>
                  <td style={{ padding: 11, fontSize: 12, color: "var(--text-muted, #64748b)" }}>{r.supplier || "—"}</td>
                </tr>
              ))}
              {!imports.length && (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>Chưa có lịch sử nhập</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal thêm/sửa */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", zIndex: 100, padding: 20
        }} onClick={() => setModal(null)}>
          <div style={{
            background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24,
            width: "100%", maxWidth: 480
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>
              {modal.code ? "Sửa nguyên liệu" : "Thêm nguyên liệu"}
            </h3>
            <form onSubmit={save}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Mã *</label>
              <input name="code" defaultValue={modal.code || "NL" + String(list.length + 1).padStart(3, "0")}
                required disabled={!!modal.code}
                style={{
                  width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8, marginBottom: 14, outline: "none",
                  background: modal.code ? "var(--bg-tertiary, #f5f7fb)" : "var(--bg-secondary, #fff)",
                  color: "var(--text-primary, #172033)"
                }}
              />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Tên *</label>
              <input name="name" defaultValue={modal.name || ""} required
                style={{
                  width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8, marginBottom: 14, outline: "none",
                  background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Số lượng</label>
                  <input name="qty" type="number" defaultValue={modal.qty || 0} required
                    style={{
                      width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                      borderRadius: 8, marginBottom: 14, outline: "none",
                      background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Đơn vị</label>
                  <select name="unit" defaultValue={modal.unit || "kg"}
                    style={{
                      width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                      borderRadius: 8, marginBottom: 14, outline: "none",
                      background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                    }}
                  >
                    <option>kg</option><option>g</option><option>lít</option>
                    <option>ml</option><option>chai</option><option>hộp</option><option>cái</option>
                  </select>
                </div>
              </div>

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Mức tối thiểu</label>
              <input name="min" type="number" defaultValue={modal.min || 10} required
                style={{
                  width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8, marginBottom: 14, outline: "none",
                  background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setModal(null)}
                  style={{
                    flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, background: "var(--card-bg, #fff)",
                    cursor: "pointer", color: "var(--text-primary, #172033)"
                  }}
                >Hủy</button>
                <button type="submit"
                  style={{
                    flex: 1, padding: 12, background: "#2634d5", color: "#fff",
                    border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer"
                  }}
                >Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nhập kho */}
      {importModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", zIndex: 100, padding: 20
        }} onClick={() => setImportModal(null)}>
          <div style={{
            background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24,
            width: "100%", maxWidth: 480
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>
              <Package size={20} style={{ display: "inline", marginRight: 8, color: "#18a967" }} />
              Nhập kho
            </h3>
            <div style={{
              background: "var(--bg-tertiary, #f5f7fb)",
              borderRadius: 10, padding: 12, marginBottom: 16,
              fontSize: 13, color: "var(--text-muted, #64748b)"
            }}>
              <b style={{ color: "var(--text-primary, #172033)" }}>{importModal.name}</b> ({importModal.code})
              <div style={{ marginTop: 4 }}>
                Tồn hiện tại: <b style={{ color: "var(--text-primary, #172033)" }}>{importModal.qty} {importModal.unit}</b>
              </div>
            </div>

            <form onSubmit={doImport}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
                Số lượng nhập ({importModal.unit}) *
              </label>
              <input name="qty" type="number" min="1" defaultValue="10" required autoFocus
                style={{
                  width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8, marginBottom: 14, outline: "none",
                  background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 14
                }}
              />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Nhà cung cấp</label>
              <input name="supplier" placeholder="VD: Công ty TNHH ABC"
                style={{
                  width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8, marginBottom: 14, outline: "none",
                  background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                }}
              />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Ghi chú</label>
              <textarea name="note" placeholder="VD: Hàng tươi, nhập buổi sáng..."
                style={{
                  width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8, marginBottom: 14, outline: "none", minHeight: 60,
                  background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setImportModal(null)}
                  style={{
                    flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, background: "var(--card-bg, #fff)",
                    cursor: "pointer", color: "var(--text-primary, #172033)"
                  }}
                >Hủy</button>
                <button type="submit"
                  style={{
                    flex: 1, padding: 12, background: "#18a967", color: "#fff",
                    border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer"
                  }}
                >Nhập kho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #e7ebf0)",
      borderRadius: 12, padding: 18
    }}>
      <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{label}</span>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
