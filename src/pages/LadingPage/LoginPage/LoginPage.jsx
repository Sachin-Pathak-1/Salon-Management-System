import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage({ setIsLoggedIn, setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const token = res.data.token;

      // ✅ SAVE TOKEN
      localStorage.setItem("token", token);

      // ✅ FETCH PROFILE
      const profileRes = await axios.get(
        "http://localhost:5000/api/user/profile",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const user = profileRes.data;

      // ✅ SAVE USER (THIS WAS MISSING)
      localStorage.setItem("currentUser", JSON.stringify(user));

      // ✅ UPDATE STATE
      setCurrentUser(user);
      setIsLoggedIn(true);

      // ✅ ROLE-BASED REDIRECT
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/staff-dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

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

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
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
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-sm opacity-70">
            Not signed up?{" "}
            <Link to="/signup" className="text-[var(--primary)] font-semibold">
              Create Admin Account
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
