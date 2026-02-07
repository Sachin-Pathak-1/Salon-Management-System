import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/services";
const SALON_API = "http://localhost:5000/api/salons/get";

export function Services({ services, setServices }) {

  /* ================= FORM ================= */

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
  const [editId, setEditId] = useState(null);

  /* ================= SALON ================= */

  const [salons, setSalons] = useState([]);
  const [activeSalon, setActiveSalon] = useState("");

  /* ================= UI ================= */

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [toast, setToast] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Hair", "Makeup", "Skin", "Nails"];

  /* ================= HELPERS ================= */

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  /* ================= LOAD SALONS ================= */

  useEffect(() => {
    fetch(SALON_API, { headers: authHeader() })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setSalons(list);
        if (list.length) setActiveSalon(list[0]._id);
      });
  }, []);

  /* ================= LOAD SERVICES ================= */

  useEffect(() => {
    if (activeSalon) fetchServices();
  }, [activeSalon]);

  const fetchServices = async () => {
    const res = await fetch(`${API}?salonId=${activeSalon}`);
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
  };

  /* ================= FORM ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  /* ================= SAVE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}/${editId}` : API;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, salonId: activeSalon })
    });

    showToast(editId ? "Service updated" : "Service added");
    fetchServices();
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete service?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchServices();
  };

  /* ================= EDIT ================= */

  const handleEdit = (s) => {
    setEditId(s._id);
    setForm(s);
    setShowModal(true);
  };

  /* ================= FEATURE ================= */

  const toggleFeatured = async (s) => {
    await fetch(`${API}/${s._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !s.isFeatured })
    });

    fetchServices();
  };

  /* ================= DRAG ================= */

  const handleDrop = async (targetId) => {
    const copy = [...services];
    const from = copy.findIndex(s => s._id === dragId);
    const to = copy.findIndex(s => s._id === targetId);

    const moved = copy.splice(from, 1)[0];
    copy.splice(to, 0, moved);

    setServices(copy);

    await fetch(`${API}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: copy.map((s, i) => ({ id: s._id, order: i }))
      })
    });
  };

  /* ================= FILTER ================= */

  const filteredServices = services
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => activeCategory === "All" || s.category === activeCategory);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full bg-(--background) px-6 md:px-10 py-10">

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg">
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

        {/* SALON SELECT */}
        <div className="flex justify-center mt-6">
          <select
            value={activeSalon}
            onChange={(e)=>setActiveSalon(e.target.value)}
            className="bg-(--background) border px-4 py-2 rounded-xl"
          >
            {salons.map(s=>(
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex justify-center gap-3 mt-6">
          {categories.map(c=>(
            <button
              key={c}
              onClick={()=>setActiveCategory(c)}
              className={`px-4 py-2 rounded-full
                ${activeCategory===c
                  ? "bg-(--primary) text-white"
                  : "border"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* SEARCH + ADD */}
        <div className="flex justify-center gap-4 mt-8">

          <input
            placeholder="Search service..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="bg-(--background) border px-4 py-3 rounded-xl w-64"
          />

          <button
            onClick={()=>setShowModal(true)}
            className="bg-(--primary) text-white px-6 py-3 rounded-xl"
          >
            + Add Service
          </button>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 mt-12">

          {filteredServices.map((s,index)=>(
            <div key={s._id}

              draggable={!s.isFeatured}
              onDragStart={()=>!s.isFeatured && setDragId(s._id)}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>!s.isFeatured && handleDrop(s._id)}

              className={`bg-(--gray-100) border rounded-xl p-8
              ${s.isFeatured ? "opacity-90" : "cursor-move"}`}
            >

              <div
                onClick={()=>toggleFeatured(s)}
                className="text-right cursor-pointer text-2xl"
              >
                {s.isFeatured ? "⭐" : "☆"}
              </div>

              <div className="w-12 h-12 bg-(--primary) text-white
                rounded-full flex items-center justify-center mx-auto mb-4">
                {index+1}
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

              <div className="flex justify-center gap-4 mt-6">

                <button
                  onClick={()=>handleEdit(s)}
                  className="bg-(--primary) text-white px-4 py-2 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={()=>handleDelete(s._id)}
                  className="bg-[#e5e7eb] px-4 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-(--gray-100) w-full max-w-xl p-8 rounded-xl">

            <h2 className="text-xl font-bold mb-6">
              {editId ? "Edit Service" : "Add Service"}
            </h2>

            <form onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label>Name</label>
                <input name="name" value={form.name}
                  onChange={handleChange}
                  className="input-themed"/>
              </div>

              <div>
                <label>Category</label>
                <select name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-themed">
                  {categories.slice(1).map(c=>(
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Price</label>
                <input name="price" value={form.price}
                  onChange={handleChange}
                  className="input-themed"/>
              </div>

              <div>
                <label>Duration (mins)</label>
                <input name="duration" value={form.duration}
                  onChange={handleChange}
                  className="input-themed"/>
              </div>

              <div className="md:col-span-2">
                <label>Description</label>
                <textarea name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input-themed"/>
              </div>

              <div className="md:col-span-2">
                <label>Image URL</label>
                <input name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="input-themed"/>
              </div>

              {form.imageUrl && (
                <img src={form.imageUrl}
                  className="md:col-span-2 h-40 object-cover rounded"/>
              )}

              <label className="md:col-span-2 flex gap-2 items-center">
                <input type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}/>
                Featured Service
              </label>

              <div className="md:col-span-2 flex justify-end gap-4">

                <button
                  type="button"
                  onClick={()=>setShowModal(false)}
                  className="border px-5 py-2 rounded-lg">
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-(--primary) text-white px-6 py-2 rounded-lg">
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
