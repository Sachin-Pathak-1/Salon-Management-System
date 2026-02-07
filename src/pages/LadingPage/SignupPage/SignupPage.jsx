import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export function SignupPage({ setIsLoggedIn, setCurrentUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      return setError("All fields are required");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
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

      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">

      <div className="w-full max-w-md bg-[var(--gray-100)]
                      border border-[var(--border-light)]
                      rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold mb-2">Admin Signup</h2>
        <p className="opacity-70 mb-6">
          Create an admin account to manage salons
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="input-themed"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="input-themed"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="input-themed"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="input-themed"
          />

          <button
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>

          <p className="text-center text-sm opacity-70">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--primary)] font-semibold">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
