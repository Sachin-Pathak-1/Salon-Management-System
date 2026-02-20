import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../api";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const EXPENSES_API = "/expenses";

const CATEGORIES = [
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "supplies", label: "Supplies" },
  { value: "equipment", label: "Equipment" },
  { value: "salary", label: "Salary" },
  { value: "maintenance", label: "Maintenance" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" }
];

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const emptyForm = {
  category: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: ""
};

export function Expenses({ activeSalon }) {
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
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [summary, setSummary] = useState({
    weeklyExpense: 0,
    monthlyExpense: 0,
    annualExpense: 0,
    totalExpense: 0
  });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  /* ================= HELPERS ================= */
  const calculateSummaries = (expensesList) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const weekly = expensesList
      .filter(e => new Date(e.date) >= weekAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    const monthly = expensesList
      .filter(e => new Date(e.date) >= monthStart)
      .reduce((sum, e) => sum + e.amount, 0);

    const annual = expensesList
      .filter(e => new Date(e.date) >= yearStart)
      .reduce((sum, e) => sum + e.amount, 0);

    const total = expensesList.reduce((sum, e) => sum + e.amount, 0);

    return {
      weeklyExpense: weekly,
      monthlyExpense: monthly,
      annualExpense: annual,
      totalExpense: total
    };
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!activeSalon) return;

    const loadData = async () => {
      try {
        const res = await api.get(`${EXPENSES_API}?salonId=${activeSalon}`);
        const expensesList = Array.isArray(res.data) ? res.data : [];
        setExpenses(expensesList);
        setSummary(calculateSummaries(expensesList));
      } catch (err) {
        console.error("LOAD DATA ERROR:", err);
        showToast("Failed to load expenses");
      }
    };

    loadData();
  }, [activeSalon]);

  /* ================= FILTER EXPENSES ================= */
  useEffect(() => {
    let filtered = expenses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    // Month filter
    if (filterMonth !== "all") {
      const [year, month] = filterMonth.split("-");
      filtered = filtered.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === parseInt(year) && 
               eDate.getMonth() + 1 === parseInt(month);
      });
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchQuery, filterCategory, filterMonth]);

  /* ================= EXPENSE OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;
    if (!activeSalon) return showToast("Select a salon first");
    if (!form.category || !form.amount || !form.date) {
      return showToast("Category, amount and date are required");
    }

    try {
      setSaving(true);

      const payload = {
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
        salonId: activeSalon
      };

      if (editingId) {
        await api.put(`${EXPENSES_API}/${editingId}`, payload);
        showToast("Expense updated");
      } else {
        await api.post(EXPENSES_API, payload);
        showToast("Expense added");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      // Reload expenses
      const res = await api.get(`${EXPENSES_API}?salonId=${activeSalon}`);
      const expensesList = Array.isArray(res.data) ? res.data : [];
      setExpenses(expensesList);
      setSummary(calculateSummaries(expensesList));
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      showToast(err.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin || !window.confirm("Delete this expense?")) return;

    try {
      await api.delete(`${EXPENSES_API}/${id}?salonId=${activeSalon}`);
      showToast("Expense deleted");

      // Reload expenses
      const res = await api.get(`${EXPENSES_API}?salonId=${activeSalon}`);
      const expensesList = Array.isArray(res.data) ? res.data : [];
      setExpenses(expensesList);
      setSummary(calculateSummaries(expensesList));
    } catch (err) {
      console.error("DELETE ERROR:", err);
      showToast(err.message || "Failed to delete expense");
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setForm({
      category: expense.category,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split("T")[0],
      description: expense.description
    });
    setShowForm(true);
  };

  /* ================= CHART DATA ================= */
  const getAvailableMonths = () => {
    const months = new Set();
    expenses.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(key);
    });
    return Array.from(months).sort().reverse();
  };

  const categoryData = useMemo(() => {
    const data = {};
    filteredExpenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + e.amount;
    });
    return CATEGORIES
      .filter(c => data[c.value])
      .map(c => ({
        name: c.label,
        value: data[c.value]
      }));
  }, [filteredExpenses]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      months.push({ 
        key,
        month: date.toLocaleDateString("en-IN", { month: "short"}),
        amount: 0 
      });
    }

    expenses.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const found = months.find(m => m.key === key);
      if (found) {
        found.amount += e.amount;
      }
    });

    return months;
  }, [expenses]);

  const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "var(--gray-100)",
        border: "1px solid var(--border-light)",
        padding: "10px 14px",
        borderRadius: "10px",
        color: "var(--text)"
      }}
    >
      <p style={{ fontWeight: 600 }}>{label}</p>
      <p>{formatCurrency(payload[0].value)}</p>
    </div>
  );
};


  /* ================= RENDER ================= */
  if (!activeSalon) {
    return (
      <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-7xl mx-auto" style={{ color: "var(--text)" }}>
          Select a salon to manage expenses.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto" style={{ color: "var(--text)" }}>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Expenses</h1>
            <p className="text-sm mt-2" style={{ opacity: 0.7 }}>
              Track salon expenses by category and date.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setForm(emptyForm);
                  setEditingId(null);
                }
              }}
              className="px-4 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {showForm ? "Cancel" : "+ Add Expense"}
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Weekly" value={summary.weeklyExpense} />
          <SummaryCard label="Monthly" value={summary.monthlyExpense} />
          <SummaryCard label="Annual" value={summary.annualExpense} />
          <SummaryCard label="Total" value={summary.totalExpense} />
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shadow-sm border"
          style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
        >
          <div>
            <label className="block text-sm font-semibold mb-2">Search</label>
            <input
              type="text"
              placeholder="Search description or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-themed px-4 py-3 rounded-xl w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-themed px-4 py-3 rounded-xl w-full"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="input-themed px-4 py-3 rounded-xl w-full"
            >
              <option value="all">All Months</option>
              {getAvailableMonths().map(month => {
                const date = new Date(`${month}-01`);
                return (
                  <option key={month} value={month}>
                    {date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {categoryData.length > 0 && (
            <div
              className="rounded-2xl p-6 shadow-sm border"
              style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
            >
              <h3 className="text-lg font-bold mb-4">Expenses by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[CATEGORIES.findIndex(c => c.label === entry.name)]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {monthlyData.length > 0 && (
            <div
              className="rounded-2xl p-6 shadow-sm border"
              style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
            >
              <h3 className="text-lg font-bold mb-4">Monthly Trends</h3>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="month" />
                  <YAxis />

                  <Tooltip content={<CustomTooltip />}
                  />

                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#expenseFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expenses Table */}
        <div
          className="rounded-2xl p-6 shadow-sm border"
          style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
        >
          <h2 className="text-xl font-bold mb-4">Expense Records ({filteredExpenses.length})</h2>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10" style={{ opacity: 0.7 }}>
              No expenses found
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-light)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-light)" }}>
                    <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Date</th>
                    <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Category</th>
                    <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Description</th>
                    <th className="p-4 text-right font-semibold" style={{ opacity: 0.7 }}>Amount</th>
                    {isAdmin && <th className="p-4 text-center font-semibold" style={{ opacity: 0.7 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, idx) => (
                    <tr
                      key={expense._id}
                      className="border-b"
                      style={{
                        borderColor: "var(--border-light)",
                        backgroundColor: idx % 2 === 0 ? "var(--background)" : "transparent"
                      }}
                    >
                      <td className="p-4">{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 rounded-lg text-white text-xs font-semibold"
                          style={{ backgroundColor: COLORS[CATEGORIES.findIndex(c => c.value === expense.category)] }}
                        >
                          {CATEGORIES.find(c => c.value === expense.category)?.label}
                        </span>
                      </td>
                      <td className="p-4">{expense.description || "-"}</td>
                      <td className="p-4 text-right font-semibold">{formatCurrency(expense.amount)}</td>
                      {isAdmin && (
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="px-3 py-1 rounded-lg text-white text-xs font-semibold mr-2 hover:opacity-90"
                            style={{ backgroundColor: "#4ECDC4" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="px-3 py-1 rounded-lg text-white text-xs font-semibold hover:opacity-90"
                            style={{ backgroundColor: "#FF6B6B" }}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EXPENSE FORM MODAL */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}>
          <div className="w-full max-w-xl rounded-2xl shadow-2xl border" style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b" style={{ borderColor: "var(--border-light)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {editingId ? "Edit Expense" : "Add Expense"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}
                className="text-2xl opacity-50 hover:opacity-100 transition-opacity"
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 p-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Amount *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-themed w-full px-4 py-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional notes"
                  className="input-themed w-full px-4 py-3 rounded-xl resize-none"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}
                  className="px-5 py-2.5 border-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ borderColor: "var(--border-light)", backgroundColor: "var(--background)" }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ backgroundColor: "var(--primary)", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Saving..." : (editingId ? "Update Expense" : "Add Expense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}>
      <div className="text-sm font-semibold" style={{ opacity: 0.7 }}>{label} Expense</div>
      <div className="text-2xl font-bold mt-2">{formatCurrency(value)}</div>
    </div>
  );
}

