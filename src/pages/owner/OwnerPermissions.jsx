import { useEffect, useState } from "react";
import { Shield, Check, Search, Save, RotateCcw, Users, Edit, X } from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

const ROLE_TABS = [
  { id: "EMPLOYEE", label: "Nhân viên" },
  { id: "CUSTOMER", label: "Khách hàng" }
];

export default function OwnerPermissions() {
  const [allPermissions, setAllPermissions] = useState([]);
  const [roleDefaults, setRoleDefaults] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerms, setUserPerms] = useState({ custom: [], permissions: [] });
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const load = async () => {
    try {
      const res = await api.permissions.all();
      setAllPermissions(res.all || []);
      setRoleDefaults(res.roles || {});
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await api.users.list();
      setUsers(allUsers.filter(u => u.role !== "ADMIN"));
    } catch (e) {
      toast(e.message, "error");
    }
  };

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  const openUser = async (u) => {
    setSelectedUser(u);
    setIsEditing(false);
    try {
      const res = await api.permissions.ofUser(u.id);
      setUserPerms(res);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const togglePerm = (key) => {
    if (!isEditing) {
      toast("Bấm Sửa để chỉnh quyền", "info");
      return;
    }
    if (!selectedUser) return;
    const isDefault = roleDefaults[selectedUser.role]?.includes(key);
    if (isDefault) {
      toast("Quyền này thuộc role mặc định, không thể bỏ", "info");
      return;
    }

    setUserPerms(prev => {
      const has = prev.custom.includes(key);
      return {
        ...prev,
        custom: has ? prev.custom.filter(x => x !== key) : [...prev.custom, key],
        permissions: has
          ? prev.permissions.filter(x => x !== key)
          : [...prev.permissions, key]
      };
    });
  };

  const startEdit = () => {
    setIsEditing(true);
    toast("Đang chỉnh sửa quyền", "info");
  };

  const cancelEdit = async () => {
    setIsEditing(false);
    if (selectedUser) {
      const res = await api.permissions.ofUser(selectedUser.id);
      setUserPerms(res);
    }
  };

  const save = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await api.permissions.update(selectedUser.id, userPerms.custom);
      toast("Đã cập nhật quyền cho " + selectedUser.name, "success");
      await openUser(selectedUser);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetCustom = async () => {
    if (!selectedUser) return;
    if (!isEditing) {
      toast("Bấm Sửa để chỉnh quyền", "info");
      return;
    }
    if (!confirm(`Xóa tất cả quyền custom của ${selectedUser.name}?`)) return;
    setLoading(true);
    try {
      await api.permissions.update(selectedUser.id, []);
      toast("Đã reset về quyền mặc định", "success");
      await openUser(selectedUser);
      setIsEditing(true);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter theo role tab + search
  const filteredUsers = users
    .filter(u => u.role === activeRole)
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        {/* Cột trái */}
        <div style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e7ebf0)",
          borderRadius: 12, padding: 16, height: "fit-content"
        }}>
          <h3 style={{
            marginTop: 0, marginBottom: 12,
            color: "var(--text-primary, #172033)",
            fontSize: 14, display: "flex", alignItems: "center", gap: 6
          }}>
            <Users size={16} /> Người dùng
          </h3>

          {/* Tabs role */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
            background: "var(--bg-tertiary, #f5f7fb)",
            padding: 4, borderRadius: 10, marginBottom: 12
          }}>
            {ROLE_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveRole(t.id); setSelectedUser(null); setIsEditing(false); }}
                style={{
                  padding: "8px 10px",
                  background: activeRole === t.id ? "#2634d5" : "transparent",
                  color: activeRole === t.id ? "#fff" : "var(--text-muted, #475569)",
                  border: 0, borderRadius: 7, cursor: "pointer",
                  fontWeight: 700, fontSize: 12
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-tertiary, #f5f7fb)",
            borderRadius: 8, padding: "8px 12px", marginBottom: 12
          }}>
            <Search size={14} style={{ color: "var(--text-light, #8993a3)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm..."
              style={{
                border: 0, outline: "none", background: "transparent",
                color: "var(--text-primary, #172033)", fontSize: 12, flex: 1
              }}
            />
          </div>

          {/* User list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 500, overflowY: "auto" }}>
            {filteredUsers.map(u => (
              <button
                key={u.id}
                onClick={() => openUser(u)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: 10,
                  background: selectedUser?.id === u.id ? "rgba(38, 52, 213, 0.1)" : "transparent",
                  border: selectedUser?.id === u.id ? "1px solid #2634d5" : "1px solid transparent",
                  borderRadius: 10, cursor: "pointer", textAlign: "left"
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: u.role === "EMPLOYEE"
                    ? "linear-gradient(135deg,#2634d5,#20c779)"
                    : "linear-gradient(135deg,#f59e0b,#ef4444)",
                  color: "#fff", display: "grid", placeItems: "center",
                  fontWeight: 700, fontSize: 11, flexShrink: 0
                }}>
                  {u.name?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: "var(--text-primary, #172033)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>
                    {u.role === "EMPLOYEE" ? "Nhân viên" : "Khách hàng"}
                  </div>
                </div>
              </button>
            ))}
            {!filteredUsers.length && (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-light, #8993a3)", fontSize: 12 }}>
                Không có {activeRole === "EMPLOYEE" ? "nhân viên" : "khách hàng"}
              </div>
            )}
          </div>
        </div>

        {/* Cột phải */}
        <div style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e7ebf0)",
          borderRadius: 12, padding: 20
        }}>
          {!selectedUser ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-light, #8993a3)" }}>
              <Shield size={60} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>Chọn 1 người dùng để phân quyền</p>
            </div>
          ) : (
            <>
              {/* Header + buttons */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 16, paddingBottom: 16,
                borderBottom: "1px solid var(--border-color, #eef2f7)",
                flexWrap: "wrap", gap: 12
              }}>
                <div>
                  <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>{selectedUser.name}</h3>
                  <span style={{ fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                    {selectedUser.email} · <span style={{ color: "#2634d5", fontWeight: 600 }}>
                      {selectedUser.role === "EMPLOYEE" ? "Nhân viên" : "Khách hàng"}
                    </span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={resetCustom}
                    disabled={loading || !isEditing}
                    style={{
                      padding: "8px 14px",
                      background: "var(--bg-tertiary, #f5f7fb)",
                      border: "1px solid var(--border-color, #e5e9ef)",
                      borderRadius: 8,
                      cursor: (loading || !isEditing) ? "not-allowed" : "pointer",
                      color: "var(--text-primary, #172033)",
                      fontSize: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      opacity: isEditing ? 1 : 0.5
                    }}
                  >
                    <RotateCcw size={13} /> Reset
                  </button>

                  {!isEditing ? (
                    <button
                      onClick={startEdit}
                      style={{
                        padding: "8px 14px",
                        background: "var(--bg-tertiary, #f5f7fb)",
                        border: "1px solid var(--border-color, #e5e9ef)",
                        borderRadius: 8,
                        cursor: "pointer",
                        color: "var(--text-primary, #172033)",
                        fontSize: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 600
                      }}
                    >
                      <Edit size={13} /> Sửa
                    </button>
                  ) : (
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: "8px 14px",
                        background: "var(--bg-tertiary, #f5f7fb)",
                        border: "1px solid var(--border-color, #e5e9ef)",
                        borderRadius: 8,
                        cursor: "pointer",
                        color: "#ef4444",
                        fontSize: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 600
                      }}
                    >
                      <X size={13} /> Hủy
                    </button>
                  )}

                  <button
                    onClick={save}
                    disabled={loading || !isEditing}
                    style={{
                      padding: "8px 14px",
                      background: "#2634d5",
                      color: "#fff",
                      border: 0,
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: (loading || !isEditing) ? "not-allowed" : "pointer",
                      fontSize: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      opacity: (loading || !isEditing) ? 0.5 : 1
                    }}
                  >
                    <Save size={13} /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>

              {/* Mode indicator */}
              {isEditing && (
                <div style={{
                  padding: "8px 12px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#92400e",
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 12,
                  fontWeight: 600
                }}>
                  ✏️ Đang ở chế độ chỉnh sửa — tick/bỏ tick quyền, sau đó bấm "Lưu thay đổi"
                </div>
              )}

              {/* Grid quyền */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {allPermissions.map(p => {
                  const isDefault = roleDefaults[selectedUser.role]?.includes(p.key);
                  const isChecked = userPerms.permissions?.includes(p.key);

                  return (
                    <button
                      key={p.key}
                      onClick={() => togglePerm(p.key)}
                      disabled={isDefault || !isEditing}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: 12,
                        background: isChecked ? "rgba(24, 169, 103, 0.08)" : "var(--bg-tertiary, #f8fafc)",
                        border: isChecked ? "2px solid #18a967" : "2px solid var(--border-color, #e5e9ef)",
                        borderRadius: 10,
                        cursor: (isDefault || !isEditing) ? "not-allowed" : "pointer",
                        textAlign: "left",
                        opacity: isDefault ? 0.7 : (isEditing ? 1 : 0.85)
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: isChecked ? "#18a967" : "transparent",
                        border: isChecked ? "0" : "2px solid var(--border-color, #cbd5e1)",
                        display: "grid", placeItems: "center", flexShrink: 0
                      }}>
                        {isChecked && <Check size={12} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary, #172033)" }}>
                          {p.label}
                        </div>
                        {isDefault && (
                          <div style={{ fontSize: 10, color: "#2634d5", fontWeight: 600, marginTop: 2 }}>
                            Mặc định theo role
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}