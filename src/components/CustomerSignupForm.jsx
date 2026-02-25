import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export function CustomerSignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
    confirmOtp: "",
    contact: "",
    address: "",
    gender: "",
    dob: "",
    preferredVisitTime: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      otp: formData.otp.trim(),
      contact: formData.contact.trim(),
      address: formData.address.trim(),
      gender: formData.gender,
      dob: formData.dob || null,
      preferredVisitTime: formData.preferredVisitTime
    };

    if (!payload.name || !payload.email || !payload.otp) {
      setError("Name, email and OTP are required");
      return;
    }

    if (!/^\d{6}$/.test(payload.otp)) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    if (formData.otp !== formData.confirmOtp) {
      setError("OTP values do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/customer/signup", payload);
      setSuccess("Customer account created successfully. Please login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err?.response?.data?.message || "Customer registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Enter email first to receive OTP");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post("/auth/customer/send-otp", {
        email: normalizedEmail,
        purpose: "signup"
      });
      const devOtp = res?.data?.devOtp;
      setOtpSent(true);
      setSuccess(
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
    <div className="w-full max-w-md bg-[var(--gray-100)] border border-[var(--border-light)] rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold mb-2">Customer Signup</h2>
      <p className="opacity-70 mb-6">Create your customer account and set your login OTP</p>

      {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 rounded bg-green-100 text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          onChange={(e) => {
            handleChange(e);
            setOtpSent(false);
          }}
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
          name="contact"
          placeholder="Phone (optional)"
          value={formData.contact}
          onChange={handleChange}
          className="input-themed"
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="input-themed"
        >
          <option value="">Gender (optional)</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          className="input-themed"
        />
        <select
          name="preferredVisitTime"
          value={formData.preferredVisitTime}
          onChange={handleChange}
          className="input-themed"
        >
          <option value="">Preferred visit time (optional)</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
          <option value="Weekend">Weekend</option>
        </select>
        <input
          name="address"
          placeholder="Address (optional)"
          value={formData.address}
          onChange={handleChange}
          className="input-themed"
        />
        <input
          name="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="OTP (6 digits)"
          value={formData.otp}
          onChange={handleChange}
          className="input-themed"
        />
        <input
          name="confirmOtp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Confirm OTP"
          value={formData.confirmOtp}
          onChange={handleChange}
          className="input-themed"
        />

        <button
          type="submit"
          disabled={loading || !otpSent}
          className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Customer Account"}
        </button>

        <p className="text-center text-sm opacity-70">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--primary)] font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
