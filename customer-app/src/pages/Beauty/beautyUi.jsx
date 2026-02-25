import React from "react";
import { Link } from "react-router-dom";

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111 5.518.442c.499.04.701.663.321.988l-4.204 3.602 1.285 5.38a.562.562 0 01-.84.61L12 16.902l-4.725 2.73a.562.562 0 01-.84-.61l1.285-5.38-4.204-3.602a.562.562 0 01.321-.988l5.518-.442 2.125-5.111z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconCurrency() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 6H9a3 3 0 100 6h6a3 3 0 110 6H7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
    </svg>
  );
}

export function RatingStars({ value }) {
  const full = Math.round(value);
  return (
    <div style={{ color: "var(--accent)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: 6 }} aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: full }).map((_, index) => <IconStar key={`full-${index}`} />)}
      <span className="beauty-muted">{value}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <section className="beauty-hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}

export function ExperienceCard({ item, primaryLabel = "Book Now", secondaryLabel = "View Details" }) {
  return (
    <article className="beauty-card">
      <img className="beauty-thumb" src={item.images[0]} alt={item.name} />
      <div className="beauty-card-body">
        <div className="beauty-row">
          <h3 className="beauty-title">{item.name}</h3>
          <p style={{ margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <IconCurrency /> From INR {item.price}
          </p>
        </div>
        <p className="beauty-muted" style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: 6 }}><IconMapPin /> {item.location}</p>
        <RatingStars value={item.rating} />
        <div className="beauty-tags">
          {item.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="beauty-tag">{tag}</span>
          ))}
        </div>
        <div className="beauty-row" style={{ marginTop: 12 }}>
          <Link to={`/experiences/${item.type}/${item.slug}`} className="beauty-btn beauty-btn-light" style={{ textDecoration: "none" }}>
            {secondaryLabel}
          </Link>
          <Link to="/customer/appointments/new" className="beauty-btn beauty-btn-primary" style={{ textDecoration: "none" }}>
            {primaryLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="beauty-empty">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ marginBottom: 0 }}>{subtitle}</p>
    </div>
  );
}

