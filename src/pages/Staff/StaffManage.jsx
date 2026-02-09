import { useEffect, useState } from "react";

const STAFF_API = "http://localhost:5000/api/staff";
const SALON_API = "http://localhost:5000/api/salons/get";

export default function Staff() {

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
    isManager: false
  };

  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [activeSalon, setActiveSalon] = useState("");

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specFilter, setSpecFilter] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [toast, setToast] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  /* ================= HELPERS ================= */

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ================= LOAD SALONS ================= */

  const fetchSalons = async () => {
    const res = await fetch(SALON_API, { headers: authHeader() });
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setSalons(list);
    if (list.length && !activeSalon) setActiveSalon(list[0]._id);
  };

  /* ================= LOAD STAFF ================= */

  const fetchStaff = async (salonId) => {
    if (!salonId) return;

    const res = await fetch(
      `${STAFF_API}?salonId=${salonId}`,
      { headers: authHeader() }
    );

    const data = await res.json();
    setStaff(Array.isArray(data) ? data : []);
  };

  /* ================= EFFECTS ================= */

  useEffect(() => { fetchSalons(); }, []);
  useEffect(() => { if (activeSalon) fetchStaff(activeSalon); }, [activeSalon]);

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
    return null;
  };

  /* ================= ADD ================= */

  const addStaff = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return showToast(err);

    await fetch(`${STAFF_API}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ ...form, salonId: activeSalon })
    });

    showToast("Staff added");
    setShowAdd(false);
    setForm(emptyForm);
    fetchStaff(activeSalon);
  };

  /* ================= UPDATE ================= */

  const updateStaff = async (e) => {
    e.preventDefault();
    const { password, ...safeForm } = form;

    await fetch(`${STAFF_API}/${selected._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(safeForm)
    });

    showToast("Staff updated");
    setShowEdit(false);
    setSelected(null);
    fetchStaff(activeSalon);
  };

  /* ================= DELETE ================= */

  const deleteStaff = async () => {

    if (selected?.isManager) {
      return showToast("Manager cannot be deleted");
    }

    if (!window.confirm("Delete staff member?")) return;

    await fetch(`${STAFF_API}/${selected._id}`, {
      method: "DELETE",
      headers: authHeader()
    });

    showToast("Staff deleted");
    setSelected(null);
    fetchStaff(activeSalon);
  };

  /* ================= FILTERED LIST ================= */

  const filtered = staff
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => statusFilter === "All" || s.status === statusFilter)
    .filter(s => specFilter === "All" || s.specialization === specFilter);

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

    const payload = updated.map((s, i) => ({
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

  const activeSalonName =
    salons.find(s => s._id === activeSalon)?.name || "";

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full bg-(--background) px-4 md:px-10 py-10">

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg z-50">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto text-(--text)">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">Staff Management</h1>
          <p className="opacity-80">
            {activeSalonName} • {staff.length} Staff Members
          </p>
        </div>

        <div className="bg-(--gray-100) border border-(--border-light) rounded-xl p-4 md:p-6">

          {/* TOOLS */}
          <div className="flex flex-wrap gap-3 justify-between items-center mb-6">

            <div className="flex gap-3">

              {salons.length > 1 && (
                <select
                  value={activeSalon}
                  onChange={(e)=>setActiveSalon(e.target.value)}
                  className="bg-(--background) border px-4 py-2 rounded-xl"
                >
                  {salons.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              )}

              <select value={statusFilter}
                onChange={(e)=>setStatusFilter(e.target.value)}
                className="bg-(--background) border px-4 py-2 rounded-xl">
                <option>All</option>
                <option>active</option>
                <option>inactive</option>
              </select>

              <select value={specFilter}
                onChange={(e)=>setSpecFilter(e.target.value)}
                className="bg-(--background) border px-4 py-2 rounded-xl">
                <option>All</option>
                <option>Hair</option>
                <option>Makeup</option>
                <option>Skin</option>
                <option>Nails</option>
              </select>

            </div>

            <div className="flex gap-3">
              <input
                placeholder="Search staff..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-64 bg-(--background) border px-4 py-2 rounded-xl"
              />

              <button
                onClick={()=>setShowAdd(true)}
                className="bg-(--primary) text-white px-5 py-2 rounded-xl">
                + Add Staff
              </button>
            </div>

          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b opacity-70">
                  <th className="p-3 text-left">Staff</th>
                  <th className="p-3 text-left">Designation</th>
                  <th className="p-3 text-left">Specialization</th>
                  <th className="p-3 text-left">Shift</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s, index) => (
                  <tr
                    key={s._id}
                    draggable={!s.isManager}
                    onDragStart={()=>setDragIndex(index)}
                    onDragOver={(e)=>e.preventDefault()}
                    onDrop={()=>handleDrop(index)}
                    onClick={()=>setSelected(s)}
                    className="border-b hover:bg-black/5 cursor-pointer"
                  >

                    <td className="p-3 flex gap-3 items-center">
                      <div className="w-10 h-10 bg-(--primary) text-white rounded-full flex items-center justify-center font-bold">
                        {s.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          {s.name}
                          {s.isManager && (
                            <span className="text-xs text-yellow-500">★ Manager</span>
                          )}
                        </div>
                        <small className="opacity-70">{s.email}</small>
                      </div>
                    </td>

                    <td className="p-3">{s.designation || "-"}</td>
                    <td className="p-3">{s.specialization || "-"}</td>
                    <td className="p-3 capitalize">{s.shift}</td>
                    <td className="p-3 capitalize">{s.status}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ADD */}
      {showAdd &&
        <Modal title="Add Staff" close={()=>setShowAdd(false)}>
          <StaffForm form={form} handleChange={handleChange} submit={addStaff}/>
        </Modal>
      }

      {/* DETAILS */}
      {selected &&
        <Modal title="Staff Details" close={()=>setSelected(null)}>
          <Detail label="Name" value={selected.name}/>
          <Detail label="Email" value={selected.email}/>
          <Detail label="Contact" value={selected.contact}/>
          <Detail label="Designation" value={selected.designation}/>
          <Detail label="Specialization" value={selected.specialization}/>
          <Detail label="Experience" value={selected.experience}/>
          <Detail label="Shift" value={selected.shift}/>
          <Detail label="Salary" value={selected.salary}/>
          <Detail label="Status" value={selected.status}/>
          <Detail label="Manager" value={selected.isManager ? "Yes" : "No"}/>
          <Detail label="Address" value={selected.address}/>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={()=>{ setForm(selected); setShowEdit(true); }}
              className="bg-(--primary) text-white px-4 py-2 rounded-lg">
              Edit
            </button>

            <button
              onClick={deleteStaff}
              className="bg-red-500 text-white px-4 py-2 rounded-lg">
              Delete
            </button>
          </div>
        </Modal>
      }

      {/* EDIT */}
      {showEdit &&
        <Modal title="Edit Staff" close={()=>setShowEdit(false)}>
          <StaffForm form={form} handleChange={handleChange} submit={updateStaff}/>
        </Modal>
      }

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Modal({ title, close, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
      <div className="modal-card w-full max-w-xl flex flex-col max-h-[80vh]">

        <div className="flex justify-between items-center px-5 py-3 border-b sticky top-0 bg-(--background)">
          <h2 className="font-semibold">{title}</h2>
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
      <span className="font-medium">{label}</span>
      <span>{value || "-"}</span>
    </div>
  );
}

function StaffForm({ form, handleChange, submit }) {
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">

      <Input name="name" placeholder="Full Name" form={form} handleChange={handleChange}/>
      <Input name="email" placeholder="Email" form={form} handleChange={handleChange}/>
      {submit.name === "addStaff" &&
        <Input name="password" type="password" placeholder="Password" form={form} handleChange={handleChange}/>
      }
      <Input name="contact" placeholder="Contact" form={form} handleChange={handleChange}/>

      <Input name="dob" type="date" form={form} handleChange={handleChange}/>
      <Input name="gender" placeholder="Gender" form={form} handleChange={handleChange}/>
      <Input name="designation" placeholder="Designation" form={form} handleChange={handleChange}/>
      <Input name="specialization" placeholder="Specialization" form={form} handleChange={handleChange}/>
      <Input name="experience" placeholder="Experience" form={form} handleChange={handleChange}/>
      <Input name="salary" placeholder="Salary" form={form} handleChange={handleChange}/>

      <select name="shift" value={form.shift} onChange={handleChange}
        className="bg-(--background) border px-3 py-2 rounded-xl">
        <option value="morning">Morning</option>
        <option value="evening">Evening</option>
        <option value="full-day">Full Day</option>
      </select>

      <select name="status" value={form.status} onChange={handleChange}
        className="bg-(--background) border px-3 py-2 rounded-xl">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isManager"
          checked={form.isManager || false}
          onChange={handleChange}
        />
        Set as Manager (only one per salon)
      </label>

      <textarea
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        className="md:col-span-2 bg-(--background) border px-3 py-2 rounded-xl resize-none"
      />

      <div className="md:col-span-2 flex justify-end">
        <button className="bg-(--primary) text-white px-6 py-2 rounded-xl">
          Save
        </button>
      </div>

    </form>
  );
}

function Input({ name, placeholder, form, handleChange, type="text" }) {
  return (
    <input
      type={type}
      name={name}
      value={form[name] || ""}
      placeholder={placeholder}
      onChange={handleChange}
      className="bg-(--background) border px-3 py-2 rounded-xl"
    />
  );
}
