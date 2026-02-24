import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

export function CustomerSignupPage({
  setIsLoggedIn,
  setCurrentUser,
  setActiveSalon
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      contact: formData.contact.trim(),
      address: formData.address.trim()
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError("Name, email and password are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/customer/signup", payload);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.removeItem("activeSalon");

      setIsLoggedIn(true);
      setCurrentUser(user);
      if (setActiveSalon) setActiveSalon("");

      navigate("/customer/profile");
    } catch (err) {
      setError(err?.response?.data?.message || "Customer registration failed");
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
            alt="Salon products and tools"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Join Us
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-white">
              Create Your Customer Account in One Step.
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-8 shadow-xl">
            <h2 className="text-3xl font-bold">Customer Register</h2>
            <p className="mt-2 text-sm opacity-80">
              Register to save preferences and manage your account.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="input-themed"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="input-themed"
              />
              <input
                name="contact"
                placeholder="Phone (optional)"
                value={formData.contact}
                onChange={handleChange}
                className="input-themed"
              />
              <input
                name="address"
                placeholder="Address (optional)"
                value={formData.address}
                onChange={handleChange}
                className="input-themed"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input-themed"
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-themed"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--primary)] py-3 font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm opacity-80">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[var(--primary)]">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
