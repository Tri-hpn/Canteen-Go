import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, LockKeyhole, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "../components/Effects";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mô phỏng gửi OTP
    setTimeout(() => {
      setLoading(false);
      toast("Mã OTP đã gửi tới email (demo: 123456)", "success");
      setOtp("123456");
      setStep(2);
    }, 1000);
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (otp !== "123456") {
      toast("Mã OTP không đúng (demo: 123456)", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("Mật khẩu phải từ 6 ký tự", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast("Đặt lại mật khẩu thành công!", "success");
      setStep(3);
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-mark large">C</div>
          <div><b>CANTEEN</b><span>VWA</span></div>
        </div>
        <div className="login-hero">
          <div className="hero-pill">KHÔI PHỤC MẬT KHẨU</div>
          <h1>Quên mật khẩu?<br /><span>Đừng lo.</span></h1>
          <p>Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu.</p>
        </div>
      </div>

      <div className="login-card-wrap">
        <div className="login-card">
          <div className="login-icon">
            {step === 3 ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h2>
            {step === 1 ? "Quên mật khẩu" : step === 2 ? "Đặt lại mật khẩu" : "Hoàn tất!"}
          </h2>
          <p>
            {step === 1 ? "Nhập email để nhận mã OTP" :
             step === 2 ? "Nhập OTP và mật khẩu mới" :
             "Mật khẩu đã được đặt lại thành công"}
          </p>

          {step === 1 && (
            <form onSubmit={sendOTP}>
              <label>Email</label>
              <div className="input-icon">
                <Mail size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@vwa.vn" />
              </div>
              <button className="primary-btn full" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi mã OTP"} <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword}>
              <label>Mã OTP (demo: 123456)</label>
              <input
                className="otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{ width: "100%", padding: 16, fontSize: 24, letterSpacing: 8, textAlign: "center", border: "2px dashed #2634d5", borderRadius: 12, marginBottom: 14, outline: "none" }}
              />
              <label>Mật khẩu mới</label>
              <div className="input-icon">
                <LockKeyhole size={18} />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Tối thiểu 6 ký tự" />
              </div>
              <button className="primary-btn full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#18a967", marginBottom: 20 }}>Bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <Link to="/" className="primary-btn full" style={{ display: "inline-flex", justifyContent: "center", textDecoration: "none" }}>
                Về trang đăng nhập
              </Link>
            </div>
          )}

          {step !== 3 && (
            <p className="auth-switch"><Link to="/">← Về trang đăng nhập</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}
