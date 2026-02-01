import { useEffect, useState } from "react";

export function Reports({ services, setServices }) {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("Active");

  /* ESC closes modal */
  useEffect(() => {
    const close = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  /* ADD / UPDATE */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editId) {
      setServices(
        services.map((s) =>
          s.id === editId
            ? { ...s, name, description: desc, status }
            : s
        )
      );
    } else {
      setServices([
        ...services,
        { id: Date.now(), name, description: desc, status }
      ]);
    }

    setName("");
    setDesc("");
    setStatus("Active");
    setEditId(null);
  };

  /* EDIT */
  const handleEdit = (service) => {
    setEditId(service.id);
    setName(service.name);
    setDesc(service.description);
    setStatus(service.status || "Active");
    setShowModal(true);
  };

  /* DELETE */
  const handleDelete = (id) => {
    if (!confirm("Delete this service?")) return;
    setServices(services.filter((s) => s.id !== id));
  };

  return (

    <div className="min-h-screen w-full bg-(--background) px-6 md:px-10 py-10">

      <div className="max-w-7xl mx-auto text-(--text)">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            Service Reports
          </h1>

          <p className="opacity-80">
            Manage and monitor all services
          </p>
        </div>

        {/* TABLE CARD */}
        <div
          className="bg-(--gray-100)
                     border border-(--border-light)
                     rounded-xl
                     p-6"
        >

          {/* TOOLS */}
          <div className="flex justify-between items-center mb-6">

            <div className="flex gap-3">

              <select
                className="bg-(--background)
                           text-(--text)
                           border border-(--border-light)
                           px-4 py-2 rounded-xl"
              >
                <option>Bulk Action</option>
                <option>Delete Selected</option>
              </select>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-(--background)
                           text-(--text)
                           border border-(--border-light)
                           px-4 py-2 rounded-xl"
              >
                <option>All</option>
                <option>Active</option>
                <option>Low</option>
                <option>Inactive</option>
              </select>

            </div>

            {/* SEARCH + ADD */}
            <div className="flex gap-3">

              <input
                type="text"
                placeholder="Search service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64
                           bg-(--background)
                           text-(--text)
                           border border-(--border-light)
                           px-4 py-2 rounded-xl outline-none"
              />

              <button
                onClick={() => setShowModal(true)}
                className="bg-(--primary)
                           hover:bg-(--secondary)
                           text-white font-semibold
                           px-5 py-2 rounded-xl"
              >
                + Add Service
              </button>

            </div>

          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full text-sm min-w-225">

              <thead>
                <tr className="border-b border-(--border-light) opacity-70">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Service Name</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>

              <tbody>

                {services.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-6 opacity-60">
                      No services found
                    </td>
                  </tr>
                )}

                {services
                  .filter((s) =>
                    s.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .filter((s) => filter === "All" || s.status === filter)
                  .map((s) => (

                    <tr
                      key={s.id}
                      className="border-b border-(--border-light)
                                 hover:bg-black/5 transition"
                    >

                      <td className="p-3">#{s.id}</td>
                      <td className="p-3">{s.name}</td>
                      <td className="p-3 opacity-80">{s.description}</td>

                      {/* STATUS */}
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

                      {/* ACTIONS */}
                      <td className="p-3">
                        <div className="flex gap-3">

                          <button
                            onClick={() => handleEdit(s)}
                            className="bg-(--primary)
                                     hover:bg-(--secondary)
                                     text-white
                                     px-6 py-2
                                     rounded-lg
                                     min-w-22.5
                                     font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(s.id)}
                            className="bg-[#e5e7eb]
                                     hover:bg-[#d1d5db]
                                     text-blue-600
                                     px-6 py-2
                                     rounded-lg
                                     min-w-22.5
                                     font-semibold"
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto">

          <div
            className="bg-(--gray-100)
                       w-95
                       p-8
                       rounded-xl
                       border border-(--border-light)"
          >

            <h2 className="text-xl font-bold text-(--text) mb-6">
              {editId ? "Edit Service" : "Add Service"}
            </h2>

            <form
              onSubmit={(e) => {
                handleSubmit(e);
                setShowModal(false);
              }}
            >

              <input
                placeholder="Service Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mb-4 p-3
                           rounded-lg
                           bg-(--background)
                           border border-(--border-light)
                           text-(--text)"
              />

              <textarea
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                rows={4}
                className="w-full mb-6 p-3
                           rounded-lg
                           bg-(--background)
                           border border-(--border-light)
                           text-(--text) resize-none"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mb-6 p-3
                           rounded-lg
                           bg-(--background)
                           border border-(--border-light)
                           text-(--text)"
              >
                <option>Active</option>
                <option>Low</option>
                <option>Inactive</option>
              </select>

              <div className="flex justify-end gap-4">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                  className="px-5 py-2
                             rounded-lg
                             border border-(--primary)
                             text-(--primary)"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2
                             rounded-lg
                             bg-(--primary)
                             hover:bg-(--secondary)
                             text-white font-semibold"
                >
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
