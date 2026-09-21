import { useEffect, useState } from "react";
import { Gift, History } from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";
import { useTranslation } from "../../i18n";

export default function CustomerPoints() {
  const { t } = useTranslation();
  const [data, setData] = useState({ points: 0, history: [] });
  const [redeemPoints, setRedeemPoints] = useState(100);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.points.me().then(setData).catch(() => setData({ points: 0, history: [] }));
  };
  useEffect(() => { load(); }, []);

  // Danh dau da xem -> xoa badge sidebar
  useEffect(() => {
    localStorage.setItem("points_last_seen", Date.now().toString());
    window.dispatchEvent(new CustomEvent("points-seen"));
  }, []);

  const redeem = async () => {
    if (redeemPoints < 100) return toast(t("points.needMin"), "error");
    if (redeemPoints > (data.points || 0)) return toast(t("points.noEnough"), "error");
    setLoading(true);
    try {
      const voucher = await api.points.redeem({ points: redeemPoints });
      toast(t("points.success") + "! " + voucher.code + " (" + money(voucher.value) + ")", "success");
      setRedeemPoints(100);
      load();
      window.dispatchEvent(new CustomEvent("refresh-user"));
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  };

  const value = redeemPoints * 100;
  const points = data.points || 0;

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg,#2634d5,#20c779)", color: "#fff",
        borderRadius: 16, padding: 30, marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 20
      }}>
        <div>
          <span style={{ fontSize: 13, opacity: 0.9, color: "#fff" }}>{t("points.yourPoints")}</span>
          <h1 style={{ fontSize: 48, margin: "10px 0", fontWeight: 800, color: "#fff" }}>{points}</h1>
          <p style={{ margin: 0, opacity: 0.9, color: "#fff" }}>{t("points.rate")}</p>
        </div>
        <div style={{ fontSize: 80 }}>🏆</div>
      </div>

      <div style={{
        background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20, marginBottom: 20
      }}>
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary, #172033)" }}>
          <Gift size={20} /> {t("points.redeem")}
        </h3>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: 13 }}>{t("points.needMin")}</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          {[100, 200, 500, 1000].map((p) => (
            <button key={p} onClick={() => setRedeemPoints(p)} disabled={points < p} style={{
              padding: "10px 16px",
              background: redeemPoints === p ? "#2634d5" : "var(--card-bg, #fff)",
              color: redeemPoints === p ? "#fff" : "var(--text-primary, #475569)",
              border: redeemPoints === p ? "1px solid #2634d5" : "1px solid var(--border-color, #e5e9ef)",
              borderRadius: 8, cursor: points < p ? "not-allowed" : "pointer",
              fontWeight: 600, fontSize: 13, opacity: points < p ? 0.4 : 1
            }}>{p} {t("points.title").toLowerCase()}</button>
          ))}
        </div>

        <div style={{
          background: "var(--bg-tertiary, #f8fafc)", padding: 16, borderRadius: 10,
          marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ color: "var(--text-muted, #64748b)" }}>{t("points.voucherValue")}:</span>
          <b style={{ color: "#18a967", fontSize: 20 }}>{money(value)}</b>
        </div>

        <button onClick={redeem} disabled={loading || points < redeemPoints} style={{
          width: "100%", padding: 14,
          background: points < redeemPoints ? "#94a3b8" : "#2634d5",
          color: "#fff", border: 0, borderRadius: 10, fontWeight: 600, fontSize: 14,
          cursor: (loading || points < redeemPoints) ? "not-allowed" : "pointer"
        }}>
          {loading ? t("common.loading") : t("points.redeemNow") + " " + redeemPoints}
        </button>
      </div>

      <div style={{
        background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20
      }}>
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary, #172033)" }}>
          <History size={20} /> {t("points.history")}
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("orders.code")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("common.date")}</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("cart.total")}</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>{t("points.title")}</th>
            </tr>
          </thead>
          <tbody>
            {(data.history || []).map((h, i) => {
              const isRedeem = h.type === "redeem";
              return (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                  <td style={{ padding: 11, color: "var(--text-primary, #172033)" }}>
                    <b>{h.code}</b>
                    {isRedeem && (
                      <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>
                        Đổi voucher
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 11, fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                    {h.date ? new Date(h.date).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td style={{ padding: 11, color: "var(--text-muted, #64748b)" }}>
                    {isRedeem ? <span style={{ fontSize: 11, color: "#92400e" }}>Voucher {money(h.total)}</span> : money(h.total)}
                  </td>
                  <td style={{ padding: 11, textAlign: "right" }}>
                    <b style={{ color: isRedeem ? "#ef4444" : "#18a967", fontWeight: 800 }}>
                      {h.points > 0 ? "+" : ""}{h.points}
                    </b>
                  </td>
                </tr>
              );
            })}
            {!(data.history || []).length && (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>{t("points.noHistory")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
