import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api, setToken } from "../api";
import { toast } from "../components/Effects";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) return setError("Mật khẩu xác nhận không khớp");
    if (form.password.length < 6) return setError("Mật khẩu phải từ 6 ký tự");
    if (!form.email.includes("@")) return setError("Email không hợp lệ");

    setLoading(true);
    try {
      // Đăng ký trực tiếp (không OTP)
      const { token, user } = await api.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      });
      setToken(token);
      toast("Đăng ký thành công! Chào mừng " + user.name, "success");
      navigate("/customer");
    } catch (e) {
      setError(e.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-mark large">C</div>
          <div><b>CANTEEN</b><span>VWA</span></div>
        </div>
        <div className="login-hero">
          <div className="hero-pill">ĐĂNG KÝ • KHÁCH HÀNG</div>
          <h1>Tạo tài khoản<br /><span>chỉ trong 30 giây.</span></h1>
          <p>Đăng ký để đặt món, theo dõi đơn hàng và nhận ưu đãi dành riêng cho sinh viên VWA.</p>
          <div className="hero-stats">
            <div><b>10%</b><small>Ưu đãi sinh viên</small></div>
            <div><b>⚡</b><small>Đặt món nhanh</small></div>
            <div><b>📱</b><small>Dùng như app</small></div>
          </div>
        </div>
      </div>

      <div className="login-card-wrap">
        <form className="login-card" onSubmit={submit}>
          <div className="login-icon"><User size={24} /></div>
          <h2>Đăng ký</h2>
          <p>Tạo tài khoản khách hàng mới</p>

          {error && <div className="error-box">{error}</div>}

          <label>Họ và tên *</label>
          <div className="input-icon">
            <User size={18} />
            <input value={form.name} onChange={update("name")} placeholder="Nguyễn Văn A" required />
          </div>

          <label>Email *</label>
          <div className="input-icon">
            <Mail size={18} />
            <input type="email" value={form.email} onChange={update("email")} placeholder="email@vwa.vn" required />
          </div>

          <label>Số điện thoại</label>
          <div className="input-icon">
            <Phone size={18} />
            <input value={form.phone} onChange={update("phone")} placeholder="0901234567" />
          </div>

          <label>Mật khẩu *</label>
          <div className="input-icon">
            <LockKeyhole size={18} />
            <input type={show ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Tối thiểu 6 ký tự" required />
            <button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>

          <label>Xác nhận mật khẩu *</label>
          <div className="input-icon">
            <LockKeyhole size={18} />
            <input type={show ? "text" : "password"} value={form.confirm} onChange={update("confirm")} placeholder="Nhập lại mật khẩu" required />
          </div>

          <button className="primary-btn full" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Tạo tài khoản"} <ArrowRight size={18} />
          </button>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
