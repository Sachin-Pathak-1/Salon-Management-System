import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage({ setIsLoggedIn, setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email");
        setLoading(false);
        return;
      }

      const userData = {
        name: email.split("@")[0][0].toUpperCase() + email.split("@")[0].slice(1),
        email,
        avatar: "👤",
        joinDate: new Date().toLocaleDateString(),
        role: "User",
      };

      setCurrentUser(userData);
      setIsLoggedIn(true);
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  const handleDemoLogin = () => {
    setCurrentUser({
      name: "John Doe",
      email: "john@example.com",
      avatar: "😊",
      joinDate: "2024-01-15",
      role: "Premium User",
    });
    setIsLoggedIn(true);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="grid md:grid-cols-2 gap-14 max-w-5xl w-full items-center">
        
        {/* Left */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Welcome Back
          </h1>
          <p className="text-lg opacity-90">
            Sign in to your account to continue
          </p>
        </div>

        {/* Right */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-10 shadow-xl">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-1">Sign In</h2>
            <p className="text-sm opacity-70">
              Access your ServiceHub account
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-100 text-red-600 border-l-4 border-red-500 px-4 py-3 rounded-md font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-sm font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#forgot" className="text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 opacity-50 text-sm">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            OR
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full py-3 mb-5 rounded-lg font-bold border-2 border-gray-300 dark:border-gray-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
          >
            Try Demo Account
          </button>

          <p className="text-center text-sm opacity-70 mb-5">
            Don’t have an account?{" "}
            <a href="#signup" className="text-blue-500 font-bold">
              Sign up here
            </a>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex justify-center items-center gap-2 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:text-blue-500">
              🔵 Google
            </button>
            <button className="flex justify-center items-center gap-2 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:text-blue-500">
              ⚫ GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
