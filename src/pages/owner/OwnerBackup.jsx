import { useEffect, useRef, useState } from "react";
import { Download, Upload, AlertTriangle, Database, RefreshCw, HardDrive, CheckCircle2 } from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

export default function OwnerBackup() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const fileRef = useRef();

  const loadStats = () => {
    api.backup.stats().then(setStats).catch(() => {});
  };

  useEffect(() => { loadStats(); }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const backup = await api.backup.export();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.href = url;
      a.download = `canteen-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Đã xuất file backup", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith(".json")) {
      toast("Chỉ chấp nhận file .json", "error");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast("File quá lớn (tối đa 10MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!confirm("Import file này? Dữ liệu hiện tại sẽ được backup tự động rồi thay thế.")) return;
        
        setLoading(true);
        const res = await api.backup.import({
          data: parsed.data || parsed,
          version: parsed.version
        });
        
        setImportStats(res.stats);
        toast("Import thành công!", "success");
        loadStats();
      } catch (e) {
        toast("File không hợp lệ: " + e.message, "error");
      } finally {
        setLoading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await api.backup.reset("RESET");
      toast("Đã reset database về dữ liệu mẫu", "success");
      setResetModal(false);
      loadStats();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fmtSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div>
      {/* Cảnh báo */}
      <div style={{
        display: "flex", gap: 14, alignItems: "center",
        background: "rgba(245, 158, 11, 0.15)",
        border: "1px solid #f59e0b40",
        color: "#f59e0b", padding: "16px 20px", borderRadius: 12, marginBottom: 18
      }}>
        <AlertTriangle size={22} />
        <div>
          <b style={{ fontSize: 14 }}>Lưu ý về backup</b>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            Backup chứa toàn bộ dữ liệu: users (có mật khẩu hash), menu, đơn hàng, kho, ...
            Chỉ dùng để restore trên server của bạn.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <ActionCard
          icon={<Download size={28} />}
          title="Xuất backup"
          desc="Tải file JSON toàn bộ dữ liệu"
          color="#18a967"
          onClick={handleExport}
          disabled={loading}
          buttonText="📥 Tải xuống"
        />
        <ActionCard
          icon={<Upload size={28} />}
          title="Import backup"
          desc="Khôi phục từ file JSON"
          color="#2634d5"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          buttonText="📤 Chọn file"
        />
        <ActionCard
          icon={<RefreshCw size={28} />}
          title="Reset database"
          desc="Xóa hết và tạo lại dữ liệu mẫu"
          color="#ef4444"
          onClick={() => setResetModal(true)}
          disabled={loading}
          buttonText="⚠️ Reset"
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Stats database */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
            <Database size={20} /> Dung lượng database
          </h3>
          <button onClick={loadStats} style={{
            padding: "6px 12px", background: "var(--bg-tertiary, #f5f7fb)",
            border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6,
            cursor: "pointer", fontSize: 12, color: "var(--text-primary, #172033)",
            display: "inline-flex", alignItems: "center", gap: 4
          }}>
            <RefreshCw size={13} /> Làm mới
          </button>
        </div>

        {stats && (
          <>
            <div style={{
              background: "linear-gradient(135deg, #2634d5, #20c779)",
              color: "#fff", borderRadius: 12, padding: 20, marginBottom: 16,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: 13, opacity: 0.9 }}>Tổng dung lượng</span>
                <div style={{ fontSize: 32, fontWeight: 800, margin: "6px 0" }}>
                  {fmtSize(stats.db_size_bytes)}
                </div>
              </div>
              <HardDrive size={48} style={{ opacity: 0.3 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <StatItem label="Users" value={stats.users} sub={`${stats.customers} KH · ${stats.employees} NV`} color="#2634d5" />
              <StatItem label="Món ăn" value={stats.menu_items} color="#18a967" />
              <StatItem label="Đơn hàng" value={stats.orders} color="#f59e0b" />
              <StatItem label="Kho hàng" value={stats.inventory} color="#8b5cf6" />
              <StatItem label="Toppings" value={stats.toppings} color="#ec4899" />
              <StatItem label="Đánh giá" value={stats.reviews} color="#14b8a6" />
              <StatItem label="Vouchers" value={stats.vouchers} color="#f97316" />
              <StatItem label="Chấm công" value={stats.attendances} color="#06b6d4" />
              <StatItem label="Nhập kho" value={stats.imports} color="#84cc16" />
              <StatItem label="Lịch sử giá" value={stats.price_history} color="#a855f7" />
              <StatItem label="Thông báo" value={stats.notifications} color="#ef4444" />
              <StatItem label="Tin nhắn" value={stats.messages} color="#3b82f6" />
            </div>
          </>
        )}
      </div>

      {/* Import result */}
      {importStats && (
        <div style={{
          background: "rgba(24, 169, 103, 0.1)",
          border: "1px solid #18a96740",
          borderRadius: 12, padding: 20, marginTop: 20
        }}>
          <h3 style={{ marginTop: 0, color: "#18a967", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={20} /> Import thành công
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, fontSize: 13 }}>
            {Object.entries(importStats).map(([key, value]) => (
              <div key={key} style={{
                background: "var(--bg-tertiary, #f8fafc)",
                padding: 10, borderRadius: 8, color: "var(--text-primary, #172033)"
              }}>
                <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "capitalize" }}>
                  {key.replace(/_/g, " ")}
                </span>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {resetModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", zIndex: 100, padding: 20
        }} onClick={() => setResetModal(false)}>
          <div style={{
            background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24,
            width: "100%", maxWidth: 480
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444", display: "grid", placeItems: "center",
              margin: "0 auto 16px"
            }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ marginTop: 0, textAlign: "center", color: "var(--text-primary, #172033)" }}>
              Xác nhận Reset Database
            </h3>
            <p style={{ color: "var(--text-muted, #64748b)", fontSize: 13, textAlign: "center" }}>
              Tất cả dữ liệu sẽ bị **xóa vĩnh viễn** và thay thế bằng dữ liệu mẫu.
              <br />
              <b style={{ color: "#ef4444" }}>Hành động này không thể hoàn tác!</b>
            </p>
            <div style={{
              background: "var(--bg-tertiary, #f5f7fb)",
              padding: 12, borderRadius: 8, marginBottom: 16,
              fontSize: 12, color: "var(--text-muted, #64748b)"
            }}>
              💡 File backup tự động sẽ được lưu trước khi reset.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setResetModal(false)} style={{
                flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 8, background: "var(--card-bg, #fff)",
                cursor: "pointer", color: "var(--text-primary, #172033)", fontWeight: 600
              }}>Hủy</button>
              <button onClick={handleReset} disabled={loading} style={{
                flex: 1, padding: 12, background: "#ef4444", color: "#fff",
                border: 0, borderRadius: 8, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1
              }}>
                {loading ? "Đang reset..." : "Reset ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ icon, title, desc, color, onClick, disabled, buttonText }) {
  return (
    <div style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #e7ebf0)",
      borderRadius: 12, padding: 20
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: color + "20", color,
        display: "grid", placeItems: "center", marginBottom: 14
      }}>
        {icon}
      </div>
      <h4 style={{ margin: "0 0 6px", color: "var(--text-primary, #172033)", fontSize: 15 }}>{title}</h4>
      <p style={{ margin: "0 0 14px", color: "var(--text-muted, #64748b)", fontSize: 12, lineHeight: 1.5 }}>
        {desc}
      </p>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: "100%", padding: 10,
          background: color, color: "#fff",
          border: 0, borderRadius: 8, fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1, fontSize: 13
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

function StatItem({ label, value, sub, color }) {
  return (
    <div style={{
      background: "var(--bg-tertiary, #f8fafc)",
      borderRadius: 10, padding: 12
    }}>
      <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>{label}</span>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--text-light, #8993a3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
