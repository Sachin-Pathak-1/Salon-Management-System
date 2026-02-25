import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

export function CustomerLoginPage({
  setIsLoggedIn,
  setCurrentUser,
  setActiveSalon
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !otp) {
      setError("Email and OTP are required");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/customer/login", {
        email: normalizedEmail,
        otp: otp.trim()
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.removeItem("activeSalon");

      setIsLoggedIn(true);
      setCurrentUser(user);
      if (setActiveSalon) setActiveSalon("");

      const redirectTo = location.state?.redirectTo;
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate("/customer/profile");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Customer login failed");
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
      const res = await api.post("/auth/customer/send-otp", {
        email: normalizedEmail,
        purpose: "login"
      });
      const devOtp = res?.data?.devOtp;
      setOtpSent(true);
      setInfo(
        devOtp
          ? `${res?.data?.message || "OTP generated"} (DEV OTP: ${devOtp})`
          : (res?.data?.message || "OTP sent successfully")
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-stretch px-4 py-6 md:grid-cols-2 md:gap-6 md:px-8">
        <div className="relative hidden overflow-hidden rounded-3xl border border-[var(--border-light)] md:block">
          <img
            src="/image.png"
            alt="Salon interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Welcome Back
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-white">
              Your Beauty Journey, Styled Around You.
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-8 shadow-xl">
            <h2 className="text-3xl font-bold">Customer Login</h2>
            <p className="mt-2 text-sm opacity-80">
              Sign in with OTP to manage your profile and bookings.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="mt-4 rounded-lg border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-700">
                {info}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                }}
                className="input-themed"
              />
              <input
                type="button"
                value={sendingOtp ? "Sending OTP..." : "Send OTP to Email"}
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full rounded-lg border border-[var(--border-light)] bg-[var(--background)] py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-70"
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="OTP (6 digits)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-themed"
              />
              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full rounded-lg bg-[var(--primary)] py-3 font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm opacity-80">
              New customer?{" "}
              <Link to="/signup" className="font-semibold text-[var(--primary)]">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
