import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../api";

const CATEGORIES_API = "http://localhost:5000/api/categories";
const SERVICES_API = "http://localhost:5000/api/services";
const STAFF_API = "http://localhost:5000/api/staff";

export function Services({ activeSalon }) {
  const { showToast } = useToast();
  /* ================= THEME ================= */
  const [theme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ================= AUTH ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = ["admin", "manager"].includes(currentUser?.role);

  /* ================= STATE ================= */
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editServiceId, setEditServiceId] = useState(null);
  const [selected, setSelected] = useState(null);

  const emptyCategory = {
    name: "",
    description: "",
    icon: "📋",
    status: "active"
  };

  const emptyService = {
    name: "",
    description: "",
    price: "",
    priceMale: "",
    priceFemale: "",
    duration: "",
    categoryId: "",
    imageUrl: "",
    status: "active",
    isFeatured: false,
    assignedStaff: []
  };

  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [serviceForm, setServiceForm] = useState(emptyService);

  /* ================= HELPERS ================= */
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Cache-Control": "no-store"
  });

  const safeFetch = async (url, options = {}) => {
    const res = await fetch(url, { cache: "no-store", ...options });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Request failed");
    }
    return res.json();
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!activeSalon) return;

    const loadData = async () => {
      try {
        const [catsRes, svcsRes, stfRes] = await Promise.all([
          api.get(`/categories?salonId=${activeSalon}`),
          api.get(`/services?salonId=${activeSalon}`),
          api.get(`/staff?salonId=${activeSalon}`)
        ]);

        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
        setServices(Array.isArray(svcsRes.data) ? svcsRes.data : []);
        setStaff(Array.isArray(stfRes.data) ? stfRes.data : []);
      } catch (err) {
        console.error("LOAD DATA ERROR:", err);
        showToast("Failed to load salon data");
      }
    };

    loadData();
  }, [activeSalon]);

  /* ================= CATEGORY OPERATIONS ================= */
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!categoryForm.name) return showToast("Category name required");

    try {
      const method = editCategoryId ? "PUT" : "POST";
      const url = editCategoryId
        ? `${CATEGORIES_API}/${editCategoryId}`
        : CATEGORIES_API;

      await api[method](url, { ...categoryForm, salonId: activeSalon });

      const res = await api.get(`/categories?salonId=${activeSalon}`);
      setCategories(res.data);
      closeCategoryModal();
      showToast(editCategoryId ? "Category updated" : "Category added");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to save category");
    }
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditCategoryId(null);
    setCategoryForm(emptyCategory);
  };

  const handleDeleteCategory = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this category?")) return;

    try {
      await safeFetch(`${CATEGORIES_API}/${id}`, {
        method: "DELETE",
        headers: authHeader()
      });

      // Auto-refresh from server
      const refreshed = await safeFetch(
        `${CATEGORIES_API}?salonId=${activeSalon}`,
        { headers: authHeader() }
      );
      setCategories(refreshed);

      if (activeCategory === id) setActiveCategory("All");
      showToast("Category deleted");
    } catch (err) {
      showToast("Failed to delete category");
    }
  };

  /* ================= SERVICE OPERATIONS ================= */
  const handleServiceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleStaffToggle = (staffId) => {
    setServiceForm(prev => ({
      ...prev,
      assignedStaff: prev.assignedStaff.includes(staffId)
        ? prev.assignedStaff.filter(id => id !== staffId)
        : [...prev.assignedStaff, staffId]
    }));
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!activeSalon) return showToast("Please select a salon first");
    if (!serviceForm.name || !serviceForm.categoryId) {
      return showToast("Name and category required");
    }

    try {
      const url = editServiceId ? `/services/${editServiceId}` : "/services";
      const method = editServiceId ? "put" : "post";

      const payload = {
        ...serviceForm,
        price: Number(serviceForm.price),
        priceMale: Number(serviceForm.priceMale || 0),
        priceFemale: Number(serviceForm.priceFemale || 0),
        duration: Number(serviceForm.duration),
        salonId: activeSalon
      };

      await api[method](url, payload);

      // Close modal and show success immediately
      closeServiceModal();
      showToast(editServiceId ? "Service updated" : "Service added");

      // Attempt to refresh in background
      try {
        const res = await api.get(`/services?salonId=${activeSalon}`);
        setServices(res.data);
      } catch (err) {
        console.error("Refresh failed:", err);
      }
    } catch (err) {
      console.error("SERVICE SUBMIT ERROR:", err.response?.data || err);
      showToast(err.response?.data?.message || err.message || "Failed to save service");
    }
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setEditServiceId(null);
    setServiceForm(emptyService);
  };

  const handleDeleteService = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this service?")) return;

    try {
      await safeFetch(`${SERVICES_API}/${id}`, {
        method: "DELETE",
        headers: authHeader()
      });

      // Auto-refresh from server
      const refreshed = await safeFetch(
        `${SERVICES_API}?salonId=${activeSalon}`,
        { headers: authHeader() }
      );
      setServices(refreshed);

      showToast("Service deleted");
    } catch (err) {
      showToast("Failed to delete service");
    }
  };

  const toggleFeatured = async (s) => {
    if (!isAdmin) return;

    try {
      await safeFetch(`${SERVICES_API}/${s._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ isFeatured: !s.isFeatured })
      });

      const refreshed = await safeFetch(
        `${SERVICES_API}?salonId=${activeSalon}`,
        { headers: authHeader() }
      );
      setServices(refreshed);
    } catch (err) {
      showToast("Failed to update featured status");
    }
  };

  /* ================= FILTERING ================= */
  const filteredServices = services
    .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(s => {
      if (activeCategory === "All") return true;
      return s.categoryId?._id === activeCategory || s.categoryId === activeCategory;
    });

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat?.name || "Unknown";
  };

  const getCategoryIcon = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat?.icon || "📋";
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto" style={{ color: 'var(--text)' }}>
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
            Services & Categories
          </h1>
          <p className="text-sm mt-2" style={{ opacity: 0.7 }}>
            <span className="font-semibold">{filteredServices.length}</span> Services • <span className="font-semibold">{categories.length}</span> Categories
          </p>
        </div>

        {/* MAIN CONTAINER */}
        <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>

          {/* TOOLS */}
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex gap-3">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="input-themed text-sm px-4 py-2.5 rounded-xl">
                <option value="All">All Categories</option>
                {categories.filter(c => c.status === "active").map(c => (
                  <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <input
                placeholder="🔍 Search service..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-themed text-sm px-4 py-2.5 rounded-xl w-64"
              />

              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowManageCategories(true)}
                    className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-200"
                    style={{ backgroundColor: 'var(--secondary)' }}
                  >
                    Manage Categories
                  </button>
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-200"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    + Service
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Service</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Category</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Normal Price</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Male Price</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Female Price</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Duration</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Status</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Staff</th>
                  {isAdmin && <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((s) => (
                    <tr
                      key={s._id}
                      onClick={() => setSelected(s)}
                      className={`border-b transition-colors cursor-pointer ${s.status === "inactive" ? "opacity-50" : ""}`}
                      style={{
                        borderColor: 'var(--border-light)',
                        backgroundColor: 'var(--background)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span
                            onClick={(e) => { e.stopPropagation(); toggleFeatured(s); }}
                            className={`text-xl cursor-pointer transition-transform hover:scale-125 ${isAdmin ? "" : "opacity-40 cursor-default"}`}
                            title={isAdmin ? "Toggle featured" : ""}
                          >
                            {s.isFeatured ? "⭐" : "☆"}
                          </span>
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--text)' }}>{s.name}</div>
                            <small className="block mt-0.5" style={{ opacity: 0.7 }}>
                              {s.description?.slice(0, 40)}{s.description?.length > 40 ? "..." : ""}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--gray-100)' }}>
                          {getCategoryIcon(s.categoryId?._id || s.categoryId)} {getCategoryName(s.categoryId?._id || s.categoryId)}
                        </span>
                      </td>
                      <td className="p-4 font-semibold" style={{ color: 'var(--success)' }}>₹{s.price}</td>
                      <td className="p-4 font-semibold" style={{ color: 'var(--primary)' }}>₹{s.priceMale || 0}</td>
                      <td className="p-4 font-semibold" style={{ color: 'var(--accent)' }}>₹{s.priceFemale || 0}</td>
                      <td className="p-4" style={{ opacity: 0.7 }}>{s.duration} mins</td>
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
                        {s.assignedStaff?.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: 'rgba(24, 146, 247, 0.1)', color: 'var(--primary)' }}>
                            <span>👥</span> {s.assignedStaff.length}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.4 }}>—</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="p-4">
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditServiceId(s._id);
                                setServiceForm({ ...emptyService, ...s, categoryId: s.categoryId?._id || s.categoryId, assignedStaff: (s.assignedStaff || []).map(st => typeof st === 'object' ? st._id : st) });
                                setShowServiceModal(true);
                              }}
                              className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                              style={{ backgroundColor: 'var(--primary)' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteService(s._id); }}
                              className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                              style={{ backgroundColor: 'var(--danger)' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center" style={{ opacity: 0.6 }}>
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl opacity-50">📋</span>
                        <span>No services found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* SERVICE DETAILS MODAL */}
      {selected && !showServiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="border w-full max-w-xl rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Service Details</h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Name</label>
                <div className="font-semibold text-lg mt-1" style={{ color: 'var(--text)' }}>{selected.name}</div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Category</label>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--background)' }}>
                    {getCategoryIcon(selected.categoryId?._id || selected.categoryId)} {getCategoryName(selected.categoryId?._id || selected.categoryId)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Normal Price</label>
                  <div className="font-bold text-lg mt-1" style={{ color: 'var(--success)' }}>₹{selected.price}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Male Price</label>
                  <div className="font-bold text-lg mt-1" style={{ color: 'var(--primary)' }}>₹{selected.priceMale || 0}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Female Price</label>
                  <div className="font-bold text-lg mt-1" style={{ color: 'var(--accent)' }}>₹{selected.priceFemale || 0}</div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Duration</label>
                <div className="font-semibold text-lg mt-1" style={{ color: 'var(--text)' }}>{selected.duration} mins</div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Description</label>
                <div className="text-sm mt-1" style={{ opacity: 0.8 }}>{selected.description || "—"}</div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize`}
                    style={{
                      backgroundColor: selected.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-100)',
                      color: selected.status === 'active' ? 'var(--success)' : 'var(--text)'
                    }}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {selected.assignedStaff?.length > 0 && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Assigned Staff</label>
                  <div className="text-sm mt-1" style={{ opacity: 0.8 }}>{selected.assignedStaff.map(s => s.name || s).join(", ")}</div>
                </div>
              )}

              {isAdmin && (
                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditServiceId(selected._id);
                      setServiceForm({ ...emptyService, ...selected, categoryId: selected.categoryId?._id || selected.categoryId, assignedStaff: (selected.assignedStaff || []).map(st => typeof st === 'object' ? st._id : st) });
                      setShowServiceModal(true);
                    }}
                    className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteService(selected._id); setSelected(null); }}
                    className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ backgroundColor: 'var(--danger)' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={closeCategoryModal}>
          <div className="border w-full max-w-xl rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {editCategoryId ? "Edit Category" : "Add Category"}
              </h2>
            </div>

            <form onSubmit={handleCategorySubmit} className="grid gap-5 p-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Category Name</label>
                <input
                  name="name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Hair Care"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Icon (emoji)</label>
                <input
                  name="icon"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="✂️"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  maxLength="2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Description</label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Optional description"
                  className="input-themed w-full px-4 py-3 rounded-xl resize-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Status</label>
                <select
                  name="status"
                  value={categoryForm.status}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                  className="input-themed w-full px-4 py-3 rounded-xl"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); closeCategoryModal(); }}
                  className="px-5 py-2.5 border-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  onClick={(e) => e.stopPropagation()}
                  className="text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm font-semibold"
                  style={{ backgroundColor: 'var(--secondary)' }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE CATEGORIES MODAL */}
      {showManageCategories && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowManageCategories(false)}>
          <div className="border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Manage Categories</h2>
              <button
                onClick={() => setShowManageCategories(false)}
                className="text-2xl opacity-50 hover:opacity-100"
              >✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div
                    key={c._id}
                    className="p-5 rounded-xl border flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-lg" style={{ color: 'var(--text)' }}>{c.icon} {c.name}</div>
                      <small className="block mt-1" style={{ opacity: 0.7 }}>{c.description}</small>
                      <div className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs font-medium capitalize`}
                        style={{
                          backgroundColor: c.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-100)',
                          color: c.status === 'active' ? 'var(--success)' : 'var(--text)'
                        }}>
                        {c.status}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditCategoryId(c._id);
                          setCategoryForm(c);
                          setShowCategoryModal(true);
                        }}
                        className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c._id); }}
                        className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                        style={{ backgroundColor: 'var(--danger)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end" style={{ borderColor: 'var(--border-light)' }}>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--secondary)' }}
              >
                + Add New Category
              </button>
            </div>
          </div>
        </div>
      )}
      {showServiceModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeServiceModal}>
          <div className="w-full max-w-2xl flex flex-col max-h-[85vh] rounded-2xl shadow-2xl border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {editServiceId ? "Edit Service" : "Add Service"}
              </h2>
            </div>

            <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 overflow-y-auto flex-1">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Service Name</label>
                <input
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceChange}
                  placeholder="e.g., Hair Cutting"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Category</label>
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    value={serviceForm.categoryId}
                    onChange={handleServiceChange}
                    className="input-themed flex-1 px-4 py-3 rounded-xl"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c.status === "active").map(c => (
                      <option key={c._id} value={c._id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="aspect-square bg-purple-100 text-purple-700 w-12 rounded-xl flex items-center justify-center font-bold text-xl hover:bg-purple-200"
                    title="Add New Category"
                    style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Normal Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  value={serviceForm.price}
                  onChange={handleServiceChange}
                  placeholder="500"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Male Price (₹)</label>
                <input
                  name="priceMale"
                  type="number"
                  value={serviceForm.priceMale}
                  onChange={handleServiceChange}
                  placeholder="400"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Female Price (₹)</label>
                <input
                  name="priceFemale"
                  type="number"
                  value={serviceForm.priceFemale}
                  onChange={handleServiceChange}
                  placeholder="600"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Duration (mins)</label>
                <input
                  name="duration"
                  type="number"
                  value={serviceForm.duration}
                  onChange={handleServiceChange}
                  placeholder="30"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Description</label>
                <textarea
                  name="description"
                  value={serviceForm.description}
                  onChange={handleServiceChange}
                  placeholder="Service details..."
                  className="input-themed w-full px-4 py-3 rounded-xl resize-none"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Image URL</label>
                <input
                  name="imageUrl"
                  value={serviceForm.imageUrl}
                  onChange={handleServiceChange}
                  placeholder="https://..."
                  className="input-themed w-full px-4 py-3 rounded-xl"
                />
              </div>

              {serviceForm.imageUrl && (
                <div className="md:col-span-2">
                  <img
                    src={serviceForm.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* STAFF ASSIGNMENT */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Assign Staff Members</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl border-2 max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                  {staff.length > 0 ? (
                    staff.map(s => (
                      <label key={s._id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={serviceForm.assignedStaff.includes(s._id)}
                          onChange={() => handleStaffToggle(s._id)}
                          className="cursor-pointer w-4 h-4 rounded"
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span className="text-sm font-medium">{s.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm col-span-2 text-center py-4" style={{ opacity: 0.6 }}>No staff members available</p>
                  )}
                </div>
              </div>

              <label className="md:col-span-2 flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-colors"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={serviceForm.isFeatured}
                  onChange={handleServiceChange}
                  className="cursor-pointer w-4 h-4 rounded"
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Mark as Featured Service</span>
                  <p className="text-xs mt-0.5" style={{ opacity: 0.6 }}>Featured services appear at the top</p>
                </div>
              </label>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Status</label>
                <select
                  name="status"
                  value={serviceForm.status}
                  onChange={handleServiceChange}
                  className="input-themed w-full px-4 py-3 rounded-xl"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); closeServiceModal(); }}
                  className="px-5 py-2.5 border-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  onClick={(e) => e.stopPropagation()}
                  className="text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm font-semibold"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      {/* Fixed: Removed jsx attribute from style tag */}
    </div>
  );
}