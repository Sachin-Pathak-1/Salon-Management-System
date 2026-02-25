import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useToast } from "../../context/ToastContext";

const endpointByRole = (role) => {
  if (role === "customer") {
    return { get: "/auth/customer/me", update: "/auth/customer/profile" };
  }
  if (role === "admin") {
    return { get: "/adminProfile/profile", update: "/adminProfile/update" };
  }
  return { get: "/staffProfile/me", update: "/staffProfile/update" };
};

const SERVICE_OPTIONS = [
  "Haircut",
  "Hair Coloring",
  "Facial",
  "Manicure",
  "Pedicure",
  "Spa",
  "Waxing",
  "Makeup"
];

const VISIT_TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Weekend"];

const defaultForm = {
  name: "",
  contact: "",
  address: "",
  gender: "",
  dob: "",
  preferredServices: [],
  skinType: "",
  hairType: "",
  allergies: "",
  preferredVisitTime: "",
  communicationPreference: {
    email: true,
    sms: false,
    whatsapp: false
  },
  notes: ""
};

const Profile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = currentUser?.role || "staff";
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const endpoints = endpointByRole(role);

  const hydrateForm = (data) => {
    setForm({
      name: data?.name || "",
      contact: data?.contact || "",
      address: data?.address || "",
      gender: data?.gender || "",
      dob: data?.dob ? String(data.dob).slice(0, 10) : "",
      preferredServices: Array.isArray(data?.preferredServices) ? data.preferredServices : [],
      skinType: data?.skinType || "",
      hairType: data?.hairType || "",
      allergies: data?.allergies || "",
      preferredVisitTime: data?.preferredVisitTime || "",
      communicationPreference: {
        email: data?.communicationPreference?.email ?? true,
        sms: data?.communicationPreference?.sms ?? false,
        whatsapp: data?.communicationPreference?.whatsapp ?? false
      },
      notes: data?.notes || ""
    });
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.get);
      setProfile(res.data || null);
      hydrateForm(res.data || {});
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load profile", "error");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleService = (service) => {
    setForm((prev) => {
      const exists = prev.preferredServices.includes(service);
      return {
        ...prev,
        preferredServices: exists
          ? prev.preferredServices.filter((item) => item !== service)
          : [...prev.preferredServices, service]
      };
    });
  };

  const toggleCommunication = (channel) => {
    setForm((prev) => ({
      ...prev,
      communicationPreference: {
        ...prev.communicationPreference,
        [channel]: !prev.communicationPreference[channel]
      }
    }));
  };

  const handleCancel = () => {
    hydrateForm(profile || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      address: form.address.trim()
    };

    if (isCustomer) {
      payload.gender = form.gender;
      payload.dob = form.dob || null;
      payload.preferredServices = form.preferredServices;
      payload.skinType = form.skinType.trim();
      payload.hairType = form.hairType.trim();
      payload.allergies = form.allergies.trim();
      payload.preferredVisitTime = form.preferredVisitTime;
      payload.communicationPreference = form.communicationPreference;
      payload.notes = form.notes.trim();
    }

    if (!isAdmin && !isCustomer) {
      payload.gender = form.gender;
      payload.dob = form.dob;
    }

    setSaving(true);
    try {
      const res = await api.put(endpoints.update, payload);

      const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
      stored.name = payload.name;
      stored.contact = payload.contact;
      stored.address = payload.address;
      stored.gender = payload.gender || "";
      stored.dob = payload.dob || null;
      localStorage.setItem("currentUser", JSON.stringify(stored));

      showToast("Profile updated successfully");
      setIsEditing(false);
      setProfile(res.data || null);
      hydrateForm(res.data || {});
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text)]">
        <div className="h-12 w-12 rounded-full border-4 border-[var(--border-light)] border-t-[var(--primary)] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text)] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold">Profile not available</h2>
          <p className="mt-2 opacity-80">We could not load your profile details.</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-semibold text-white"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const initials = (profile.name || "U")
    .split(" ")
    .map((part) => part[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    })
    : "N/A";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <section className="relative overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--gray-100)] shadow-xl">
          <div className="h-40 bg-[radial-gradient(circle_at_10%_20%,var(--secondary),transparent_35%),radial-gradient(circle_at_80%_20%,var(--accent),transparent_30%),linear-gradient(120deg,var(--primary),var(--secondary))]" />
          <div className="px-6 pb-6 pt-0 md:px-8">
            <div className="-mt-16 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-28 w-28 place-content-center rounded-3xl border-4 border-[var(--gray-100)] bg-[var(--primary)] text-4xl font-black text-white shadow-lg">
                  {initials}
                </div>
                <div>
                  <h1 className="text-3xl font-black leading-tight tracking-tight">{profile.name}</h1>
                  <p className="text-sm opacity-85">{profile.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{role}</Badge>
                    <Badge>Member since {joined}</Badge>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-[var(--primary)] px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {isCustomer && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Preferred Services" value={String((profile.preferredServices || []).length)} subtitle="saved choices" />
            <MetricCard title="Communication" value={String(activeChannels(profile.communicationPreference))} subtitle="active channels" />
            <MetricCard title="Skin Type" value={profile.skinType || "Not set"} subtitle="beauty profile" />
            <MetricCard title="Hair Type" value={profile.hairType || "Not set"} subtitle="beauty profile" />
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-6 shadow-sm">
            <h2 className="text-xl font-bold">Personal Details</h2>
            <div className="mt-4 space-y-3">
              <Info label="Full Name" value={profile.name || "-"} />
              <Info label="Email" value={profile.email || "-"} />
              <Info label="Contact" value={profile.contact || "Not provided"} />
              <Info label="Address" value={profile.address || "Not provided"} />
              {isCustomer && (
                <>
                  <Info label="Gender" value={profile.gender || "Not provided"} />
                  <Info label="Date of Birth" value={profile.dob ? String(profile.dob).slice(0, 10) : "Not provided"} />
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-6 shadow-sm">
            <h2 className="text-xl font-bold">{isCustomer ? "Beauty Preferences" : "Account Summary"}</h2>
            <div className="mt-4 space-y-3 text-sm">
              {isCustomer ? (
                <>
                  <Info label="Skin Type" value={profile.skinType || "Not set"} />
                  <Info label="Hair Type" value={profile.hairType || "Not set"} />
                  <Info label="Preferred Time" value={profile.preferredVisitTime || "Not set"} />
                  <Info label="Allergies" value={profile.allergies || "None recorded"} />
                </>
              ) : (
                <>
                  <Info label="Role" value={role} />
                  <Info label="Member Since" value={joined} />
                  <Info label="Status" value="Active" />
                </>
              )}
            </div>
          </div>
        </section>

        {isCustomer && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-6 shadow-sm">
              <h2 className="text-xl font-bold">Selected Services</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(profile.preferredServices || []).length ? (
                  profile.preferredServices.map((service) => (
                    <span key={service} className="rounded-full border border-[var(--border-light)] bg-[var(--background)] px-3 py-1 text-sm font-medium">
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-sm opacity-75">No preferred services selected yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-6 shadow-sm">
              <h2 className="text-xl font-bold">Communication Settings</h2>
              <div className="mt-4 grid gap-3">
                <ChannelRow label="Email" enabled={Boolean(profile.communicationPreference?.email)} />
                <ChannelRow label="SMS" enabled={Boolean(profile.communicationPreference?.sms)} />
                <ChannelRow label="WhatsApp" enabled={Boolean(profile.communicationPreference?.whatsapp)} />
              </div>
            </div>
          </section>
        )}

        {isCustomer && (
          <section className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-6 shadow-sm">
            <h2 className="text-xl font-bold">Customer Notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm opacity-85">{profile.notes || "No notes added."}</p>
          </section>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4" onClick={handleCancel}>
          <div
            className="w-full max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold">Edit {isCustomer ? "Customer" : "Profile"} Details</h3>
            <p className="mt-1 text-sm opacity-75">Update your details for a better personalized experience.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="input-themed" />
              </Field>

              <Field label="Email">
                <input value={profile.email || ""} disabled className="input-themed opacity-70" />
              </Field>

              <Field label="Contact">
                <input value={form.contact} onChange={(e) => handleChange("contact", e.target.value)} className="input-themed" />
              </Field>

              {isCustomer && (
                <Field label="Preferred Visit Time">
                  <select value={form.preferredVisitTime} onChange={(e) => handleChange("preferredVisitTime", e.target.value)} className="input-themed">
                    <option value="">Select</option>
                    {VISIT_TIME_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </Field>
              )}

              {isCustomer && (
                <>
                  <Field label="Gender">
                    <select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} className="input-themed">
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>

                  <Field label="Date of Birth">
                    <input type="date" value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} className="input-themed" />
                  </Field>

                  <Field label="Skin Type">
                    <input value={form.skinType} onChange={(e) => handleChange("skinType", e.target.value)} className="input-themed" placeholder="Oily / Dry / Combination" />
                  </Field>

                  <Field label="Hair Type">
                    <input value={form.hairType} onChange={(e) => handleChange("hairType", e.target.value)} className="input-themed" placeholder="Curly / Straight / Wavy" />
                  </Field>
                </>
              )}

              <div className="md:col-span-2">
                <Field label="Address">
                  <textarea value={form.address} onChange={(e) => handleChange("address", e.target.value)} rows={2} className="input-themed resize-none" />
                </Field>
              </div>

              {isCustomer && (
                <div className="md:col-span-2">
                  <Field label="Allergies / Sensitivities">
                    <textarea value={form.allergies} onChange={(e) => handleChange("allergies", e.target.value)} rows={2} className="input-themed resize-none" placeholder="Mention products or ingredients to avoid" />
                  </Field>
                </div>
              )}

              {isCustomer && (
                <div className="md:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Preferred Services</span>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map((service) => {
                      const active = form.preferredServices.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                            active
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--border-light)] bg-[var(--background)]"
                          }`}
                        >
                          {service}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCustomer && (
                <div className="md:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Communication Preferences</span>
                  <div className="flex flex-wrap gap-4">
                    <Checkbox label="Email" checked={Boolean(form.communicationPreference.email)} onChange={() => toggleCommunication("email")} />
                    <Checkbox label="SMS" checked={Boolean(form.communicationPreference.sms)} onChange={() => toggleCommunication("sms")} />
                    <Checkbox label="WhatsApp" checked={Boolean(form.communicationPreference.whatsapp)} onChange={() => toggleCommunication("whatsapp")} />
                  </div>
                </div>
              )}

              {isCustomer && (
                <div className="md:col-span-2">
                  <Field label="Additional Notes">
                    <textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} className="input-themed resize-none" placeholder="Anything your stylist should know" />
                  </Field>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={handleCancel} className="rounded-lg border border-[var(--border-light)] px-4 py-2 font-medium">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-[var(--primary)] px-5 py-2 font-semibold text-white disabled:opacity-70">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium">{label}</span>
    {children}
  </label>
);

const Info = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg border border-[var(--border-light)] bg-[var(--background)] px-3 py-2">
    <span className="text-sm opacity-75">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

const MetricCard = ({ title, value, subtitle }) => (
  <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-5 shadow-sm">
    <p className="text-xs uppercase tracking-wide opacity-70">{title}</p>
    <p className="mt-1 text-2xl font-black">{value}</p>
    <p className="text-xs opacity-70">{subtitle}</p>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm font-medium">
    <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
    {label}
  </label>
);

const ChannelRow = ({ label, enabled }) => (
  <div className="flex items-center justify-between rounded-lg border border-[var(--border-light)] bg-[var(--background)] px-3 py-2">
    <span className="text-sm">{label}</span>
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
      {enabled ? "Enabled" : "Disabled"}
    </span>
  </div>
);

const Badge = ({ children }) => (
  <span className="rounded-full bg-[var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-wide">
    {children}
  </span>
);

const activeChannels = (pref = {}) =>
  [pref.email, pref.sms, pref.whatsapp].filter(Boolean).length || 0;

export default Profile;
