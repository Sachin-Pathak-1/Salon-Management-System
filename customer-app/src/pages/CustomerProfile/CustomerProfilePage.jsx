import { useEffect, useState } from "react";
import api from "../../api";

export function CustomerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contact: "",
    address: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/auth/customer/me");
        setProfile({
          name: res.data?.name || "",
          email: res.data?.email || "",
          contact: res.data?.contact || "",
          address: res.data?.address || ""
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put("/auth/customer/profile", {
        name: profile.name,
        contact: profile.contact,
        address: profile.address
      });

      const updatedUser = {
        ...(JSON.parse(localStorage.getItem("currentUser") || "{}")),
        name: res.data?.name || profile.name,
        contact: res.data?.contact || profile.contact,
        address: res.data?.address || profile.address,
        role: "customer"
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[var(--background)] px-4 py-8 text-[var(--text)]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-8 shadow-xl">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[var(--background)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Customer Profile</h1>
        <p className="mt-2 text-sm opacity-80">
          Keep your details updated for faster bookings.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="input-themed"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              name="email"
              value={profile.email}
              disabled
              className="input-themed opacity-80"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium">Contact</label>
            <input
              name="contact"
              value={profile.contact}
              onChange={handleChange}
              className="input-themed"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium">Address</label>
            <input
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="input-themed"
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
