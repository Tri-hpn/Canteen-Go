import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, FolderPlus, Folder, X, Check, Save } from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";
import ImageUploader from "../../components/ImageUploader";

export default function OwnerMenu() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", icon: "🍽️" });
  const [editingCat, setEditingCat] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  const load = () => api.menu.list("", "Tất cả", "popular", true).then(setList).catch(() => {});
  useEffect(() => {
    load();
    api.categories.list().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filtered = list.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  const openModal = (item) => {
    setImage(item?.image || "");
    setModal(item || {});
  };

  const reloadCats = () => {
    api.categories.list().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  };

  const openAddCat = () => {
    setEditingCat(null);
    setCatForm({ name: "", icon: "🍽️" });
  };

  const openEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, icon: cat.icon || "🍽️" });
  };

  const saveCat = async () => {
    if (!catForm.name.trim()) { toast("Nhập tên danh mục", "error"); return; }
    setCatLoading(true);
    try {
      if (editingCat) {
        await api.categories.update(editingCat.id, { name: catForm.name.trim(), icon: catForm.icon });
        toast("Đã cập nhật danh mục", "success");
      } else {
        await api.categories.create({ name: catForm.name.trim(), icon: catForm.icon });
        toast("Đã thêm danh mục", "success");
      }
      setEditingCat(null);
      setCatForm({ name: "", icon: "🍽️" });
      reloadCats();
      load();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    } finally {
      setCatLoading(false);
    }
  };

  const removeCat = async (cat) => {
    if (!confirm("Xóa danh mục \"" + cat.name + "\"?")) return;
    try {
      await api.categories.remove(cat.id);
      toast("Đã xóa danh mục", "success");
      reloadCats();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: f.get("name"),
      category: f.get("category"),
      price: +f.get("price"),
      original_price: +f.get("original_price") || +f.get("price"),
      discount_percent: +f.get("discount_percent") || 0,
      stock: +f.get("stock"),
      description: f.get("description"),
      image: image || f.get("imageUrl") || "",
      reason: f.get("reason") || ""
    };

    try {
      if (modal._id || modal.id) {
        await api.menu.update(modal._id || modal.id, data);
        toast("Đã cập nhật món", "success");
      } else {
        await api.menu.create(data);
        toast("Đã thêm món mới", "success");
      }
      setModal(null);
      setImage("");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const toggleActive = async (item) => {
    const newActive = item.active ? 0 : 1;
    try {
      await api.menu.update(item._id || item.id, { active: newActive });
      toast(newActive ? "Đã bật món" : "Đã tắt món", "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const remove = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa món này?")) return;
    try {
      await api.menu.remove(id);
      toast("Đã xóa món", "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
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
            placeholder="Tìm món ăn..."
            style={{
              flex: 1, border: 0, outline: "none", fontSize: 13,
              background: "transparent", color: "var(--text-primary, #172033)"
            }}
          />
        </div>
        <button
          onClick={() => openModal(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#2634d5", color: "#fff",
            padding: "10px 16px", border: 0, borderRadius: 10,
            fontWeight: 600, cursor: "pointer", fontSize: 13
          }}
        >
          <Plus size={16} /> Thêm món
        </button>
        <button
          onClick={() => { openAddCat(); setShowCatModal(true); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--card-bg, #fff)",
            color: "#2634d5",
            padding: "10px 16px",
            border: "1px solid #2634d5",
            borderRadius: 10,
            fontWeight: 600, cursor: "pointer", fontSize: 13
          }}
        >
          <FolderPlus size={16} /> Thêm danh mục
        </button>
      </div>

      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Ảnh</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Món</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Danh mục</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Giá</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Tồn</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m._id || m.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                <td style={{ padding: 11 }}>
                  <img src={m.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                </td>
                <td style={{ padding: 11, color: "var(--text-primary, #172033)", fontSize: 13 }}><b>{m.name}</b></td>
                <td style={{ padding: 11, color: "var(--text-muted, #64748b)", fontSize: 13 }}>{m.category}</td>
                <td style={{ padding: 11, textAlign: "right" }}>{m.discount_percent > 0 ? (<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}><span style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>{money(m.original_price)}</span><div style={{ display: "flex", alignItems: "center", gap: 4 }}><b style={{ color: "#ef4444", fontSize: 13 }}>{money(m.price)}</b><span style={{ background: "linear-gradient(135deg, #ef4444, #f59e0b)", color: "#fff", padding: "1px 6px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>-{m.discount_percent}%</span></div></div>) : (<b style={{ color: "#18a967", fontSize: 13 }}>{money(m.price)}</b>)}</td>
                <td style={{ padding: 11, textAlign: "right", color: "var(--text-primary, #172033)", fontSize: 13 }}>{m.stock}</td>
                <td style={{ padding: 11 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openModal(m)} style={{
                      padding: 6, border: "1px solid var(--border-color, #e5e9ef)",
                      borderRadius: 6, background: "var(--card-bg, #fff)",
                      cursor: "pointer", color: "var(--text-primary, #172033)"
                    }}>
                      <Edit size={15} />
                    </button>
                    <button onClick={() => remove(m._id || m.id)} style={{
                      padding: 6, border: "1px solid var(--border-color, #e5e9ef)",
                      borderRadius: 6, background: "var(--card-bg, #fff)",
                      cursor: "pointer", color: "#ef4444"
                    }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCatModal && (
        <div onClick={() => setShowCatModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
                <Folder size={20} style={{ color: "#2634d5" }} /> Quản lý danh mục
              </h3>
              <button onClick={() => setShowCatModal(false)} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ background: "var(--bg-tertiary, #f5f7fb)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted, #475569)", marginBottom: 8 }}>
                {editingCat ? "✏️ Sửa danh mục" : "➕ Thêm danh mục mới"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 8 }}>
                <input
                  value={catForm.icon}
                  onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                  placeholder="🍽️"
                  maxLength={4}
                  style={{
                    padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, outline: "none", textAlign: "center", fontSize: 20,
                    background: "var(--card-bg, #fff)"
                  }}
                />
                <input
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="VD: Bún, Phở, Tráng miệng..."
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveCat(); } }}
                  style={{
                    padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, outline: "none",
                    background: "var(--card-bg, #fff)",
                    color: "var(--text-primary, #172033)"
                  }}
                />
                <button
                  onClick={saveCat}
                  disabled={catLoading || !catForm.name.trim()}
                  style={{
                    padding: "10px 16px",
                    background: (!catForm.name.trim() || catLoading) ? "#94a3b8" : "#2634d5",
                    color: "#fff", border: 0, borderRadius: 8,
                    fontWeight: 700, cursor: (!catForm.name.trim() || catLoading) ? "not-allowed" : "pointer",
                    fontSize: 13,
                    display: "inline-flex", alignItems: "center", gap: 4
                  }}
                >
                  <Save size={14} /> {editingCat ? "Lưu" : "Thêm"}
                </button>
              </div>
              {editingCat && (
                <button
                  onClick={() => { setEditingCat(null); setCatForm({ name: "", icon: "🍽️" }); }}
                  style={{
                    marginTop: 8, background: "transparent", border: 0,
                    color: "#ef4444", fontSize: 12, cursor: "pointer",
                    fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4
                  }}
                >
                  <X size={12} /> Hủy sửa
                </button>
              )}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted, #475569)", marginBottom: 8 }}>
              Danh sách ({categories.length})
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {categories.map(cat => (
                <div key={cat.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px",
                  background: "var(--card-bg, #fff)",
                  border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "var(--bg-tertiary, #f5f7fb)",
                    display: "grid", placeItems: "center", fontSize: 18
                  }}>
                    {cat.icon || "🍽️"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13, color: "var(--text-primary, #172033)" }}>{cat.name}</b>
                    <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>
                      {api && cat.order ? "Thứ tự: " + cat.order : ""}
                    </div>
                  </div>
                  <button onClick={() => openEditCat(cat)} title="Sửa" style={{
                    padding: 6, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 6, background: "var(--card-bg, #fff)",
                    cursor: "pointer", color: "#2634d5",
                    display: "grid", placeItems: "center"
                  }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => removeCat(cat)} title="Xóa" style={{
                    padding: 6, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 6, background: "var(--card-bg, #fff)",
                    cursor: "pointer", color: "#ef4444",
                    display: "grid", placeItems: "center"
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)", fontSize: 13 }}>
                  Chưa có danh mục nào
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCatModal(false)}
              style={{
                marginTop: 16, width: "100%", padding: 12,
                background: "#2634d5", color: "#fff",
                border: 0, borderRadius: 8,
                fontWeight: 700, cursor: "pointer", fontSize: 13
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", zIndex: 100, padding: 20
        }} onClick={() => setModal(null)}>
          <div style={{
            background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24,
            width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)" }}>
              {modal._id || modal.id ? "Sửa món" : "Thêm món"}
            </h3>
            <form onSubmit={save}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Tên món *</label>
              <input name="name" defaultValue={modal.name || ""} required style={{
                width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14, outline: "none",
                background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
              }} />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Danh mục</label>
              <select name="category" defaultValue={modal.category || "Cơm"} style={{
                width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14, outline: "none",
                background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
              }}>
                {categories.length === 0 && <option>Cơm</option>}
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Giá *</label>
                  <input name="price" type="number" defaultValue={modal.price || 30000} required style={{
                    width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, marginBottom: 14, outline: "none",
                    background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                  }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Giá gốc (nếu giảm)</label>
                  <input name="original_price" type="number" defaultValue={modal.original_price || ""} placeholder="VD: 50000" style={{
                    width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, marginBottom: 14, outline: "none",
                    background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                  }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>% Giảm giá</label>
                  <input name="discount_percent" type="number" min="0" max="90" defaultValue={modal.discount_percent || 0} style={{
                    width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, marginBottom: 14, outline: "none",
                    background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                  }} />
                </div>
              </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Số lượng *</label>
                  <input name="stock" type="number" defaultValue={modal.stock || 10} required style={{
                    width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                    borderRadius: 8, marginBottom: 14, outline: "none",
                    background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
                  }} />
                </div>
              </div>

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Mô tả</label>
              <textarea name="description" defaultValue={modal.description || ""} style={{
                width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14, outline: "none", minHeight: 60,
                background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
              }} />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
                Lý do đổi giá (nếu có)
              </label>
              <input name="reason" placeholder="VD: Tăng giá nguyên liệu, khuyến mãi..." style={{
                width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14, outline: "none",
                background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 13
              }} />

              <ImageUploader value={image} onChange={setImage} label="Ảnh món ăn (JPEG/PNG)" />

              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>Hoặc dán URL ảnh</label>
              <input name="imageUrl" defaultValue={modal.image?.startsWith("http") ? modal.image : ""} placeholder="https://..." style={{
                width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, marginBottom: 14, outline: "none",
                background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)"
              }} />

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => { setModal(null); setImage(""); }} style={{
                  flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8, background: "var(--card-bg, #fff)",
                  cursor: "pointer", color: "var(--text-primary, #172033)"
                }}>Hủy</button>
                <button type="submit" style={{
                  flex: 1, padding: 12, background: "#2634d5", color: "#fff",
                  border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer"
                }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
