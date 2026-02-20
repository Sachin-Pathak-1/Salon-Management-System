import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";

const STAFF_API = "http://localhost:5000/api/staff";
const SERVICES_API = "http://localhost:5000/api/services";

export default function Staff({ activeSalon }) {
  const { showToast } = useToast();

  /* ================= THEME ================= */
  const [theme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ================= STATES ================= */

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    contact: "",
    designation: "",
    specialization: "",
    experience: "",
    shift: "full-day",
    salary: "",
    status: "active",
    gender: "",
    dob: "",
    address: "",
    role: "staff",
    services: []
  };

  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  /* ================= HELPERS ================= */

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  /* ================= LOAD STAFF & SERVICES ================= */

  const fetchStaff = async (salonId) => {
    if (!salonId) return;

    const res = await fetch(
      `${STAFF_API}?salonId=${salonId}`,
      { headers: authHeader() }
    );

    const data = await res.json();
    setStaff(Array.isArray(data) ? data : []);
  };

  const fetchServices = async (salonId) => {
    if (!salonId) return;

    const res = await fetch(
      `${SERVICES_API}?salonId=${salonId}`,
      { headers: authHeader() }
    );

    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (activeSalon) {
      fetchStaff(activeSalon);
      fetchServices(activeSalon);
    }
  }, [activeSalon]);

  /* ================= FORM ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const validate = () => {
    if (!form.name) return "Name required";
    if (!form.email) return "Email required";
    if (showAdd && !form.password) return "Password required";
    if (!activeSalon) return "Select or create a salon first";
    return null;
  };

  /* ================= ADD ================= */

  const addStaff = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return showToast(err);

    try {
      const res = await fetch(`${STAFF_API}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ ...form, salonId: activeSalon })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to add staff");
        return;
      }

      showToast("Staff added");
      setShowAdd(false);
      setForm(emptyForm);
      fetchStaff(activeSalon);
    } catch (err) {
      showToast("Failed to add staff");
    }
  };

  /* ================= UPDATE ================= */

  const updateStaff = async (e) => {
    e.preventDefault();
    const { password, ...safeForm } = form;

    try {
      const res = await fetch(`${STAFF_API}/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(safeForm)
      });

      const data = await res.json();

      if (!res.ok) {
        return showToast(data.message || "Update failed");
      }

      showToast("Staff updated");
      setShowEdit(false);
      setSelected(null);
      fetchStaff(activeSalon);
    } catch (err) {
      showToast("Update failed");
    }
  };

  /* ================= UPDATE ACCESS ================= */

  const updateAccess = async (access) => {
    try {
      await fetch(`${STAFF_API}/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ access })
      });

      showToast("Access updated");
      setShowAccess(false);
      setSelected(null);
      fetchStaff(activeSalon);
    } catch (err) {
      showToast("Failed to update access");
    }
  };

  /* ================= DELETE ================= */

  const deleteStaff = async () => {

    if (selected?.role === "manager") {
      return showToast("Manager cannot be deleted");
    }

    if (!window.confirm("Delete staff member?")) return;

    try {
      await fetch(`${STAFF_API}/${selected._id}`, {
        method: "DELETE",
        headers: authHeader()
      });

      showToast("Staff deleted");
      setSelected(null);
      fetchStaff(activeSalon);
    } catch (err) {
      showToast("Failed to delete staff");
    }
  };

  /* ================= FILTERED LIST ================= */

  const filtered = staff
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => statusFilter === "All" || s.status === statusFilter)
    .filter(s => specFilter === "All" || s.specialization === specFilter)
    .sort((a, b) => (b.role === "manager" ? 1 : 0) - (a.role === "manager" ? 1 : 0));

  /* ================= DRAG DROP ================= */

  const handleDrop = async (filteredIndex) => {

    const draggedItem = filtered[dragIndex];
    const targetItem = filtered[filteredIndex];
    if (!draggedItem || !targetItem) return;

    const updated = [...staff];

    const from = updated.findIndex(s => s._id === draggedItem._id);
    const to = updated.findIndex(s => s._id === targetItem._id);

    const moved = updated.splice(from, 1)[0];
    updated.splice(to, 0, moved);

    setStaff(updated);

    // Only send non-manager staff in reorder payload
    const payload = updated
      .filter(s => s.role !== "manager")
      .map((s, i) => ({
        id: s._id,
        order: i
      }));

    await fetch(`${STAFF_API}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ order: payload })
    });

    showToast("Order saved");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: 'var(--background)' }}>

      <div className="max-w-7xl mx-auto" style={{ color: 'var(--text)' }}>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
            Staff Management
          </h1>
          <p className="text-sm mt-2" style={{ opacity: 0.7 }}>
            <span className="font-semibold">{staff.length}</span> Staff Members
          </p>
        </div>

        <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>

          {/* TOOLS */}
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">

            <div className="flex gap-3">

              <select value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-themed text-sm px-4 py-2.5 rounded-xl">
                <option>All</option>
                <option>active</option>
                <option>inactive</option>
              </select>

              <select value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                className="input-themed text-sm px-4 py-2.5 rounded-xl">
                <option>All</option>
                <option>Hair</option>
                <option>Makeup</option>
                <option>Skin</option>
                <option>Nails</option>
              </select>

            </div>

            <div className="flex gap-3">
              <input
                placeholder="🔍 Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-themed text-sm px-4 py-2.5 rounded-xl w-64"
              />

              <button
                onClick={() => setShowAdd(true)}
                className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: 'var(--primary)' }}>
                + Add Staff
              </button>
            </div>

          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Staff</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Designation</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Specialization</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Shift</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Status</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s, index) => (
                  <tr
                    key={s._id}
                    draggable={s.role !== "manager"}
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    onClick={() => setSelected(s)}
                    className="border-b transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                  >

                    <td className="p-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex gap-2 items-center">
                            <span className="font-semibold" style={{ color: 'var(--text)' }}>{s.name}</span>
                            {s.role === "manager" && (
                              <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>★ Manager</span>
                            )}
                          </div>
                          <small className="block mt-0.5" style={{ opacity: 0.7 }}>{s.email}</small>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-sm" style={{ opacity: 0.8 }}>{s.designation || "-"}</td>
                    <td className="p-4 text-sm" style={{ opacity: 0.8 }}>{s.specialization || "-"}</td>
                    <td className="p-4 capitalize" style={{ opacity: 0.8 }}>{s.shift}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize`}
                        style={{
                          backgroundColor: s.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-100)',
                          color: s.status === 'active' ? 'var(--success)' : 'var(--text)'
                        }}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(s); setForm({ ...emptyForm, ...s, services: (s.services || []).map(service => typeof service === 'object' ? service._id : service) }); setShowEdit(true); }}
                          className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                          style={{ backgroundColor: 'var(--primary)' }}>
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(s); setShowAccess(true); }}
                          className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                          style={{ backgroundColor: 'var(--secondary)' }}>
                          Access
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ADD */}
      {showAdd &&
        <Modal title="Add Staff" close={() => setShowAdd(false)}>
          <StaffForm form={form} handleChange={handleChange} setForm={setForm} submit={addStaff} services={services} onCancel={() => setShowAdd(false)} />
        </Modal>
      }

      {/* DETAILS */}
      {selected && !showEdit && !showAccess &&
        <Modal title="Staff Details" close={() => setSelected(null)}>
          <Detail label="Name" value={selected.name} />
          <Detail label="Email" value={selected.email} />
          <Detail label="Contact" value={selected.contact} />
          <Detail label="Designation" value={selected.designation} />
          <Detail label="Specialization" value={selected.specialization} />
          <Detail label="Experience" value={selected.experience} />
          <Detail label="Shift" value={selected.shift} />
          <Detail label="Salary" value={selected.salary} />
          <Detail label="Status" value={selected.status} />
          <Detail label="Manager" value={selected.role === "manager" ? "Yes" : "No"} />
          <Detail label="Address" value={selected.address} />
          {selected.services?.length > 0 && (
            <Detail label="Services" value={selected.services.map(s => s.name || s).join(", ")} />
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setSelected(null); }}
              className="px-5 py-2.5 border-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
            >
              Close
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setForm({ ...emptyForm, ...selected, services: (selected.services || []).map(service => typeof service === 'object' ? service._id : service) }); setShowEdit(true); }}
              className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}>
              Edit
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); deleteStaff(); }}
              className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--danger)' }}>
              Delete
            </button>
          </div>
        </Modal>
      }

      {/* EDIT */}
      {showEdit &&
        <Modal title="Edit Staff" close={() => { setShowEdit(false); setSelected(null); }}>
          <StaffForm form={form} handleChange={handleChange} setForm={setForm} submit={updateStaff} services={services} onCancel={() => { setShowEdit(false); setSelected(null); }} />
        </Modal>
      }

      {/* ACCESS CONTROL */}
      {showAccess && selected &&
        <Modal title={`Access Control for ${selected.name}`} close={() => { setShowAccess(false); setSelected(null); }}>
          <AccessControlModal staff={selected} updateAccess={updateAccess} />
        </Modal>
      }

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Modal({ title, close, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-20 z-50 animate-fade-in" onClick={close}>
      <div className="w-full max-w-xl flex flex-col max-h-[80vh] rounded-2xl shadow-2xl border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }} onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-between items-center px-6 py-5 border-b sticky top-0 rounded-t-2xl" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between border-b py-3 text-sm" style={{ borderColor: 'var(--border-light)' }}>
      <span className="font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
      <span style={{ opacity: 0.8 }}>{value || "-"}</span>
    </div>
  );
}

function StaffForm({ form, handleChange, setForm, submit, services = [], onCancel }) {
  const handleServiceToggle = (serviceId) => {
    setForm({
      ...form,
      services: form.services?.includes(serviceId)
        ? form.services.filter(id => id !== serviceId)
        : [...(form.services || []), serviceId]
    });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>

      <Input name="name" placeholder="Full Name" form={form} handleChange={handleChange} />
      <Input name="email" placeholder="Email" form={form} handleChange={handleChange} />
      {submit.name === "addStaff" &&
        <Input name="password" type="password" placeholder="Password" form={form} handleChange={handleChange} />
      }
      <Input name="contact" placeholder="Contact" form={form} handleChange={handleChange} />

      <Input name="dob" type="date" form={form} handleChange={handleChange} />
      <Input name="gender" placeholder="Gender" form={form} handleChange={handleChange} />
      <Input name="designation" placeholder="Designation" form={form} handleChange={handleChange} />
      <Input name="specialization" placeholder="Specialization" form={form} handleChange={handleChange} />
      <Input name="experience" placeholder="Experience" form={form} handleChange={handleChange} />
      <Input name="salary" placeholder="Salary" form={form} handleChange={handleChange} />

      <select name="shift" value={form.shift} onChange={handleChange} className="input-themed px-4 py-3 rounded-xl">
        <option value="morning">Morning</option>
        <option value="evening">Evening</option>
        <option value="full-day">Full Day</option>
      </select>

      <select name="status" value={form.status} onChange={handleChange} className="input-themed px-4 py-3 rounded-xl">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <label className="md:col-span-2 flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-colors"
        style={{ borderColor: 'var(--border-light)', backgroundColor: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <input
          type="checkbox"
          checked={form.role === "manager"}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.checked ? "manager" : "staff"
            })
          }
          className="cursor-pointer w-4 h-4 rounded"
          style={{ accentColor: 'var(--primary)' }}
        />
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Set as Manager</span>
      </label>

      <textarea
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        className="md:col-span-2 input-themed px-4 py-3 rounded-xl resize-none"
        rows="3"
      />

      {/* SERVICES ASSIGNMENT */}
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Assign Services</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl border-2 max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
          {services.length > 0 ? (
            services.map(s => (
              <label key={s._id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <input
                  type="checkbox"
                  checked={form.services?.includes(s._id)}
                  onChange={() => handleServiceToggle(s._id)}
                  className="cursor-pointer w-4 h-4 rounded"
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span className="text-sm font-medium">{s.name}</span>
              </label>
            ))
          ) : (
            <p className="text-sm col-span-2 text-center py-4" style={{ opacity: 0.6 }}>No services available</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        {onCancel && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="px-5 py-2.5 border-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          onClick={(e) => e.stopPropagation()}
          className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
          style={{ backgroundColor: 'var(--primary)' }}>
          Save
        </button>
      </div>

    </form>
  );
}

function Input({ name, placeholder, form, handleChange, type = "text" }) {
  return (
    <input
      type={type}
      name={name}
      value={form[name] || ""}
      placeholder={placeholder}
      onChange={handleChange}
      className="input-themed px-4 py-3 rounded-xl"
    />
  );
}

function AccessControlModal({ staff, updateAccess }) {
  const [access, setAccess] = useState(staff.access || []);

  const tabs = [
    { key: "Dashboard", label: "Dashboard" },
    { key: "Services", label: "Services" },
    { key: "Appointments", label: "Appointments" },
    { key: "Clients", label: "Clients" },
    { key: "Staff", label: "Staff" },
    { key: "Plans", label: "Plans" },
    { key: "Reports", label: "Reports" },
    { key: "Expenses", label: "Expenses" },
    { key: "Billing", label: "Billing" },
    { key: "Profile", label: "Profile" },
    { key: "Settings", label: "Settings" },
    { key: "Support", label: "Support" }
  ];

  const handleToggle = (tab) => {
    setAccess(prev =>
      prev.includes(tab)
        ? prev.filter(t => t !== tab)
        : [...prev, tab]
    );
  };

  const handleSave = (e) => {
    e.stopPropagation();
    updateAccess(access);
  };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <p className="text-sm" style={{ opacity: 0.7 }}>
        Select the sidebar tabs that {staff.name} should have access to:
      </p>

      <div className="space-y-3">
        {tabs.map(tab => (
          <label
            key={tab.key}
            className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors border"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{tab.label}</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={access.includes(tab.key)}
                onChange={() => handleToggle(tab.key)}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: access.includes(tab.key) ? 'var(--primary)' : 'var(--gray-200)'
                }}
              ></div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <button
          onClick={handleSave}
          className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
          style={{ backgroundColor: 'var(--primary)' }}>
          Save Access
        </button>
      </div>
    </div>
  );
}
