import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage({ setIsLoggedIn, setCurrentUser, setActiveSalon }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState(localStorage.getItem("userRole") || "customer");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || (role === "customer" ? !otp : !password)) {
      return setError("All fields required");
    }

    setLoading(true);

    try {

      const endpoint =
        role === "customer"
          ? "http://localhost:5000/api/auth/customer/login"
          : "http://localhost:5000/api/auth/login";

      const payload =
        role === "customer"
          ? { email: normalizedEmail, otp: otp.trim() }
          : { email: normalizedEmail, password };

      const res = await axios.post(endpoint, payload);

      const { token, user } = res.data;

      // ✅ Save ONE token only
      localStorage.setItem("token", token);

      // ✅ Save user directly (no extra API call)
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Clear any previously selected salon to avoid leaking another user's salon
      localStorage.removeItem("activeSalon");

      setCurrentUser(user);
      setIsLoggedIn(true);

      // Keep branch/salon context aligned with the logged-in account.
      if (user.role === "manager" || user.role === "staff") {
        if (user.salonId) {
          if (setActiveSalon) setActiveSalon(user.salonId);
          localStorage.setItem("activeSalon", user.salonId);
        } else {
          if (setActiveSalon) setActiveSalon("");
          localStorage.removeItem("activeSalon");
        }
      } else {
        if (setActiveSalon) setActiveSalon("");
        localStorage.removeItem("activeSalon");
      }

      // Redirect based on role
      if (user.role === "customer") {
        navigate("/profile");
      } else if (user.role === "admin") {
        navigate("/dashboard");
      } else if (user.role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/staff-dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  useEffect(() => {
    localStorage.setItem("userRole", role);
  }, [role]);

  useEffect(() => {
    setOtp("");
    setOtpSent(false);
    setError("");
    setInfo("");
  }, [role]);

  const handleSendOtp = async () => {
    setError("");
    setInfo("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Enter email first to receive OTP");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/customer/send-otp", {
        email: normalizedEmail,
        purpose: "login"
      });
      setOtpSent(true);
      setInfo(res?.data?.message || "OTP sent successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div className="w-full max-w-md bg-[var(--gray-100)]
                      border border-[var(--border-light)]
                      rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold mb-2">Sign In</h2>
        <p className="opacity-70 mb-6">Customer, Admin & Staff Login</p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-600">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
            {info}
          </div>
        )}

        {/* ROLE SWITCH */}
        <div className="flex gap-3 mb-5">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex-1 py-2 rounded-lg font-semibold transition
              ${role === "customer"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--gray-200)]"}`}
          >
            Customer
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 rounded-lg font-semibold transition
              ${role === "admin"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--gray-200)]"}`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => setRole("staff")}
            className={`flex-1 py-2 rounded-lg font-semibold transition
              ${role === "staff"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--gray-200)]"}`}
          >
            Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-themed"
          />

          {role === "customer" && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="w-full rounded-lg border border-[var(--border-light)] bg-[var(--background)] py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-70"
            >
              {sendingOtp ? "Sending OTP..." : "Send OTP to Email"}
            </button>
          )}

          <input
            type={role === "customer" ? "text" : "password"}
            inputMode={role === "customer" ? "numeric" : undefined}
            maxLength={role === "customer" ? 6 : undefined}
            placeholder={role === "customer" ? "OTP (6 digits)" : "Password"}
            value={role === "customer" ? otp : password}
            onChange={e => role === "customer" ? setOtp(e.target.value) : setPassword(e.target.value)}
            className="input-themed"
          />

          <button
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold disabled:opacity-70"
            disabled={loading || (role === "customer" && !otpSent)}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {role === "customer" && (
            <p className="text-center text-sm opacity-70">
              Not signed up?{" "}
              <Link to="/signup" className="text-[var(--primary)] font-semibold">
                Create Customer Account
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
