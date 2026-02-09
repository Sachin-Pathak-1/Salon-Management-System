import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/services";

export function Reports() {

  const [services, setServices] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("none");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoadError("");
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setServices([]);
      setLoadError("Failed to load services. Please check the API.");
    }
  };

  const resetForm = () => {
    setName("");
    setDesc("");
    setPrice("");
    setDuration("");
    setCategory("");
    setStatus("Active");
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description: desc,
      price,
      duration,
      category,
      status
    };

    if (editId) {
      await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    fetchServices();
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setName(s.name);
    setDesc(s.description);
    setPrice(s.price || "");
    setDuration(s.duration || "");
    setCategory(s.category || "");
    setStatus(s.status || "Active");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchServices();
  };

  const filteredServices = services
    .filter(s => (s.name || "").toLowerCase().includes(search.toLowerCase()))
    .filter(s => filter === "All" || s.status === filter)
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
      return 0;
    });

  return (

    <div className="min-h-screen w-full bg-(--background) px-4 md:px-10 py-10">

      <div className="max-w-7xl mx-auto text-(--text)">

        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            Salon Service Management
          </h1>
          <p className="opacity-80">
            Manage and monitor all salon services
          </p>
        </div>

        <div
          className="bg-(--gray-100)
                     border border-(--border-light)
                     rounded-xl
                     p-4 md:p-6"
        >

          {/* TOOLS */}
          <div className="flex flex-wrap gap-3 justify-between items-center mb-6">

            <div className="flex gap-3">

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-(--background)
                           border border-(--border-light)
                           px-4 py-2 rounded-xl"
              >
                <option>All</option>
                <option>Active</option>
                <option>Low</option>
                <option>Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-(--background)
                           border border-(--border-light)
                           px-4 py-2 rounded-xl"
              >
                <option value="none">Sort By</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>

            </div>

            <div className="flex gap-3">

              <input
                type="text"
                placeholder="Search service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64
                           bg-(--background)
                           border border-(--border-light)
                           px-4 py-2 rounded-xl outline-none"
              />

              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-(--primary)
                           hover:bg-(--secondary)
                           text-white font-semibold
                           px-5 py-2 rounded-xl"
              >
                + Add Service
              </button>

            </div>

          </div>

          {loadError && (
            <div className="mb-4 text-sm text-red-600">
              {loadError}
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-(--border-light) opacity-70">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Service Name</th>
                  <th className="text-left p-3">Price</th>

                  {/* HIDDEN ON MOBILE */}
                  <th className="text-left p-3 max-md:hidden">Duration</th>
                  <th className="text-left p-3 max-md:hidden">Category</th>
                  <th className="text-left p-3 max-md:hidden">Description</th>

                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredServices.map((s, index) => (

                  <tr
                    key={s._id}
                    className="border-b border-(--border-light)
                               hover:bg-black/5 transition"
                  >

                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">Rs. {s.price || "-"}</td>

                    {/* HIDDEN ON MOBILE */}
                    <td className="p-3 max-md:hidden">
                      {s.duration || "-"} mins
                    </td>

                    <td className="p-3 max-md:hidden">
                      {s.category || "-"}
                    </td>

                    <td className="p-3 max-md:hidden opacity-80">
                      {s.description}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          (s.status || "Active") === "Active"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : (s.status || "Active") === "Low"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {s.status || "Active"}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">

                        <button
                          onClick={() => handleEdit(s)}
                          className="bg-(--primary)
                                   hover:bg-(--secondary)
                                   text-white
                                   px-4 py-2
                                   rounded-lg"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(s._id)}
                          className="bg-[#e5e7eb]
                                   hover:bg-[#d1d5db]
                                   text-blue-600
                                   px-4 py-2
                                   rounded-lg"
                        >
                          Delete
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

    </div>
  );
}
