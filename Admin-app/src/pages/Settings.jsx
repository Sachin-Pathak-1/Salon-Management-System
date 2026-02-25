import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import api from "../api";
import { useToast } from "../context/ToastContext";

/* ======================================================
   SETTINGS PAGE
====================================================== */

export function Settings() {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

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

  /* ================= TOAST (Removed local) ================= */

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
  const [demoSecondsLeft, setDemoSecondsLeft] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);

  const [dragIndex, setDragIndex] = useState(null);

  const trialInfo = planInfo?.trial || {};
  const demoInfo = planInfo?.demo || {};
  const hasActivePlan = Boolean(trialInfo?.hasActivePlan || planInfo?.selectedPlan);
  const demoPlanActive = Boolean(demoInfo?.demoActive);
  const hasPlanAccess = Boolean(
    hasActivePlan || demoPlanActive
  );
  const salonLimit = Number(planInfo?.salonLimit || 0);
  const salonsAdded = Number(planInfo?.salonsAdded || 0);
  const reachedSalonLimit = salonLimit > 0 && salonsAdded >= salonLimit;
  const canAddSalon = isAdmin && hasPlanAccess && !reachedSalonLimit;

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
    // Moved to Profile page
  };

  useEffect(() => {
    fetchSalons();
    if (isAdmin) {
      fetchPlanInfo();
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const onSubscriptionUpdated = () => fetchPlanInfo();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchPlanInfo();
      }
    };

    window.addEventListener("subscription-updated", onSubscriptionUpdated);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("subscription-updated", onSubscriptionUpdated);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !demoPlanActive || !demoInfo?.demoEndsAt) return;

    const endsAt = new Date(demoInfo.demoEndsAt).getTime();
    const delay = Math.max(endsAt - Date.now(), 0) + 250;
    const timeoutId = setTimeout(() => {
      fetchPlanInfo();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isAdmin, demoPlanActive, demoInfo?.demoEndsAt]);

  useEffect(() => {
    if (!demoPlanActive || !demoInfo?.demoEndsAt) {
      setDemoSecondsLeft(0);
      return;
    }

    const computeRemaining = () => {
      const endsAt = new Date(demoInfo.demoEndsAt).getTime();
      const now = Date.now();
      const remaining = Math.max(Math.ceil((endsAt - now) / 1000), 0);
      setDemoSecondsLeft(remaining);
    };

    computeRemaining();
    const countdown = setInterval(computeRemaining, 1000);
    return () => clearInterval(countdown);
  }, [demoPlanActive, demoInfo?.demoEndsAt]);

  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

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
    if (!canAddSalon && !editingId) {
      if (!hasPlanAccess) {
        showToast("Activate demo or purchase a plan before adding a salon.");
      } else if (reachedSalonLimit) {
        showToast(`Salon limit reached (${salonsAdded}/${salonLimit}).`);
      } else {
        showToast("Cannot add salon right now.");
      }
      return;
    }

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
    // Moved to Profile page
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen px-6 py-10">

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
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setShowForm(true);
                  }}
                  className={`btn-primary ${!canAddSalon ? "opacity-60 cursor-not-allowed" : ""}`}
                  disabled={!canAddSalon}
                  title={
                    !hasPlanAccess
                      ? "Activate demo or purchase a plan to add salon."
                      : reachedSalonLimit
                        ? `Salon limit reached (${salonsAdded}/${salonLimit}).`
                        : ""
                  }
                >
                  + Add Salon
                </button>
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
              {!planInfo?.selectedPlan && demoPlanActive && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-700">
                  Demo Plan
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
            ) : demoPlanActive ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <div className="border rounded-full px-3 py-1" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                    Time Left <span className="font-semibold">{formatDuration(demoSecondsLeft)}</span>
                  </div>
                  <div className="border rounded-full px-3 py-1" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                    Ends At <span className="font-semibold">{demoInfo?.demoEndsAt ? new Date(demoInfo.demoEndsAt).toLocaleTimeString() : "N/A"}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs opacity-75">
                  Demo access is active. After timer ends, app will lock and redirect to Plans.
                </p>
              </div>
            ) : (demoInfo?.demoAlreadyUsed && !demoPlanActive) ? (
              <div className="text-sm mt-2" style={{ color: 'var(--danger)' }}>
                Demo trial expired/used. Purchase a plan to continue.
              </div>
            ) : (
              <div className="text-sm mt-2" style={{ color: 'var(--text)' }}>
                No active plan selected yet. Start demo or purchase a plan from Plans page.
              </div>
            )}

            {hasPlanAccess && reachedSalonLimit && (
              <div className="text-xs mt-2" style={{ color: 'var(--danger)' }}>
                Add Salon is disabled because you reached the current limit ({salonsAdded}/{salonLimit}).
              </div>
            )}
          </div>
        )}


        {/* SALON CARDS */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10">

          {salons.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No salons added yet.</p>
              <p className="text-gray-400 text-sm">Add your first salon to get started.</p>
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
                  ${s.displayStatus === "open"
                      ? "bg-green-500"
                      : s.displayStatus === "closed"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    } text-white`}>
                    {s.displayStatus}
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
