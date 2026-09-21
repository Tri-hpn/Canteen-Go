import { useLocation, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { money } from "../../components/UI";

export default function CustomerSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="success-state">
      <div className="success-icon"><CheckCircle2 size={55} /></div>
      <h2>Đặt hàng thành công!</h2>
      <p>Đơn hàng <b>{order?.code || "VWA-XXXX"}</b> đã được ghi nhận.</p>
      <div className="success-box">
        <span>Tổng tiền</span>
        <strong>{money(order?.total || 0)}</strong>
      </div>
      <Link className="primary-btn" to="/customer/orders">Theo dõi đơn hàng</Link>
    </div>
  );
}