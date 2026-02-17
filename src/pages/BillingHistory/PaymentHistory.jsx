import { useEffect, useMemo, useState } from "react";
import api from "../../api.js";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBilling = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/plans/billing-history");
        setPayments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setPayments([]);
        setError(err?.response?.data?.message || "Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-IN");
  };

  const rows = useMemo(
    () =>
      payments.map((p, idx) => ({
        id: p.id || idx + 1,
        billFor: p.billFor || "Plan Subscription",
        issueDate: formatDate(p.issueDate),
        dueDate: formatDate(p.dueDate),
        total: Number(p.total) || 0,
        status: p.status || "Paid"
      })),
    [payments]
  );

  return (
    <div className="min-h-screen w-full px-6 md:px-10 py-10" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto" style={{ color: "var(--text)" }}>
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Payment History</h1>
          <p className="opacity-80">Here is your account payment history.</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500">{error}</div>
        )}

        <div
          className="border rounded-xl p-6"
          style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-56.25">
              <thead>
                <tr className="border-b opacity-70" style={{ borderColor: "var(--border-light)" }}>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Bill For</th>
                  <th className="text-left p-3">Issue Date</th>
                  <th className="text-left p-3">Due Date</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6" className="text-center p-6 opacity-60">
                      Loading payments...
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-6 opacity-60">
                      No payments found
                    </td>
                  </tr>
                )}

                {rows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-black/5 transition"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <td className="p-3">#{p.id}</td>
                    <td className="p-3">{p.billFor}</td>
                    <td className="p-3">{p.issueDate}</td>
                    <td className="p-3">{p.dueDate}</td>

                    <td className="p-3 font-semibold">Rs. {p.total.toLocaleString("en-IN")}</td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                          ${p.status === "Paid"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : p.status === "Due"
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                      >
                        {p.status}
                      </span>
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
