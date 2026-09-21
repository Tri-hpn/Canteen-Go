import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { api } from "../api";
import { toast } from "./Effects";

function qrUrl(data, size = 240) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encodeURIComponent(data) + "&margin=10";
}

export default function QRCodeCard({ bankInfo, amount, orderCode }) {
  const { bank = "VCB", account = "1234567890", name = "CANTEEN VWA" } = bankInfo || {};
  const transferContent = ("CANTEEN " + orderCode).slice(0, 25);
  const vietQR = "https://img.vietqr.io/image/" + bank + "-" + account + "-compact2.png?amount=" + amount + "&addInfo=" + encodeURIComponent(transferContent) + "&accountName=" + encodeURIComponent(name);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast("Đã sao chép", "success");
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 420, margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.06)", textAlign: "center" }}>
      <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, display: "inline-block", marginBottom: 18 }}>
        <img
          src={vietQR}
          alt="VietQR"
          style={{ display: "block", width: 240, height: 240 }}
          onError={(e) => { e.target.src = qrUrl(vietQR); }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #eef2f7", fontSize: 13 }}>
          <span style={{ color: "#8993a3" }}>Ngân hàng</span>
          <b>{bank}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #eef2f7", fontSize: 13 }}>
          <span style={{ color: "#8993a3" }}>Số tài khoản</span>
          <b style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {account}
            <button onClick={() => copy(account)} style={{ background: "#f1f5f9", border: 0, padding: 4, borderRadius: 4, cursor: "pointer", color: "#64748b" }}>
              <Copy size={13} />
            </button>
          </b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #eef2f7", fontSize: 13 }}>
          <span style={{ color: "#8993a3" }}>Chủ tài khoản</span>
          <b>{name}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #eef2f7", fontSize: 13 }}>
          <span style={{ color: "#8993a3" }}>Số tiền</span>
          <b style={{ color: "#2634d5", fontSize: 16 }}>{Number(amount).toLocaleString("vi-VN")} ₫</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #eef2f7", fontSize: 13 }}>
          <span style={{ color: "#8993a3" }}>Nội dung</span>
          <b>{transferContent}</b>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#64748b", background: "#eef2ff", padding: "10px 14px", borderRadius: 8, margin: 0 }}>
        📱 Mở app ngân hàng/MoMo → Quét QR → Xác nhận chuyển khoản
      </p>
    </div>
  );
}
