import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/services";

export function Services({ services, setServices }) {

  /* SERVICE FORM */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editId, setEditId] = useState(null);

  /* SEARCH */
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  /* BOOKING FORM */
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [custName, setCustName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  /* FETCH SERVICES */
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setServices(data);
  };

  /* ADD / UPDATE SERVICE */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      price,
      duration,
      category,
      imageUrl
    };

    if (editId) {
      await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    fetchServices();
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
    setCategory("");
    setImageUrl("");
    setEditId(null);
  };

  /* DELETE */
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchServices();
  };

  /* EDIT */
  const handleEdit = (s) => {
    setEditId(s._id);
    setName(s.name);
    setDescription(s.description);
    setPrice(s.price || "");
    setDuration(s.duration || "");
    setCategory(s.category || "");
    setImageUrl(s.imageUrl || "");
    setShowModal(true);
  };

  /* BOOK NOW */
  const handleBookNow = (service) => {
    setSelectedService(service);
    setShowBooking(true);
  };

  const submitBooking = (e) => {
    e.preventDefault();
    alert("Appointment booked successfully!");
    setShowBooking(false);
    setCustName("");
    setPhone("");
    setDate("");
    setTime("");
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="min-h-screen w-full bg-(--background) px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-center text-4xl font-bold">
          Beauty & Wellness Services
        </h1>

        <p className="text-center opacity-80 max-w-2xl mx-auto mt-3">
          Explore our professional salon services and premium treatments.
        </p>

        <div className="flex justify-center gap-4 mt-8">

          <input
            placeholder="Search service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-3 rounded-xl w-64"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-(--primary) text-white px-6 py-3 rounded-xl"
          >
            + Add Service
          </button>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 mt-12">

          {filteredServices.map((s, index) => (

            <div key={s._id}
              className="bg-(--gray-100) border rounded-xl p-8">

              <div className="w-12 h-12 rounded-full bg-(--primary)
                              text-white flex items-center justify-center mx-auto mb-4">
                {index + 1}
              </div>

              {s.imageUrl && (
                <img
                  src={s.imageUrl}
                  alt={s.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="text-center font-semibold">{s.name}</h3>

              <p className="text-center opacity-80 mt-2">
                {s.description}
              </p>

              <p className="text-center mt-2">
                💰 ₹{s.price || "N/A"} | ⏱ {s.duration || "N/A"} mins
              </p>

              <p className="text-center text-sm opacity-70">
                Category: {s.category || "General"}
              </p>

              <div className="flex justify-center gap-4 mt-6">

                <button
                  onClick={() => handleBookNow(s)}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg"
                >
                  Book Now
                </button>

                <button
                  onClick={() => handleEdit(s)}
                  className="bg-(--primary) text-white px-6 py-2 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(s._id)}
                  className="bg-[#e5e7eb] text-blue-600 px-6 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* SERVICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-(--gray-100) w-95 p-8 rounded-xl">

            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Service" : "Add Service"}
            </h2>

            <form onSubmit={handleSubmit}>

              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Service Name"
                className="w-full mb-3 p-3 border rounded-lg" />

              <textarea value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full mb-3 p-3 border rounded-lg" />

              <input value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Price"
                className="w-full mb-3 p-3 border rounded-lg" />

              <input value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="Duration (minutes)"
                className="w-full mb-3 p-3 border rounded-lg" />

              <input value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full mb-3 p-3 border rounded-lg" />

              <input value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Image URL"
                className="w-full mb-4 p-3 border rounded-lg" />

              <div className="flex justify-end gap-4">

                <button type="button"
                  onClick={() => { resetForm(); setShowModal(false); }}
                  className="border px-5 py-2 rounded-lg">
                  Cancel
                </button>

                <button type="submit"
                  className="bg-(--primary) text-white px-6 py-2 rounded-lg">
                  Save
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* BOOKING MODAL */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-(--gray-100) w-95 p-8 rounded-xl">

            <h2 className="text-xl font-bold mb-4">
              Book: {selectedService?.name}
            </h2>

            <form onSubmit={submitBooking}>

              <input
                placeholder="Your Name"
                value={custName}
                onChange={e => setCustName(e.target.value)}
                required
                className="w-full mb-3 p-3 border rounded-lg"
              />

              <input
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full mb-3 p-3 border rounded-lg"
              />

              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full mb-3 p-3 border rounded-lg"
              />

              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
                className="w-full mb-6 p-3 border rounded-lg"
              />

              <div className="flex justify-end gap-4">

                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="border px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg"
                >
                  Confirm Booking
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
