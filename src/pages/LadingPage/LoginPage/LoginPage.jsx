import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function LoginPage({ setIsLoggedIn, setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ REAL LOGIN (backend connected)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ LOGIN
      const loginRes = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const token = loginRes.data.token;

      // 2️⃣ SAVE TOKEN
      localStorage.setItem("token", token);

      // 3️⃣ FETCH PROFILE
      const profileRes = await axios.get(
        "http://localhost:5000/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = profileRes.data;

      // 4️⃣ STORE USER
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // ✅ ROLE BASED REDIRECT
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/staff-dashboard");
      }

    } catch (err) {
      console.log(err.response);
      setError(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center px-6 w-[35%] m-auto">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="hidden md:block">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-[var(--text)]">
            Welcome Back
          </h1>
          <p className="mt-4 text-lg text-[var(--gray-700)]">
            Sign in to your account to continue
          </p>
        </div>

        <div className="w-full">
          <div className="bg-[var(--gray-100)] border border-[var(--border-light)] rounded-2xl shadow-xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[var(--text)]">Sign In</h2>
              <p className="text-sm text-[var(--gray-700)] mt-2">Access your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-[color:var(--danger)]/15 text-[var(--danger)] border border-[color:var(--danger)]/30">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--text)]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  placeholder="your@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--gray-700)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-70"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--text)]">Password</label>
                <input
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--gray-700)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-70"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-white bg-[var(--primary)] hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-[var(--gray-700)] mt-6">
                don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[var(--primary)] hover:underline font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
