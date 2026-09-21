import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { useTranslation } from "../i18n";

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const result = await onLogin(email, password);
    if (!result) setError("Tài khoản hoặc mật khẩu không đúng.");
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-mark large">C</div>
          <div><b>CANTEEN</b><span>VWA</span></div>
        </div>
        <div className="login-hero">
          <div className="hero-pill">CANTEEN VWA • SMART MANAGEMENT</div>
          <h1>Quản lý Canteen<br /><span>đơn giản & hiệu quả.</span></h1>
          <p>{t("login.description")}</p>
          <div className="hero-stats">
            <div><b>3</b><small>{t("login.users")}</small></div>
            <div><b>15+</b><small>{t("login.dishes")}</small></div>
            <div><b>24/7</b><small>{t("login.tracking")}</small></div>
          </div>
        </div>
      </div>
      <div className="login-card-wrap">
        <form className="login-card" onSubmit={submit}>
          <div className="login-icon"><LockKeyhole size={24} /></div>
          <h2>{t("login.title")}</h2>
          <p>{t("login.subtitle")}</p>
          {error && <div className="error-box">{error}</div>}
          <label>{t("login.email")}</label>
          <div className="input-icon">
            <Mail size={18} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />
          </div>
          <label>{t("login.password")}</label>
          <div className="input-icon">
            <LockKeyhole size={18} />
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" />
            <button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <div className="login-options">
            <label className="check"><input type="checkbox" /> {t("login.remember")}</label>
            <Link to="/forgot-password" className="link">{t("login.forgot")}</Link>
          </div>
          <button className="primary-btn full">{t("common.login")} <ArrowRight size={18} /></button>
          <p className="auth-switch">{t("login.noAccount")} <Link to="/register">{t("login.registerNow")}</Link></p>
          <div className="demo-box">
            <b>{t("login.demoAccounts")}</b>
            <span>Admin: admin@vwa.vn / 123456</span>
            <span>Nhân viên: nhanvien@vwa.vn / 123456</span>
            <span>Khách hàng: sinhvien@vwa.vn / 123456</span>
          </div>
        </form>
      </div>
    </div>
  );
}
