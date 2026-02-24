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
<<<<<<< HEAD
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email: normalizedEmail, password }
      );
=======
      const res = await axios.post("http://localhost:5000/api/auth/customer/login", {
        email: normalizedEmail,
        otp: otp.trim()
      });
>>>>>>> a0a3800945a13170daa2785e86c7a76050b2c68a

      const { token, user } = res.data;

      // ✅ Save ONE token only
      localStorage.setItem("token", token);

      // ✅ Save user directly (no extra API call)
      localStorage.setItem("currentUser", JSON.stringify(user));

<<<<<<< HEAD
      // Clear any previously selected salon to avoid leaking another user's salon
      localStorage.removeItem("activeSalon");

      if (typeof setCurrentUser === "function") setCurrentUser(user);
      if (typeof setIsLoggedIn === "function") setIsLoggedIn(true);

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
      if (user.role === "admin") {
        navigate("/dashboard");
      } else if (user.role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/staff-dashboard");
      }
=======
      setCurrentUser(user);
      setIsLoggedIn(true);
      if (setActiveSalon) setActiveSalon("");
      localStorage.removeItem("activeSalon");
      navigate("/profile");
>>>>>>> a0a3800945a13170daa2785e86c7a76050b2c68a

    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      if (backendMessage) {
        setError(backendMessage);
      } else if (err?.request) {
        setError("Cannot reach server. Start backend on http://localhost:5000.");
      } else {
        setError(err?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
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
