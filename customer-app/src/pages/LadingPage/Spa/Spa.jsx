import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80";
const SPA_KEYWORDS = ["spa", "wellness", "therapy", "retreat", "massage"];

const spaRatings = [
  { id: 1, title: "Ambience", value: 4.9 },
  { id: 2, title: "Therapist Skill", value: 4.8 },
  { id: 3, title: "Hygiene", value: 4.9 },
  { id: 4, title: "Relaxation", value: 4.7 },
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

export function Spa() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [spaSalons, setSpaSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpas = async () => {
      setLoading(true);
      try {
        const res = await api.get("/salons/public");
        const all = Array.isArray(res.data) ? res.data : [];
        setSpaSalons(all.filter(isSpaSalon));
      } catch {
        setSpaSalons([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpas();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(spaSalons.map((item) => item.displayStatus || item.status || "open"))],
    [spaSalons]
  );

  const filteredServices = useMemo(() => {
    return spaSalons.filter((service) => {
      const text = `${service.name || ""} ${service.address || ""}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const status = service.displayStatus || service.status || "open";
      const matchCategory = category === "All" || status === category;
      return matchSearch && matchCategory;
    });
  }, [category, search, spaSalons]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fffd] via-[#f4fcff] to-[#f4f8ff] px-4 py-8 text-[#223433] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-[#dcefeb] bg-white/90 p-6 shadow-[0_16px_60px_rgba(28,70,65,0.12)] sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#4f8b84]">
                Spa Dashboard
              </p>
              <h1 className="mt-2 font-['Playfair_Display'] text-4xl text-[#2f5f5b] sm:text-5xl">
                Holistic Spa Therapies
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#5f7572] sm:text-base">
                Browse spa branches with timings and live availability status.
              </p>
            </div>
            <Link
              to="/customer-login"
              className="inline-flex items-center justify-center rounded-full bg-[#2f5f5b] px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#274e4b]"
            >
              Book Appointment
            </Link>
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl bg-[#f6fcfb] p-4 sm:grid-cols-2 sm:p-5">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search spa branches..."
              className="w-full rounded-2xl border border-[#dcefeb] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#93c2bb]"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-[#dcefeb] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#93c2bb]"
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
            <h2 className="font-['Playfair_Display'] text-3xl text-[#2a5753]">Spas</h2>
            <p className="text-sm text-[#57706d]">
              {loading ? "Loading..." : `${filteredServices.length} spa branches found`}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className="group overflow-hidden rounded-[1.6rem] border border-[#dcefeb] bg-white shadow-[0_14px_35px_rgba(31,75,70,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(31,75,70,0.14)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={service.logo || FALLBACK_IMAGE}
                    alt={service.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {service.isPrimary && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#2f5f5b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                      Primary Branch
                    </span>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#274946]">{service.name}</h3>
                    <span className="rounded-full bg-[#e6f3f0] px-3 py-1 text-xs font-medium text-[#2f5f5b]">
                      {service.displayStatus || service.status || "open"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#5f7572]">
                    <span>{service.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#be8e22]">
                      Timings: {service.openingTime || "--:--"} - {service.closingTime || "--:--"}
                    </div>
                    <Link
                      to="/customer-login"
                      className="rounded-full bg-[#2f5f5b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#274e4b]"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {!loading && filteredServices.length === 0 && (
              <p className="text-sm text-[#57706d]">No spa data available.</p>
            )}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#dcefeb] bg-[#f6fcfb] p-6 shadow-[0_8px_30px_rgba(30,76,70,0.10)]">
          <h3 className="font-['Playfair_Display'] text-2xl text-[#224945]">Spa Ratings</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {spaRatings.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-4">
                <p className="text-sm text-[#54736f]">{item.title}</p>
                <p className="mt-1 text-lg font-semibold text-[#224945]">
                  {item.value.toFixed(1)} / 5.0
                </p>
                <p className="text-sm text-[#be8e22]">{ratingStars(item.value)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
