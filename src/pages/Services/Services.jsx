import { useState } from "react";
import "./Services.css";

export function Services({ services, setServices }) {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editId) {
      setServices(
        services.map((s) =>
          s.id === editId ? { ...s, name, description } : s
        )
      );
    } else {
      setServices([
        ...services,
        { id: Date.now(), name, description }
      ]);
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
  };

  return (
    <div className="services-page">

      <h1 className="services-title">Services</h1>

      <p className="services-subtitle">
        We provide a wide range of professional services designed to help your
        business grow, improve efficiency, and achieve long-term success.
      </p>

      <div className="services-divider"></div>

      {/* Controls */}
      <div className="services-controls">

        <input
          type="text"
          placeholder="Search service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="short">Short Name</option>
          <option value="long">Long Name</option>
        </select>

        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Service
        </button>

      </div>

      {/* Grid */}
      <div className="services-grid">

        {services
          .filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
          )
          .filter((s) => {
            if (filter === "short") return s.name.length <= 6;
            if (filter === "long") return s.name.length > 6;
            return true;
          })
          .map((service, index) => (

            <div key={service.id} className="service-card">

              <div className="service-number">
                {index + 1}
              </div>

              <h3>{service.name}</h3>

              <p>{service.description}</p>

              <div className="service-actions">

                <button
                  className="btn-edit"
                  onClick={() => {
                    handleEdit(service);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(service.id)}
                >
                  Delete
                </button>

              </div>

            </div>

        ))}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">

          <div className="modal-box">

            <h2>
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
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="btn-primary">
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
