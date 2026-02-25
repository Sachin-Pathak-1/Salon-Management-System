import { Link, Navigate, useParams } from "react-router-dom";
import { trends } from "./beautyData";

export function TrendDetailsPage() {
  const { slug } = useParams();
  const trend = trends.find((entry) => entry.slug === slug);

  if (!trend) {
    return <Navigate to="/trends" replace />;
  }

  const related = trends.filter((entry) => entry.slug !== slug && entry.category === trend.category).slice(0, 3);

  return (
    <div className="beauty-shell beauty-shell--trends">
      <div className="beauty-container">
        <article className="beauty-panel">
          <div className="beauty-panel-body">
            <img className="beauty-blog-cover" src={trend.image} alt={trend.title} />
            <h1 style={{ marginBottom: 6 }}>{trend.title}</h1>
            <p className="beauty-muted">By {trend.author} • {trend.date}</p>
            <div className="beauty-tags">
              <button type="button" className="beauty-btn beauty-btn-light">Share X</button>
              <button type="button" className="beauty-btn beauty-btn-light">Share LinkedIn</button>
              <button type="button" className="beauty-btn beauty-btn-light">Copy Link</button>
            </div>
            <p style={{ marginTop: 14, lineHeight: 1.75 }}>
              {trend.content} This article covers practical habits, service pairings, and product choices suited for urban beauty routines.
              Consistency and expert guidance are key to long-term results.
            </p>
          </div>
        </article>

        <section className="beauty-panel" style={{ marginTop: 16 }}>
          <div className="beauty-panel-body">
            <h2 style={{ marginTop: 0 }}>Related Posts</h2>
            <div className="beauty-grid" style={{ marginTop: 12 }}>
              {related.map((post) => (
                <Link key={post.id} to={`/trends/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <article className="beauty-card">
                    <img className="beauty-thumb" src={post.image} alt={post.title} />
                    <div className="beauty-card-body">
                      <h3 className="beauty-title">{post.title}</h3>
                      <p className="beauty-muted" style={{ marginBottom: 0 }}>{post.description}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

