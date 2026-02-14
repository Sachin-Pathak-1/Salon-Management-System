import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import api from "../api";

/* ======================================================
   SETTINGS PAGE
====================================================== */

export function Settings() {

  /* ================= THEME ================= */

  const [currentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );

  const isAdmin = currentUser?.role === "admin";

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );



  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(t => (t === "light" ? "dark" : "light"));

  /* ================= TOAST ================= */

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ================= STATE ================= */

  const emptyForm = {
    name: "",
    ownerName: "",
    contact: "",
    email: "",
    openingTime: "",
    closingTime: "",
    address: "",
    holidays: "",
    logo: "",
    status: "open",
    isPrimary: false
  };

  const [salons, setSalons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [planInfo, setPlanInfo] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", contact: "" });

  const [dragIndex, setDragIndex] = useState(null);

  /* ================= LOAD SALONS ================= */

  const fetchSalons = async () => {
    try {
      const res = await api.get("/salons/get");
      let list = res.data || [];

      // ensure primary salon always first
      list.sort((a, b) => b.isPrimary - a.isPrimary || a.order - b.order);

      setSalons(list);
    } catch (err) {
      console.error("Failed to fetch salons:", err);
      setSalons([]);
    }
  };

  const fetchPlanInfo = async () => {
    try {
      const res = await api.get("/plans/selection");
      setPlanInfo(res.data || null);
    } catch (err) {
      console.error("Failed to fetch plan info:", err);
      setPlanInfo(null);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const endpoint = isAdmin ? "/adminProfile/profile" : "/staffProfile/me";
      const res = await api.get(endpoint);
      const data = res.data;
      setUserProfile(data);
      setProfileForm({
        name: data.name || "",
        contact: data.contact || ""
      });
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  useEffect(() => {
    fetchSalons();
    fetchUserProfile();
    if (isAdmin) {
      fetchPlanInfo();
    }
  }, []);

  /* ================= DRAG & SAVE ORDER ================= */

  const handleDrop = async (index) => {
    const updated = [...salons];
    const dragged = updated.splice(dragIndex, 1)[0];
    updated.splice(index, 0, dragged);

    setSalons(updated);

    const orderPayload = updated.map((s, i) => ({
      id: s._id,
      order: i
    }));

    await api.put("/salons/reorder", {
      order: orderPayload
    });

    showToast("Order saved");
  };

  /* ================= EMERGENCY ================= */

  const emergencyCloseAll = async () => {
    if (!window.confirm("Close ALL salons?")) return;
    await api.put("/salons/emergency/close-all");
    showToast("All salons closed");
    fetchSalons();
  };

  const reopenAll = async () => {
    if (!window.confirm("Reopen ALL salons?")) return;
    await api.put("/salons/emergency/open-all");
    showToast("All salons opened");
    fetchSalons();
  };

  /* ================= SAVE SALON ================= */

  const saveSalon = async () => {

    const payload = {
      ...form,
      holidays: form.holidays
        ? form.holidays.split(",").map(h => h.trim())
        : []
    };

    // If primary selected → unset others
    if (payload.isPrimary) {
      await api.put("/salons/reorder", {
        order: salons.map((s, i) => ({
          id: s._id,
          order: i + 1
        }))
      });
    }

    try {
      if (editingId) {
        await api.put(`/salons/${editingId}`, payload);
        showToast("Salon updated");
      } else {
        await api.post("/salons/add", payload);
        showToast("Salon added");
      }

      // Close immediate for better UX
      setShowForm(false);

      // Refresh in background
      fetchSalons();
      fetchPlanInfo();

    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save salon");
      return;
    }
  };

  const deleteSalon = async (id) => {
    if (!window.confirm("Delete salon?")) return;

    try {
      await api.delete(`/salons/${id}`);
      showToast("Salon deleted");
      setShowDetails(false);

      // Ensure refresh
      fetchSalons();
      fetchPlanInfo();
    } catch (err) {
      showToast("Failed to delete salon");
    }
  };

  const saveProfile = async () => {
    try {
      const endpoint = isAdmin ? "/adminProfile/update" : "/staffProfile/update";
      await api.put(endpoint, profileForm);
      showToast("Profile updated");
      setShowProfileForm(false);
      fetchUserProfile();

      // Also update localStorage to reflect changes in Navbar etc
      const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
      stored.name = profileForm.name;
      localStorage.setItem("currentUser", JSON.stringify(stored));

    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update profile");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen px-6 py-10">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>

          <div className="flex gap-2">
            <button onClick={toggleTheme} className="btn-outline">
              {theme === "light" ? "Dark" : "Light"}
            </button>

            {isAdmin && (
              <>
                {!planInfo?.selectedPlan ? (
                  <Link to="/plans" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                    Select Plan to Add Salon
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                      setShowForm(true);
                    }}
                    className="btn-primary"
                  >
                    + Add Salon
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* EMERGENCY */}
        {isAdmin && (
          <div className="p-4 rounded mb-8" style={{ backgroundColor: 'var(--gray-100)' }}>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={emergencyCloseAll}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                🚨 Emergency Close All
              </button>

              <button
                onClick={reopenAll}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                ✅ Reopen All
              </button>
            </div>
          </div>
        )}
        {/* PLAN USAGE */}
        {isAdmin && (
          <div className="p-4 md:p-5 rounded-2xl mb-8 border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-semibold">Plan Usage</h2>
              {planInfo?.selectedPlan && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600">
                  {planInfo.selectedPlan.name}
                </span>
              )}
            </div>

            {planInfo?.selectedPlan ? (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                  <div className="border rounded-full px-3 py-1" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                    Used <span className="font-semibold">{planInfo.salonsAdded}</span>
                  </div>
                  <div className="border rounded-full px-3 py-1" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                    Limit <span className="font-semibold">{planInfo.salonLimit}</span>
                  </div>
                  <div className="border rounded-full px-3 py-1" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                    Remaining <span className="font-semibold text-emerald-600">{planInfo.salonsRemaining}</span>
                  </div>
                  <div className="border rounded-full px-3 py-1" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                    Total <span className="font-semibold">Rs. {planInfo.totalPrice}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          (planInfo.salonsAdded / (planInfo.salonLimit || 1)) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] opacity-70 flex flex-wrap gap-x-3">
                    <span>{planInfo.salonsAdded} / {planInfo.salonLimit} salons</span>
                    <span>Per Branch: Rs. {planInfo.pricePerBranch}</span>
                    <span>
                      Selected: {planInfo.selectedPlanAt
                        ? new Date(planInfo.selectedPlanAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm mt-2" style={{ color: 'var(--text)' }}>
                No plan selected yet. Choose a plan to enable salon limits.
              </div>
            )}
          </div>
        )}

        {/* PROFILE SETTINGS */}
        <div className="p-6 md:p-8 rounded-2xl mb-8 border shadow-sm" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Personal Profile</h2>
              <p className="text-sm opacity-70">Manage your account information</p>
            </div>
            <button
              onClick={() => setShowProfileForm(true)}
              className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border-light)]">
              <label className="text-xs font-bold uppercase opacity-70 block mb-1">Full Name</label>
              <div className="font-semibold">{userProfile?.name || "Loading..."}</div>
            </div>
            <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border-light)]">
              <label className="text-xs font-bold uppercase opacity-70 block mb-1">Email Address</label>
              <div className="font-semibold opacity-70">{userProfile?.email || "Loading..."}</div>
            </div>
            <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border-light)]">
              <label className="text-xs font-bold uppercase opacity-70 block mb-1">Contact Number</label>
              <div className="font-semibold">{userProfile?.contact || "—"}</div>
            </div>
          </div>
        </div>

        {/* SALON CARDS */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10">

          {salons.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No salons added yet.</p>
              <p className="text-gray-400 text-sm">Select a plan and add your first salon to get started.</p>
            </div>
          ) : (
            salons.map((s, i) => (

              <div
                key={s._id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onClick={() => {
                  setSelected(s);
                  setShowDetails(true);
                }}
                className="border rounded-xl p-8 cursor-pointer hover:shadow"
                style={{ backgroundColor: 'var(--gray-100)' }}
              >

                {/* ORDER NUMBER */}
                <div className="w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  {i + 1}
                </div>

                {/* IMAGE */}
                {s.logo && (
                  <img
                    src={s.logo}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}

                {/* NAME */}
                <h3 className="text-center font-semibold">
                  {s.name}
                  {s.isPrimary && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 rounded">
                      PRIMARY
                    </span>
                  )}
                </h3>

                {/* ADDRESS */}
                <p className="text-center opacity-80 mt-2">
                  {s.address}
                </p>

                {/* HOURS */}
                <p className="text-center mt-2">
                  ⏱ {s.openingTime} - {s.closingTime}
                </p>

                {/* STATUS */}
                <p className="text-center mt-2">
                  <span className={`px-2 py-1 text-xs rounded
                  ${s.status === "open"
                      ? "bg-green-500"
                      : s.status === "closed"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    } text-white`}>
                    {s.status}
                  </span>
                </p>

              </div>

            ))
          )}

        </div>

        <div className="mt-12">
          <Footer />
        </div>

      </div>

      {/* ================= DETAILS MODAL ================= */}

      {showDetails && selected && (
        <Modal title="Salon Details" close={() => setShowDetails(false)}>

          <Detail label="Name" value={selected.name} />
          <Detail label="Owner" value={selected.ownerName} />
          <Detail label="Contact" value={selected.contact} />
          <Detail label="Email" value={selected.email} />
          <Detail label="Hours"
            value={`${selected.openingTime} - ${selected.closingTime}`}
          />
          <Detail label="Status" value={selected.status} />
          <Detail
            label="Holidays"
            value={(selected.holidays || []).join(", ")}
          />

          <div className="flex justify-end gap-3 mt-4">

            <button
              onClick={() => {
                setEditingId(selected._id);
                setForm({
                  ...selected,
                  holidays: (selected.holidays || []).join(", ")
                });
                setShowDetails(false);
                setShowForm(true);
              }}
              className="btn-primary"
            >
              Edit
            </button>

            {isAdmin && (
              <button
                onClick={() => deleteSalon(selected._id)}
                className="btn-outline"
                style={{ color: 'var(--danger)' }}
              >
                Delete
              </button>
            )}

          </div>

        </Modal>
      )}

      {/* ================= FORM MODAL ================= */}

      {showForm && (
        <Modal
          title={editingId ? "Edit Salon" : "Add Salon"}
          close={() => setShowForm(false)}
        >

          <form
            onSubmit={(e) => { e.preventDefault(); saveSalon(); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >

            <Input name="name" placeholder="Salon Name" form={form} setForm={setForm} />
            <Input name="ownerName" placeholder="Owner Name" form={form} setForm={setForm} />

            <Input name="contact" placeholder="Contact" form={form} setForm={setForm} />
            <Input name="email" placeholder="Email" form={form} setForm={setForm} />

            <Input name="openingTime" type="time" form={form} setForm={setForm} />
            <Input name="closingTime" type="time" form={form} setForm={setForm} />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-themed"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="temporarily-closed">Temporarily Closed</option>
            </select>

            <Input name="logo" placeholder="Logo URL" form={form} setForm={setForm} />

            <textarea
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="md:col-span-2 input-themed resize-none"
            />

            <textarea
              placeholder="Holidays (yyyy-mm-dd, comma separated)"
              value={form.holidays}
              onChange={(e) => setForm({ ...form, holidays: e.target.value })}
              className="md:col-span-2 input-themed resize-none"
            />

            <label className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
              />
              Set as Primary Salon
            </label>

            {form.logo && (
              <img src={form.logo} className="w-24 h-24 rounded" />
            )}

            <div className="md:col-span-2 flex justify-end">
              <button className="btn-primary px-6 py-2 rounded">
                Save Salon
              </button>
            </div>

          </form>

        </Modal>
      )}

      {/* ================= PROFILE FORM MODAL ================= */}

      {showProfileForm && (
        <Modal
          title="Edit Personal Profile"
          close={() => setShowProfileForm(false)}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); saveProfile(); }}
            className="flex flex-col gap-5 px-2"
          >
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-themed w-full p-4 rounded-xl border-2"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Email Address</label>
              <input
                type="email"
                value={userProfile?.email || ""}
                disabled
                className="input-themed w-full p-4 rounded-xl border-2 opacity-60 cursor-not-allowed"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Contact Number</label>
              <input
                type="text"
                placeholder="Contact Number"
                value={profileForm.contact}
                onChange={(e) => setProfileForm({ ...profileForm, contact: e.target.value })}
                className="input-themed w-full p-4 rounded-xl border-2"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <button
                type="button"
                onClick={() => setShowProfileForm(false)}
                className="border-2 rounded-xl text-sm font-semibold px-6 py-2.5 transition-colors"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)', color: 'var(--text)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-8 py-2.5 rounded-xl shadow-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}

/* ======================================================
   SMALL COMPONENTS
====================================================== */

function Modal({ title, close, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
      <div className="modal-card w-full max-w-xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between px-5 py-3 border-b sticky top-0" style={{ backgroundColor: 'var(--background)' }}>
          <h2>{title}</h2>
          <button onClick={close}>✕</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span>{label}</span>
      <span>{value || "-"}</span>
    </div>
  );
}

function Input({ name, placeholder, form, setForm, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={form[name] || ""}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      className="input-themed"
    />
  );
}
