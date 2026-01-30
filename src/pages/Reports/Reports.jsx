import { useState } from "react";
import "./Reports.css";

export function Reports({ services, setServices }) {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("Active");

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
        {
          id: Date.now(),
          name,
          description: desc,
          status
        }
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
    setServices(services.filter((s) => s.id !== id));
  };

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>Service Reports</h2>
          <p>Manage and monitor all services</p>
        </div>

        <button
          className="reports-add-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Service
        </button>
      </div>

      {/* Card */}
      <div className="reports-card">

        {/* Tools */}
        <div className="reports-tools">

          <div className="reports-left-tools">

            <select>
              <option>Bulk Action</option>
              <option>Delete Selected</option>
            </select>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Low</option>
              <option>Inactive</option>
            </select>

          </div>

          <input
            type="text"
            placeholder="Search service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Table */}
        <table className="reports-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Service Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {services
              .filter((s) =>
                s.name.toLowerCase().includes(search.toLowerCase())
              )
              .filter((s) => {
                if (filter === "All") return true;
                return s.status === filter;
              })
              .map((s) => (

                <tr key={s.id}>

                  <td>#{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.description}</td>

                  <td>
                    <span className={`reports-status ${s.status?.toLowerCase()}`}>
                      {s.status || "Active"}
                    </span>
                  </td>

                  <td className="action-buttons">

                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">

          <div className="modal-box">

            <h3>{editId ? "Edit Service" : "Add Service"}</h3>

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
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Active</option>
                <option>Low</option>
                <option>Inactive</option>
              </select>

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
