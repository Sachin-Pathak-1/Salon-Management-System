import { useEffect, useMemo, useState } from "react";
import { PageHeader, ExperienceCard, EmptyState } from "./beautyUi";
import { salons as fallbackSalons } from "./beautyData";
import { fetchPublicExperiences } from "./beautyApi";

export function SalonsListingPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All");
  const [rating, setRating] = useState("All");
  const [price, setPrice] = useState("All");
  const [salons, setSalons] = useState(fallbackSalons);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const items = await fetchPublicExperiences("salon");
        if (!cancelled) { setSalons(items); }
      } catch {
        // Fail open with fallback dummy data.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const locations = useMemo(() => ["All", ...new Set(salons.map((s) => s.location.split(",")[0]))], [salons]);

  const filtered = useMemo(() => {
    return salons.filter((item) => {
      const textMatch = `${item.name} ${item.location}`.toLowerCase().includes(query.toLowerCase());
      const locationMatch = location === "All" || item.location.includes(location);
      const ratingMatch = rating === "All" || item.rating >= Number(rating);
      const priceMatch = price === "All" || (price === "low" ? item.price < 700 : price === "mid" ? item.price >= 700 && item.price < 1000 : item.price >= 1000);
      return textMatch && locationMatch && ratingMatch && priceMatch;
    });
  }, [salons, query, location, rating, price]);

  return (
    <div className="beauty-shell beauty-shell--salon">
      <div className="beauty-container">
        <PageHeader title="Premium Salon Listing" subtitle="Discover highly rated salons with transparent pricing and effortless booking." />

        <div className="beauty-filters">
          <input className="beauty-input" placeholder="Search by salon name or location" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="beauty-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((loc) => <option key={loc}>{loc}</option>)}
          </select>
          <select className="beauty-select" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option>All</option>
            <option value="4">4+ Rating</option>
            <option value="4.5">4.5+ Rating</option>
          </select>
          <select className="beauty-select" value={price} onChange={(e) => setPrice(e.target.value)}>
            <option value="All">Any Price</option>
            <option value="low">Below INR 700</option>
            <option value="mid">INR 700 - 999</option>
            <option value="high">INR 1000+</option>
          </select>
        </div>

        {loading ? <div className="beauty-empty">Loading salons...</div> : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState title="No salons found" subtitle="Try clearing filters or searching another location." />
        ) : (
          <section className="beauty-grid beauty-fade">
            {filtered.map((salon) => (
              <ExperienceCard key={salon.id} item={salon} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

