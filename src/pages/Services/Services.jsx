import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/services";
const SALON_API = "http://localhost:5000/api/salons/get";

export function Services() {

  /* ================= THEME (COLORS ONLY) ================= */
  const [theme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ================= AUTH ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = currentUser?.role === "admin";
  const staffSalonId = currentUser?.salonId;

  /* ================= STATE (NEVER UNDEFINED) ================= */
  const [services, setServices] = useState([]);
  const [salons, setSalons] = useState([]);
  const [activeSalon, setActiveSalon] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [toast, setToast] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dragId, setDragId] = useState(null);

  const categories = [
    "All", "Hair", "Spa", "Massage", "Facial", "Makeup", "Skin", "Nails"
  ];

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Hair",
    imageUrl: "",
    status: "active",
    isFeatured: false
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= HELPERS ================= */
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Cache-Control": "no-store"
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const safeFetch = async (url, options = {}) => {
    const res = await fetch(url, { cache: "no-store", ...options });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };

  /* ================= LOAD SALONS ================= */
  useEffect(() => {
    if (!isAdmin && staffSalonId) {
      setActiveSalon(staffSalonId);
      return;
    }

    safeFetch(SALON_API, { headers: authHeader() })
      .then(data => {
        setSalons(Array.isArray(data) ? data : []);
        if (data?.length) setActiveSalon(data[0]._id);
      })
      .catch(() => showToast("Failed to load salons"));
  }, []);

  /* ================= LOAD SERVICES ================= */
  useEffect(() => {
    if (!activeSalon) return;

    safeFetch(`${API}?salonId=${activeSalon}`, {
      headers: authHeader()
    })
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]));
  }, [activeSalon]);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}/${editId}` : API;

    await safeFetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        salonId: activeSalon
      })
    });

    closeModal();

    const refreshed = await safeFetch(
      `${API}?salonId=${activeSalon}`,
      { headers: authHeader() }
    );
    setServices(refreshed);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this service?")) return;

    await safeFetch(`${API}/${id}`, {
      method: "DELETE",
      headers: authHeader()
    });

    setServices(prev => prev.filter(s => s._id !== id));
  };

  /* ================= FEATURE ================= */
  const toggleFeatured = async (s) => {
    if (!isAdmin) return;

    await safeFetch(`${API}/${s._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ isFeatured: !s.isFeatured })
    });

    const refreshed = await safeFetch(
      `${API}?salonId=${activeSalon}`,
      { headers: authHeader() }
    );
    setServices(refreshed);
  };

  /* ================= DRAG ================= */
  const hasFeatured = services.some(s => s.isFeatured);

  const handleDrop = async (targetId) => {
    if (!isAdmin || !dragId || dragId === targetId) return;

    const copy = [...services];
    const from = copy.findIndex(s => s._id === dragId);
    const to = copy.findIndex(s => s._id === targetId);
    if (from === -1 || to === -1) return;

    const moved = copy.splice(from, 1)[0];
    copy.splice(to, 0, moved);
    setServices(copy);
    setDragId(null);

    await safeFetch(`${API}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({
        order: copy.map((s, i) => ({ id: s._id, order: i }))
      })
    });
  };

  /* ================= FILTER ================= */
  const filteredServices = services
    .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(s => activeCategory === "All" || s.category === activeCategory);

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="min-h-screen w-full bg-[var(--background)] px-6 md:px-10 py-10">

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg z-50">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        <h1 className="text-center text-4xl font-bold">
          Beauty & Wellness Services
        </h1>

        <p className="text-center opacity-80 mt-2">
          {filteredServices.length} Services
        </p>

        {!isAdmin && (
          <p className="text-center opacity-60 mt-1">
            Read-only mode (staff access)
          </p>
        )}

        {/* SALON SELECT */}
        {isAdmin && (
        <div className="flex justify-center mt-6">
          <select
            value={activeSalon}
            onChange={e => setActiveSalon(e.target.value)}
            className="bg-[var(--background)] border px-4 py-2 rounded-xl"
          >
            {salons.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        )}

        {/* CATEGORY */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full
                ${activeCategory === c
                  ? "bg-[var(--primary)] text-white"
                  : "border"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* SEARCH + ADD */}
        <div className="flex justify-center gap-4 mt-8 flex-wrap">
          <input
            placeholder="Search service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-4 py-3 rounded-xl w-64 bg-[var(--background)]"
          />

          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl"
            >
              + Add Service
            </button>
          )}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 mt-12">
          {filteredServices.map((s, index) => (
            <div
              key={s._id}
              draggable={isAdmin && !s.isFeatured}
              onDragStart={() => setDragId(s._id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(s._id)}
              className={`bg-[var(--gray-100)] border rounded-xl p-8
                ${s.status === "inactive" ? "opacity-40" : ""}
                ${s.isFeatured ? "ring-2 ring-yellow-400" : "cursor-move"}`}
            >
              <div
                onClick={() => toggleFeatured(s)}
                className={`text-right text-2xl ${isAdmin ? "cursor-pointer" : "opacity-40"}`}
              >
                {s.isFeatured ? "⭐" : "☆"}
              </div>

              <div className="w-12 h-12 bg-[var(--primary)] text-white
                rounded-full flex items-center justify-center mx-auto mb-4">
                {index + 1}
              </div>

              {s.imageUrl && (
                <img
                  src={s.imageUrl}
                  alt=""
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="text-center font-semibold">{s.name}</h3>
              <p className="text-center opacity-80 mt-2">{s.description}</p>
              <p className="text-center mt-2">
                ₹{s.price} | {s.duration} mins
              </p>

              {isAdmin && (
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      setEditId(s._id);
                      setForm({ ...emptyForm, ...s });
                      setShowModal(true);
                    }}
                    className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(s._id)}
                    className="border border-[var(--danger)] text-[var(--danger)]
                      hover:bg-[var(--danger)] hover:text-white
                      px-4 py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--gray-100)] w-full max-w-xl p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-6">
              {editId ? "Edit Service" : "Add Service"}
            </h2>

            <form onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input name="name" value={form.name}
                onChange={handleChange}
                placeholder="Service name"
                className="input-themed" />

              <select name="category" value={form.category}
                onChange={handleChange}
                className="input-themed">
                {categories.slice(1).map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <input name="price" type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Price (₹)"
                className="input-themed" />

              <input name="duration" type="number"
                value={form.duration}
                onChange={handleChange}
                placeholder="Duration (mins)"
                className="input-themed" />

              <textarea name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="input-themed md:col-span-2" />

              <input name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Image URL"
                className="input-themed md:col-span-2" />

              {form.imageUrl && (
                <img src={form.imageUrl}
                  className="md:col-span-2 h-40 object-cover rounded" />
              )}

              <label className="md:col-span-2 flex gap-2 items-center">
                <input type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange} />
                Featured Service
              </label>

              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button"
                  onClick={closeModal}
                  className="border px-5 py-2 rounded-lg">
                  Cancel
                </button>

                <button type="submit"
                  className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
