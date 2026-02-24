import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80";
const SPA_KEYWORDS = ["spa", "wellness", "therapy", "retreat", "massage"];

const salonReviews = [
  {
    id: 1,
    name: "Riya Sharma",
    rating: 5,
    text: "Excellent haircut and styling. The attention to detail felt truly premium.",
  },
  {
    id: 2,
    name: "Aman Verma",
    rating: 5,
    text: "Super clean setup, great beard trim, and quick service with top quality.",
  },
  {
    id: 3,
    name: "Nisha Mehta",
    rating: 4,
    text: "Color service was beautifully done and matched exactly what I wanted.",
  },
];

function ratingStars(rating) {
  const full = Math.round(rating);
  const star = "\u2605";
  const empty = "\u2606";
  return `${star.repeat(full)}${empty.repeat(Math.max(0, 5 - full))}`;
}

const isSpaSalon = (item) => {
  const source = `${item?.name || ""} ${item?.address || ""}`.toLowerCase();
  return SPA_KEYWORDS.some((keyword) => source.includes(keyword));
};

export function Salon() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalons = async () => {
      setLoading(true);
      try {
        const res = await api.get("/salons/public");
        const all = Array.isArray(res.data) ? res.data : [];
        setSalons(all.filter((item) => !isSpaSalon(item)));
      } catch {
        setSalons([]);
      } finally {
        setLoading(false);
      }
    };

    loadSalons();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(salons.map((item) => item.displayStatus || item.status || "open"))],
    [salons]
  );

  const filteredServices = useMemo(() => {
    return salons.filter((salon) => {
      const text = `${salon.name || ""} ${salon.address || ""}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const salonStatus = salon.displayStatus || salon.status || "open";
      const matchCategory = category === "All" || salonStatus === category;
      return matchSearch && matchCategory;
    });
  }, [category, salons, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8fb] via-[#fffaf6] to-[#f7f1ff] px-4 py-8 text-[#2f2a30] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-[#f2e6ef] bg-white/90 p-6 shadow-[0_16px_60px_rgba(36,29,46,0.12)] sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8f7088]">
                Salon Dashboard
              </p>
              <h1 className="mt-2 font-['Playfair_Display'] text-4xl text-[#442c46] sm:text-5xl">
                Premium Salon Services
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#6f6472] sm:text-base">
                Explore salon branches, opening hours, and live open/closed status.
              </p>
            </div>
            <Link
              to="/customer-login"
              className="inline-flex items-center justify-center rounded-full bg-[#6f4f6d] px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#5d405a]"
            >
              Book Appointment
            </Link>
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl bg-[#fff8fc] p-4 sm:grid-cols-2 sm:p-5">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search salons..."
              className="w-full rounded-2xl border border-[#eadfe6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#caaec4]"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-[#eadfe6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#caaec4]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Playfair_Display'] text-3xl text-[#3f2c42]">Salons</h2>
            <p className="text-sm text-[#746776]">
              {loading ? "Loading..." : `${filteredServices.length} salons found`}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className="group overflow-hidden rounded-[1.6rem] border border-[#f0e6ee] bg-white shadow-[0_14px_35px_rgba(37,29,44,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(37,29,44,0.14)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={service.logo || FALLBACK_IMAGE}
                    alt={service.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {service.isPrimary && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#6f4f6d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                      Primary Branch
                    </span>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#2f2731]">{service.name}</h3>
                    <span className="rounded-full bg-[#f3edf3] px-3 py-1 text-xs font-medium text-[#6f4f6d]">
                      {service.displayStatus || service.status || "open"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#6f6472]">
                    <span>{service.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#be8e22]">
                      Timings: {service.openingTime || "--:--"} - {service.closingTime || "--:--"}
                    </div>
                    <Link
                      to="/customer-login"
                      className="rounded-full bg-[#6f4f6d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#5d405a]"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {!loading && filteredServices.length === 0 && (
              <p className="text-sm text-[#746776]">No salon data available.</p>
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {salonReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl border border-[#f0e6ee] bg-[#fffafc] p-6 shadow-[0_8px_30px_rgba(45,34,49,0.08)]"
            >
              <p className="text-sm font-medium text-[#b07f3f]">{ratingStars(review.rating)}</p>
              <p className="mt-3 text-sm leading-6 text-[#5f5562]">"{review.text}"</p>
              <p className="mt-4 text-sm font-semibold text-[#2f2631]">{review.name}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
