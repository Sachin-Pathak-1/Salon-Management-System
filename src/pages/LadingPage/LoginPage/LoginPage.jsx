import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage({ setIsLoggedIn, setCurrentUser }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(localStorage.getItem("userRole") || "admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("All fields required");
    }

    setLoading(true);

    try {

      const url =
        role === "admin"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/staffAuth/login";

      const res = await axios.post(url, { email, password });

      const { token, user } = res.data;

      // ✅ Save ONE token only
      localStorage.setItem("token", token);

      // ✅ Save user directly (no extra API call)
      localStorage.setItem("currentUser", JSON.stringify(user));

      setCurrentUser(user);
      setIsLoggedIn(true);

      // Redirect based on role
      if (user.role === "admin") {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div className="w-full max-w-md bg-[var(--gray-100)]
                      border border-[var(--border-light)]
                      rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold mb-2">Sign In</h2>
        <p className="opacity-70 mb-6">Admin & Staff Login</p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-600">
            {error}
          </div>
        )}

        {/* ROLE SWITCH */}
        <div className="flex gap-3 mb-5">
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

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-themed"
          />

          <button
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {role === "admin" && (
            <p className="text-center text-sm opacity-70">
              Not signed up?{" "}
              <Link to="/signup" className="text-[var(--primary)] font-semibold">
                Create Admin Account
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
