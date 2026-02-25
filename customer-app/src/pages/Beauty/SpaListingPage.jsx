import { useEffect, useMemo, useState } from "react";
import { PageHeader, ExperienceCard, EmptyState } from "./beautyUi";
import { spas as fallbackSpas } from "./beautyData";
import { fetchPublicExperiences } from "./beautyApi";

export function SpaListingPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState("All");
  const [spas, setSpas] = useState(fallbackSpas);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const items = await fetchPublicExperiences("spa");
        if (!cancelled) { setSpas(items); }
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

  const categories = useMemo(() => ["All", ...new Set(spas.map((s) => s.category))], [spas]);

  const filtered = useMemo(() => {
    return spas.filter((item) => {
      const categoryMatch = category === "All" || item.category === category;
      const textMatch = `${item.name} ${item.location} ${item.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const ratingMatch = minRating === "All" || item.rating >= Number(minRating);
      return categoryMatch && textMatch && ratingMatch;
    });
  }, [spas, category, search, minRating]);

  return (
    <div className="beauty-shell beauty-shell--spa">
      <div className="beauty-container">
        <PageHeader title="Calm Spa Experiences" subtitle="Filter by spa category and compare premium recovery rituals." />

        <div className="beauty-filters">
          <input className="beauty-input" placeholder="Search spa, service or location" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="beauty-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
          <select className="beauty-select" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option>All</option>
            <option value="4">4+ Rating</option>
            <option value="4.5">4.5+ Rating</option>
          </select>
          <div className="beauty-muted" style={{ display: "grid", placeItems: "center", border: "1px solid var(--beauty-border)", borderRadius: 14, background: "var(--background)" }}>
            {filtered.length} spas
          </div>
        </div>

        {loading ? <div className="beauty-empty">Loading spas...</div> : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState title="No spas match these filters" subtitle="Try selecting another category or reducing rating limits." />
        ) : (
          <section className="beauty-grid beauty-fade">
            {filtered.map((spa) => (
              <ExperienceCard key={spa.id} item={spa} primaryLabel="Explore Spa" secondaryLabel="View Details" />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

