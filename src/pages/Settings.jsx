import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import api from "../api";

/* ======================================================
   SETTINGS PAGE
====================================================== */

export function Settings() {

  /* ================= THEME ================= */

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

  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);

  const [dragIndex, setDragIndex] = useState(null);

  /* ================= LOAD SALONS ================= */

  const fetchSalons = async () => {
    const res = await api.get("/salons/get");
    let list = res.data || [];

    // ensure primary salon always first
    list.sort((a, b) => b.isPrimary - a.isPrimary || a.order - b.order);

    setSalons(list);
  };

  const fetchPlanInfo = async () => {
    try {
      const res = await api.get("/plans/selection");
      setPlanInfo(res.data || null);
    } catch {
      setPlanInfo(null);
    }
  };

  useEffect(() => {
    fetchSalons();
    fetchPlanInfo();
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
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save salon");
      return;
    }

    setShowForm(false);
    fetchSalons();
    fetchPlanInfo();
  };

  /* ================= DELETE ================= */

  const deleteSalon = async (id) => {
    if (!window.confirm("Delete salon?")) return;
    await api.delete(`/salons/${id}`);
    showToast("Salon deleted");
    setShowDetails(false);
    fetchSalons();
    fetchPlanInfo();
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
          </div>
        </div>

        {/* EMERGENCY */}
        <div className="bg-(--gray-100) p-4 rounded mb-8">
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
        {/* PLAN USAGE */}
        <div className="bg-(--gray-100) p-6 rounded-2xl mb-8 border border-(--border-light)">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-lg font-semibold">Plan Usage</h2>
            {planInfo?.selectedPlan && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600">
                {planInfo.selectedPlan.name}
              </span>
            )}
          </div>

          {planInfo?.selectedPlan ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="bg-(--background) border border-(--border-light) rounded-xl p-4">
                  <div className="text-xs opacity-70">Salons Added</div>
                  <div className="text-2xl font-bold">
                    {planInfo.salonsAdded}
                  </div>
                </div>
                <div className="bg-(--background) border border-(--border-light) rounded-xl p-4">
                  <div className="text-xs opacity-70">Plan Limit</div>
                  <div className="text-2xl font-bold">
                    {planInfo.salonLimit}
                  </div>
                </div>
                <div className="bg-(--background) border border-(--border-light) rounded-xl p-4">
                  <div className="text-xs opacity-70">Remaining</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {planInfo.salonsRemaining}
                  </div>
                </div>
              </div>

              <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
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
              <div className="mt-2 text-xs opacity-70">
                {planInfo.salonsAdded} of {planInfo.salonLimit} salons used
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-(--text)">
                <div className="bg-(--background) border border-(--border-light) rounded-xl p-4">
                  <div className="text-xs opacity-70">Price Per Branch</div>
                  <div className="font-semibold">Rs. {planInfo.pricePerBranch}</div>
                </div>
                <div className="bg-(--background) border border-(--border-light) rounded-xl p-4">
                  <div className="text-xs opacity-70">Total Price</div>
                  <div className="font-semibold">Rs. {planInfo.totalPrice}</div>
                </div>
                <div className="bg-(--background) border border-(--border-light) rounded-xl p-4">
                  <div className="text-xs opacity-70">Selected On</div>
                  <div className="font-semibold">
                    {planInfo.selectedPlanAt
                      ? new Date(planInfo.selectedPlanAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-(--text)">
              No plan selected yet. Choose a plan to enable salon limits.
            </div>
          )}
        </div>

        {/* SALON CARDS */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10">

          {salons.map((s, i) => (

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
              className="bg-(--gray-100) border rounded-xl p-8 cursor-pointer hover:shadow"
            >

              {/* ORDER NUMBER */}
              <div className="w-12 h-12 rounded-full bg-(--primary)
                text-white flex items-center justify-center mx-auto mb-4">
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
                  ${
                    s.status === "open"
                      ? "bg-green-500"
                      : s.status === "closed"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  } text-white`}>
                  {s.status}
                </span>
              </p>

            </div>

          ))}

        </div>

        <div className="mt-12">
          <Footer />
        </div>

      </div>

      {/* ================= DETAILS MODAL ================= */}

      {showDetails && selected && (
        <Modal title="Salon Details" close={()=>setShowDetails(false)}>

          <Detail label="Name" value={selected.name}/>
          <Detail label="Owner" value={selected.ownerName}/>
          <Detail label="Contact" value={selected.contact}/>
          <Detail label="Email" value={selected.email}/>
          <Detail label="Hours"
            value={`${selected.openingTime} - ${selected.closingTime}`}
          />
          <Detail label="Status" value={selected.status}/>
          <Detail
            label="Holidays"
            value={(selected.holidays || []).join(", ")}
          />

          <div className="flex justify-end gap-3 mt-4">

            <button
              onClick={()=>{
                setEditingId(selected._id);
                setForm({
                  ...selected,
                  holidays:(selected.holidays||[]).join(", ")
                });
                setShowDetails(false);
                setShowForm(true);
              }}
              className="btn-primary"
            >
              Edit
            </button>

            <button
              onClick={()=>deleteSalon(selected._id)}
              className="btn-outline text-(--danger)"
            >
              Delete
            </button>

          </div>

        </Modal>
      )}

      {/* ================= FORM MODAL ================= */}

      {showForm && (
        <Modal
          title={editingId ? "Edit Salon" : "Add Salon"}
          close={()=>setShowForm(false)}
        >

          <form
            onSubmit={(e)=>{e.preventDefault();saveSalon();}}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >

            <Input name="name" placeholder="Salon Name" form={form} setForm={setForm}/>
            <Input name="ownerName" placeholder="Owner Name" form={form} setForm={setForm}/>

            <Input name="contact" placeholder="Contact" form={form} setForm={setForm}/>
            <Input name="email" placeholder="Email" form={form} setForm={setForm}/>

            <Input name="openingTime" type="time" form={form} setForm={setForm}/>
            <Input name="closingTime" type="time" form={form} setForm={setForm}/>

            <select
              value={form.status}
              onChange={(e)=>setForm({...form,status:e.target.value})}
              className="input-themed"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="temporarily-closed">Temporarily Closed</option>
            </select>

            <Input name="logo" placeholder="Logo URL" form={form} setForm={setForm}/>

            <textarea
              placeholder="Address"
              value={form.address}
              onChange={(e)=>setForm({...form,address:e.target.value})}
              className="md:col-span-2 input-themed resize-none"
            />

            <textarea
              placeholder="Holidays (yyyy-mm-dd, comma separated)"
              value={form.holidays}
              onChange={(e)=>setForm({...form,holidays:e.target.value})}
              className="md:col-span-2 input-themed resize-none"
            />

            <label className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e)=>setForm({...form,isPrimary:e.target.checked})}
              />
              Set as Primary Salon
            </label>

            {form.logo && (
              <img src={form.logo} className="w-24 h-24 rounded"/>
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
        <div className="flex justify-between px-5 py-3 border-b sticky top-0 bg-(--background)">
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

function Input({ name, placeholder, form, setForm, type="text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={form[name] || ""}
      onChange={(e)=>setForm({...form,[name]:e.target.value})}
      className="input-themed"
    />
  );
}
