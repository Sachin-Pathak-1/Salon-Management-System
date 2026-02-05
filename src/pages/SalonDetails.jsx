import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/salons";

export function SalonDetails() {

  const [salonId, setSalonId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    ownerName: "",
    openingTime: "",
    closingTime: "",
    logo: ""
  });

  /* ============================
     LOAD SALON FROM BACKEND
  ============================ */
  useEffect(() => {
    fetchSalon();
  }, []);

  const fetchSalon = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data.length > 0) {
        const salon = data[0];        // using first salon
        setSalonId(salon._id);
        setForm({
          name: salon.name || "",
          address: salon.address || "",
          contact: salon.contact || "",
          email: salon.email || "",
          ownerName: salon.ownerName || "",
          openingTime: salon.openingTime || "",
          closingTime: salon.closingTime || "",
          logo: salon.logo || ""
        });
      }
    } catch (err) {
      console.log("Failed to load salon");
    }
  };

  /* ============================
     HANDLE INPUT CHANGE
  ============================ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ============================
     SAVE SALON
  ============================ */
  const save = async () => {
    try {
      if (salonId) {
        // UPDATE
        await fetch(`${API_URL}/${salonId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        alert("Salon updated successfully");

      } else {
        // CREATE
        await fetch(`${API_URL}/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        alert("Salon created successfully");
      }

      fetchSalon();

    } catch (err) {
      alert("Failed to save salon");
    }
  };

  return (

    <div className="min-h-screen w-[100%] px-4 py-10">

      <div className="max-w-4xl mx-auto">

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text)]">
            Salon Details
          </h1>
          <p className="text-sm text-[var(--gray-700)] mt-1">
            Manage your salon identity and contact information.
          </p>
        </header>

        <section className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >

            <div>
              <label className="block text-sm mb-1">Salon Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2.5 rounded border bg-[var(--background)]"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full p-2.5 rounded border bg-[var(--background)] h-20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm mb-1">Contact</label>
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded border bg-[var(--background)]"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded border bg-[var(--background)]"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm mb-1">Owner Name</label>
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                className="w-full p-2.5 rounded border bg-[var(--background)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm mb-1">Opening Time</label>
                <input
                  name="openingTime"
                  value={form.openingTime}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded border bg-[var(--background)]"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Closing Time</label>
                <input
                  name="closingTime"
                  value={form.closingTime}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded border bg-[var(--background)]"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm mb-1">Logo URL</label>
              <input
                name="logo"
                value={form.logo}
                onChange={handleChange}
                className="w-full p-2.5 rounded border bg-[var(--background)]"
              />
            </div>

            {form.logo && (
              <img
                src={form.logo}
                alt="logo"
                className="w-32 h-32 object-cover rounded mt-3"
              />
            )}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={fetchSalon}
                className="px-4 py-2 rounded border bg-[var(--background)]"
              >
                Reset
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold"
              >
                Save
              </button>

            </div>

          </form>

        </section>

      </div>

    </div>
  );
}

export default SalonDetails;
