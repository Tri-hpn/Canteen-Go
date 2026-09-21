import { useEffect, useState } from "react";
import { Printer, Eye } from "lucide-react";
import { api } from "../../api";
import { money, StatusBadge } from "../../components/UI";
import { toast } from "../../components/Effects";
import PrintReceipt from "../../components/PrintReceipt";
import StaffOrderDetailModal from "../../components/StaffOrderDetailModal";
import { useTranslation } from "../../i18n";

const STATUSES = ["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đang chuẩn bị", "Sẵn sàng nhận", "Hoàn thành", "Đã hủy"];

const NEXT = {
  "Chờ xác nhận": "Đã xác nhận",
  "Đã xác nhận": "Đang chuẩn bị",
  "Đang chuẩn bị": "Sẵn sàng nhận",
  "Sẵn sàng nhận": "Hoàn thành"
};

const NEXT_LABEL = {
  "Chờ xác nhận": "employee.confirm",
  "Đã xác nhận": "employee.startPrep",
  "Đang chuẩn bị": "employee.readyForPickup",
  "Sẵn sàng nhận": "employee.markDone"
};

export default function EmployeeOrders() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("Tất cả");
  const [orders, setOrders] = useState([]);
  const [printOrder, setPrintOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);

  const load = () => api.orders.all(status).then((data) => {
    const sorted = [...(data || [])].sort((a, b) => {
      const da = new Date(b.created_at || 0).getTime();
      const db2 = new Date(a.created_at || 0).getTime();
      return da - db2;
    });
    setOrders(sorted);
  }).catch(() => {});
  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [status]);

  const advance = async (o) => {
    const next = NEXT[o.status];
    if (!next) return;
    try {
      await api.orders.setStatus(o._id || o.id, next);
      toast(`"${o.code}" → "${next}"`, "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const cancel = async (o) => {
    if (!confirm(`Hủy đơn ${o.code}?`)) return;
    try {
      await api.orders.setStatus(o._id || o.id, "Đã hủy");
      toast(t("orders.cancelled"), "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} style={{
            padding: "8px 16px",
            border: status === s ? "1px solid #2634d5" : "1px solid var(--border-color, #e5e9ef)",
            background: status === s ? "#2634d5" : "var(--card-bg, #fff)",
            color: status === s ? "#fff" : "var(--text-muted, #475569)",
            borderRadius: 20, fontSize: 12, cursor: "pointer",
            fontWeight: status === s ? 600 : 400
          }}>{s}</button>
        ))}
      </div>

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("orders.code")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Customer</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("common.time")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("cart.total")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("common.status")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("common.action")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id || o.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                <td style={{ padding: 11, color: "var(--text-primary, #172033)" }}><b>{o.code}</b></td>
                <td style={{ padding: 11, color: "var(--text-muted, #64748b)" }}>{o.customer_name}</td>
                <td style={{ padding: 11, fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                  {o.created_at ? new Date(o.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
                <td style={{ padding: 11, color: "var(--text-primary, #172033)" }}><b>{money(o.total)}</b></td>
                <td style={{ padding: 11 }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: 11 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {NEXT[o.status] && (
                      <button onClick={() => advance(o)} style={{
                        padding: "6px 12px", background: "#2634d5", color: "#fff",
                        border: 0, borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600
                      }}>→ {t(NEXT_LABEL[o.status])}</button>
                    )}
                    <button onClick={() => setDetailOrder(o)} title="Chi tiết" style={{
                      padding: "6px 12px", background: "var(--bg-tertiary, #f5f7fb)",
                      border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6,
                      cursor: "pointer", fontSize: 12, display: "inline-flex", alignItems: "center",
                      gap: 4, color: "var(--text-primary, #172033)"
                    }}>
                      <Eye size={13} /> Chi tiết
                    </button>
                    <button onClick={() => setPrintOrder(o)} title="In hóa đơn" style={{
                      padding: "6px 12px", background: "var(--bg-tertiary, #f5f7fb)",
                      border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6,
                      cursor: "pointer", fontSize: 12, display: "inline-flex", alignItems: "center",
                      gap: 4, color: "var(--text-primary, #172033)"
                    }}>
                      <Printer size={13} />
                    </button>
                    {o.status !== "Hoàn thành" && o.status !== "Đã hủy" && (
                      <button onClick={() => cancel(o)} style={{
                        padding: "6px 12px", background: "var(--card-bg, #fff)", color: "#ef4444",
                        border: "1px solid #ef4444", borderRadius: 6, cursor: "pointer", fontSize: 12
                      }}>Hủy</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>{t("orders.noOrders")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {printOrder && <PrintReceipt order={printOrder} onClose={() => setPrintOrder(null)} />}
      {detailOrder && <StaffOrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
    </div>
  );
}
