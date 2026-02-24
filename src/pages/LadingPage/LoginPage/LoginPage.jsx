import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage({ setIsLoggedIn, setCurrentUser, setActiveSalon }) {

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
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

    if (!normalizedEmail || !otp) {
      return setError("All fields required");
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/customer/login", {
        email: normalizedEmail,
        otp: otp.trim()
      });

      const { token, user } = res.data;

      // ✅ Save ONE token only
      localStorage.setItem("token", token);

      // ✅ Save user directly (no extra API call)
      localStorage.setItem("currentUser", JSON.stringify(user));

      setCurrentUser(user);
      setIsLoggedIn(true);
      if (setActiveSalon) setActiveSalon("");
      localStorage.removeItem("activeSalon");
      navigate("/profile");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

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
        <p className="opacity-70 mb-6">Customer Login with OTP</p>

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

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-themed"
          />

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sendingOtp}
            className="w-full rounded-lg border border-[var(--border-light)] bg-[var(--background)] py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-70"
          >
            {sendingOtp ? "Sending OTP..." : "Send OTP to Email"}
          </button>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="OTP (6 digits)"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="input-themed"
          />

          <button
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold disabled:opacity-70"
            disabled={loading || !otpSent}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm opacity-70">
            Not signed up?{" "}
            <Link to="/signup" className="text-[var(--primary)] font-semibold">
              Create Customer Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
