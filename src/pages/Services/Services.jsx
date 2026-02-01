import { useState } from "react";

export function Services({ services, setServices }) {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // ------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editId) {
      setServices(
        services.map((s) =>
          s.id === editId ? { ...s, name, description } : s
        )
      );
    } else {
      setServices([...services, { id: Date.now(), name, description }]);
    }

    setName("");
    setDescription("");
    setEditId(null);
  };

  const handleDelete = (id) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleEdit = (service) => {
    setEditId(service.id);
    setName(service.name);
    setDescription(service.description);
    setShowModal(true);
  };

  // ------------------------

  return (

    <div className="min-h-screen w-full bg-(--background) px-6 md:px-10 py-10">

      <div className="max-w-7xl mx-auto">

        {/* TITLE */}
        <h1 className="text-center text-4xl font-bold text-(--text)">
          Services
        </h1>

        <div className="h-3" />

        {/* SUBTITLE */}
        <p className="text-center text-(--text) opacity-80 max-w-2xl mx-auto">
          We provide a wide range of professional services designed to help your
          business grow, improve efficiency, and achieve long-term success.
        </p>

        <div className="h-8" />

        {/* CONTROLS */}
        <div className="flex flex-wrap justify-center gap-4">

          <input
            type="text"
            placeholder="Search service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-(--background)
                       text-(--text)
                       border border-(--border-light)
                       px-4 py-3 rounded-xl w-64 outline-none"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-(--background)
                       text-(--text)
                       border border-(--border-light)
                       px-4 py-3 rounded-xl w-48 outline-none"
          >
            <option value="all">All</option>
            <option value="short">Short Name</option>
            <option value="long">Long Name</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-(--primary)
                       hover:bg-(--secondary)
                       text-white font-semibold
                       px-6 py-3 rounded-xl"
          >
            + Add Service
          </button>

        </div>

        <div className="h-12" />

        {/* GRID */}
        <div
          className="grid
          grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
          gap-10
          w-full"
        >

          {services.map((service, index) => (

            <div
              key={service.id}
              className="service-card
                         bg-(--gray-100)
                         border border-(--border-light)
                         rounded-xl
                         p-8"
            >

              {/* NUMBER */}
              <div
                className="service-number
                           w-12 h-12
                           rounded-full
                           bg-(--primary)
                           text-white
                           flex items-center justify-center
                           font-bold
                           mx-auto mb-4"
              >
                {index + 1}
              </div>

              {/* TITLE */}
              <h3 className="text-center font-semibold text-lg text-(--text)">
                {service.name}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-center text-(--text) opacity-80 mt-2">
                {service.description}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-center gap-4 mt-6">

                <button
                  onClick={() => handleEdit(service)}
                  className="bg-(--primary)
                             hover:bg-(--secondary)
                             text-white
                             px-6 py-2
                             min-w-22.5
                             rounded-lg
                             font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(service.id)}
                  className="bg-[#e5e7eb]
                             hover:bg-[#d1d5db]
                             text-blue-600
                             px-6 py-2
                             min-w-22.5
                             rounded-lg
                             font-semibold"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

        <div className="h-16" />

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full mb-6 p-3
                           rounded-lg
                           bg-(--background)
                           border border-(--border-light)
                           text-(--text) resize-none"
              />

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
