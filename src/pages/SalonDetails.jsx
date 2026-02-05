import React, { useEffect, useState } from "react";

export function SalonDetails() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    timezone: "UTC",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("salonDetails");
      if (saved) setForm(JSON.parse(saved));
      else setForm((f) => ({ ...f, id: `SALON-${Math.floor(Math.random() * 9000) + 1000}` }));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const save = () => {
    localStorage.setItem("salonDetails", JSON.stringify(form));
    alert("Salon details saved (local demo).");
  };

  return (
    <div className="min-h-screen w-[100%] px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text)]">Salon Details</h1>
          <p className="text-sm text-[var(--gray-700)] mt-1">Manage your salon identity and contact information.</p>
        </header>

        <section className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Salon ID</label>
              <input name="id" value={form.id} readOnly className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] h-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Timezone</label>
              <select name="timezone" value={form.timezone} onChange={handleChange} className="w-full p-2.5 rounded border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)]">
                <option>UTC</option>
                <option>GMT</option>
                <option>EST</option>
                <option>PST</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => { try { const saved = localStorage.getItem('salonDetails'); if (saved) setForm(JSON.parse(saved)); } catch {} }} className="px-4 py-2 rounded border border-[var(--border-light)] bg-[var(--background)]">Reset</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold">Save</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default SalonDetails;
