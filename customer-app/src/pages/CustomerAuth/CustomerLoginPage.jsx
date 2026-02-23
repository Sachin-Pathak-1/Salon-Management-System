import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

export function CustomerLoginPage({
  setIsLoggedIn,
  setCurrentUser,
  setActiveSalon
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/customer/login", {
        email: normalizedEmail,
        password
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.removeItem("activeSalon");

      setIsLoggedIn(true);
      setCurrentUser(user);
      if (setActiveSalon) setActiveSalon("");

      navigate("/customer/profile");
    } catch (err) {
      setError(err?.response?.data?.message || "Customer login failed");
    } finally {
      setLoading(false);
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
              Sign in to manage your profile and bookings.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-themed"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-themed"
              />
              <button
                type="submit"
                disabled={loading}
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
