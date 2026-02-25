import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../api";

const INVENTORY_API = "/inventory";

export function Inventory({ activeSalon }) {
  const { showToast } = useToast();

  /* ================= THEME ================= */
  const [theme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ================= AUTH ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = currentUser?.role === "admin";

  /* ================= STATE ================= */
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editInventoryId, setEditInventoryId] = useState(null);
  const [selected, setSelected] = useState(null);

  const emptyInventory = {
    name: "",
    description: "",
    quantity: 0,
    lowStockThreshold: 10,
    unitPrice: 0,
    category: "products",
    supplier: "",
    status: "active"
  };

  const [inventoryForm, setInventoryForm] = useState(emptyInventory);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!activeSalon) return;

    const loadData = async () => {
      try {
        const [invRes, lowStockRes] = await Promise.all([
          api.get(`/inventory?salonId=${activeSalon}`),
          api.get(`/inventory/low-stock?salonId=${activeSalon}`)
        ]);

        setInventory(Array.isArray(invRes.data) ? invRes.data : []);
        setLowStockItems(Array.isArray(lowStockRes.data) ? lowStockRes.data : []);
      } catch (err) {
        console.error("LOAD DATA ERROR:", err);
        showToast("Failed to load inventory data");
      }
    };

    loadData();
  }, [activeSalon]);

  /* ================= INVENTORY OPERATIONS ================= */
  const handleInventoryChange = (e) => {
    const { name, value, type } = e.target;
    setInventoryForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!activeSalon) return showToast("Please select a salon first");
    if (!inventoryForm.name) {
      return showToast("Name is required");
    }

    try {
      const url = editInventoryId ? `${INVENTORY_API}/${editInventoryId}` : INVENTORY_API;
      const method = editInventoryId ? "put" : "post";

      const payload = {
        ...inventoryForm,
        quantity: Number(inventoryForm.quantity),
        lowStockThreshold: Number(inventoryForm.lowStockThreshold),
        unitPrice: Number(inventoryForm.unitPrice),
        salonId: activeSalon
      };

      await api[method](url, payload);

      closeInventoryModal();
      showToast(editInventoryId ? "Inventory updated" : "Inventory added");

      // Refresh data
      const [invRes, lowStockRes] = await Promise.all([
        api.get(`/inventory?salonId=${activeSalon}`),
        api.get(`/inventory/low-stock?salonId=${activeSalon}`)
      ]);
      setInventory(invRes.data);
      setLowStockItems(lowStockRes.data);
    } catch (err) {
      console.error("INVENTORY SUBMIT ERROR:", err.response?.data || err);
      showToast(err.response?.data?.message || err.message || "Failed to save inventory");
    }
  };

  const closeInventoryModal = () => {
    setShowInventoryModal(false);
    setEditInventoryId(null);
    setInventoryForm(emptyInventory);
  };

  const handleDeleteInventory = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this inventory item?")) return;

    try {
      await api.delete(`${INVENTORY_API}/${id}`);

      // Refresh data
      const [invRes, lowStockRes] = await Promise.all([
        api.get(`/inventory?salonId=${activeSalon}`),
        api.get(`/inventory/low-stock?salonId=${activeSalon}`)
      ]);
      setInventory(invRes.data);
      setLowStockItems(lowStockRes.data);

      showToast("Inventory deleted");
    } catch (err) {
      showToast("Failed to delete inventory");
    }
  };

  /* ================= FILTERING ================= */
  const filteredInventory = inventory
    .filter(i => i.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(i => {
      if (activeCategory === "All") return true;
      return i.category === activeCategory;
    });

  const categories = ["All", "products", "equipment", "supplies", "other"];

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto" style={{ color: 'var(--text)' }}>
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
            Inventory Management
          </h1>
          <p className="text-sm mt-2" style={{ opacity: 0.7 }}>
            <span className="font-semibold">{filteredInventory.length}</span> Items • 
            <span className="font-semibold ml-2">{lowStockItems.length}</span> Low Stock
          </p>
        </div>

        {/* LOW STOCK ALERT */}
        {lowStockItems.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border-2" style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            borderColor: 'var(--danger)' 
          }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--danger)' }}>
                  Low Stock Alert
                </h3>
                <p className="text-sm" style={{ opacity: 0.8 }}>
                  {lowStockItems.length} item(s) need to be restocked: {lowStockItems.map(i => i.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTAINER */}
        <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>

          {/* TOOLS */}
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex gap-3">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="input-themed text-sm px-4 py-2.5 rounded-xl">
                {categories.map(c => (
                  <option key={c} value={c}>{c === "All" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <input
                placeholder="🔍 Search inventory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-themed text-sm px-4 py-2.5 rounded-xl w-64"
              />

              {isAdmin && (
                <button
                  onClick={() => setShowInventoryModal(true)}
                  className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-200"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  + Add Item
                </button>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Item</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Category</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Quantity</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Threshold</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Unit Price</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Supplier</th>
                  <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Status</th>
                  {isAdmin && <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => setSelected(item)}
                      className="border-b transition-colors cursor-pointer"
                      style={{
                        borderColor: 'var(--border-light)',
                        backgroundColor: item.quantity <= item.lowStockThreshold ? 'rgba(239, 68, 68, 0.05)' : 'var(--background)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = item.quantity <= item.lowStockThreshold ? 'rgba(239, 68, 68, 0.05)' : 'var(--background)'}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text)' }}>{item.name}</div>
                          <small className="block mt-0.5" style={{ opacity: 0.7 }}>
                            {item.description?.slice(0, 30)}{item.description?.length > 30 ? "..." : ""}
                          </small>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--gray-100)' }}>
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${item.quantity <= item.lowStockThreshold ? 'text-red-500' : ''}`} 
                          style={{ color: item.quantity <= item.lowStockThreshold ? 'var(--danger)' : 'var(--text)' }}>
                          {item.quantity}
                          {item.quantity <= item.lowStockThreshold && <span className="ml-1">⚠️</span>}
                        </span>
                      </td>
                      <td className="p-4" style={{ opacity: 0.7 }}>{item.lowStockThreshold}</td>
                      <td className="p-4 font-semibold" style={{ color: 'var(--success)' }}>₹{item.unitPrice}</td>
                      <td className="p-4" style={{ opacity: 0.7 }}>{item.supplier || "—"}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize`}
                          style={{
                            backgroundColor: item.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-100)',
                            color: item.status === 'active' ? 'var(--success)' : 'var(--text)'
                          }}>
                          {item.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-4">
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditInventoryId(item._id);
                                setInventoryForm({ ...emptyInventory, ...item });
                                setShowInventoryModal(true);
                              }}
                              className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                              style={{ backgroundColor: 'var(--primary)' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteInventory(item._id); }}
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
                        <span className="text-4xl opacity-50">📦</span>
                        <span>No inventory items found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* INVENTORY DETAILS MODAL */}
      {selected && !showInventoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="border w-full max-w-xl rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Inventory Details</h2>
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
                    {selected.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Quantity</label>
                  <div className="font-bold text-lg mt-1" style={{ color: selected.quantity <= selected.lowStockThreshold ? 'var(--danger)' : 'var(--text)' }}>
                    {selected.quantity}
                    {selected.quantity <= selected.lowStockThreshold && " ⚠️ Low Stock"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Low Stock Threshold</label>
                  <div className="font-semibold text-lg mt-1" style={{ color: 'var(--text)' }}>{selected.lowStockThreshold}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Unit Price</label>
                  <div className="font-bold text-lg mt-1" style={{ color: 'var(--success)' }}>₹{selected.unitPrice}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Total Value</label>
                  <div className="font-bold text-lg mt-1" style={{ color: 'var(--primary)' }}>₹{selected.unitPrice * selected.quantity}</div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>Supplier</label>
                <div className="text-sm mt-1" style={{ opacity: 0.8 }}>{selected.supplier || "—"}</div>
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
                      setEditInventoryId(selected._id);
                      setInventoryForm({ ...emptyInventory, ...selected });
                      setShowInventoryModal(true);
                    }}
                    className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteInventory(selected._id); setSelected(null); }}
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

      {/* ADD/EDIT INVENTORY MODAL */}
      {showInventoryModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeInventoryModal}>
          <div className="w-full max-w-2xl flex flex-col max-h-[85vh] rounded-2xl shadow-2xl border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {editInventoryId ? "Edit Inventory Item" : "Add Inventory Item"}
              </h2>
            </div>

            <form onSubmit={handleInventorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 overflow-y-auto flex-1">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Item Name</label>
                <input
                  name="name"
                  value={inventoryForm.name}
                  onChange={handleInventoryChange}
                  placeholder="e.g., Shampoo"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Description</label>
                <textarea
                  name="description"
                  value={inventoryForm.description}
                  onChange={handleInventoryChange}
                  placeholder="Item description..."
                  className="input-themed w-full px-4 py-3 rounded-xl resize-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Category</label>
                <select
                  name="category"
                  value={inventoryForm.category}
                  onChange={handleInventoryChange}
                  className="input-themed w-full px-4 py-3 rounded-xl"
                >
                  <option value="products">Products</option>
                  <option value="equipment">Equipment</option>
                  <option value="supplies">Supplies</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Supplier</label>
                <input
                  name="supplier"
                  value={inventoryForm.supplier}
                  onChange={handleInventoryChange}
                  placeholder="Supplier name"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  value={inventoryForm.quantity}
                  onChange={handleInventoryChange}
                  placeholder="0"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Low Stock Threshold</label>
                <input
                  name="lowStockThreshold"
                  type="number"
                  value={inventoryForm.lowStockThreshold}
                  onChange={handleInventoryChange}
                  placeholder="10"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Unit Price (₹)</label>
                <input
                  name="unitPrice"
                  type="number"
                  value={inventoryForm.unitPrice}
                  onChange={handleInventoryChange}
                  placeholder="0"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Status</label>
                <select
                  name="status"
                  value={inventoryForm.status}
                  onChange={handleInventoryChange}
                  className="input-themed w-full px-4 py-3 rounded-xl"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); closeInventoryModal(); }}
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
                  {editInventoryId ? "Update Item" : "Add Item"}
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
    </div>
  );
}
