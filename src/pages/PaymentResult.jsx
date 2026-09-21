import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const status = params.get("status") || "success";
  const code = params.get("code") || "";
  const isSuccess = status === "success";

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "60px auto",
        background: "var(--card-bg, #fff)",
        borderRadius: 16,
        padding: 40,
        textAlign: "center",
        border: "1px solid var(--border-color, #e7ebf0)"
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          margin: "0 auto 20px",
          display: "grid",
          placeItems: "center",
          background: isSuccess ? "#d1fae5" : "#fee2e2",
          color: isSuccess ? "#18a967" : "#ef4444"
        }}
      >
        {isSuccess ? <CheckCircle2 size={44} /> : <XCircle size={44} />}
      </div>

      <h2 style={{ margin: "0 0 12px", color: "var(--text-primary, #172033)" }}>
        {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
      </h2>

      {code && (
        <p style={{ color: "var(--text-muted, #64748b)", marginBottom: 20 }}>
          Mã đơn: <b>{code}</b>
        </p>
      )}

      <p style={{ color: "var(--text-muted, #64748b)", marginBottom: 24 }}>
        {isSuccess
          ? "Cảm ơn bạn đã đặt hàng tại Canteen VWA."
          : "Vui lòng thử lại hoặc chọn phương thức thanh toán khác."}
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Link
          to="/customer/orders"
          style={{
            padding: "10px 20px",
            background: "#2634d5",
            color: "#fff",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 13
          }}
        >
          Xem đơn hàng
        </Link>
        <Link
          to="/customer"
          style={{
            padding: "10px 20px",
            background: "var(--card-bg, #fff)",
            color: "var(--text-primary, #172033)",
            border: "1px solid var(--border-color, #e5e9ef)",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 13
          }}
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}