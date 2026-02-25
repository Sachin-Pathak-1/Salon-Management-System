import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, EmptyState } from "./beautyUi";
import { trendCategories, trends } from "./beautyData";

export function TrendsPage() {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return trends.filter((trend) => {
      const tabMatch = tab === "All" || trend.category === tab;
      const searchMatch = `${trend.title} ${trend.description}`.toLowerCase().includes(query.toLowerCase());
      return tabMatch && searchMatch;
    });
  }, [tab, query]);

  return (
    <div className="beauty-shell beauty-shell--trends">
      <div className="beauty-container">
        <PageHeader title="Beauty & Wellness Trends" subtitle="Modern editorials on hair, skin, grooming, spa, and wellness." />

        <div className="beauty-row" style={{ marginTop: 14, alignItems: "stretch" }}>
          <input className="beauty-input" placeholder="Search trends" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="beauty-tabs">
          {trendCategories.map((category) => (
            <button key={category} type="button" className={`beauty-tab ${tab === category ? "active" : ""}`} onClick={() => setTab(category)}>
              {category}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No articles found" subtitle="Try another search term or category." />
        ) : (
          <section className="beauty-grid" style={{ marginTop: 16 }}>
            {filtered.map((trend) => (
              <article key={trend.id} className="beauty-card">
                <img className="beauty-thumb" src={trend.image} alt={trend.title} />
                <div className="beauty-card-body">
                  {trend.trending ? <span className="beauty-tag">Trending</span> : null}
                  <h3 className="beauty-title" style={{ marginTop: 8 }}>{trend.title}</h3>
                  <p className="beauty-muted">{trend.description}</p>
                  <p className="beauty-muted" style={{ margin: "6px 0 10px" }}>By {trend.author} • {trend.date}</p>
                  <Link to={`/trends/${trend.slug}`} className="beauty-btn beauty-btn-light" style={{ textDecoration: "none" }}>Read More</Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

