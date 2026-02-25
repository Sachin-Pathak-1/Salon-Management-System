import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { allExperiences, reviews, servicesByType } from "./beautyData";
import { fetchPublicExperiences } from "./beautyApi";
import { RatingStars } from "./beautyUi";
import { InlineBookingWidget } from "./InlineBookingWidget";

export function ExperienceDetailsPage() {
  const { type, slug } = useParams();
  const [searchParams] = useSearchParams();
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState(allExperiences);
  const [loaded, setLoaded] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [preselectedServiceName, setPreselectedServiceName] = useState("");
  const [bookingScrollTick, setBookingScrollTick] = useState(0);
  const bookingSectionRef = useRef(null);

  const triggerBookingScroll = () => {
    setShowBooking(true);
    setBookingScrollTick((tick) => tick + 1);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const apiItems = await fetchPublicExperiences(type);
        if (!cancelled && apiItems.length > 0) {
          setItems((prev) => {
            const next = [...apiItems];
            const prevFallback = prev.filter((entry) => entry.type === type);
            if (next.length === 0) return prevFallback;
            return next;
          });
        }
      } catch {
        // Keep fallback dummy data.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const item = useMemo(() => items.find((entry) => entry.type === type && entry.slug === slug), [items, type, slug]);
  const similar = useMemo(() => items.filter((entry) => entry.type === type && entry.slug !== slug).slice(0, 4), [items, type, slug]);

  useEffect(() => {
    const shouldOpenBooking = searchParams.get("book") === "1";
    setShowBooking(shouldOpenBooking);
    if (!shouldOpenBooking) {
      setPreselectedServiceName("");
    }
  }, [searchParams, type, slug]);

  useEffect(() => {
    if (!showBooking) return;

    const scrollToBooking = (behavior = "smooth") => {
      if (!bookingSectionRef.current) return;
      const navbarOffset = 90;
      const top = bookingSectionRef.current.getBoundingClientRect().top + window.scrollY - navbarOffset;
      window.scrollTo({ top: Math.max(top, 0), behavior });
    };

    // First scroll after opening booking block.
    requestAnimationFrame(() => scrollToBooking("smooth"));

    // Second pass after layout settles to avoid landing above target.
    const settleTimer = setTimeout(() => {
      scrollToBooking("smooth");
    }, 260);

    return () => clearTimeout(settleTimer);
  }, [showBooking, bookingScrollTick]);

  if (loaded && !item) {
    return <Navigate to={type === "spa" ? "/spas" : "/salons"} replace />;
  }

  if (!item) {
    return <div className="beauty-shell"><div className="beauty-container"><div className="beauty-empty">Loading details...</div></div></div>;
  }

  const services = servicesByType[type] || [];

  return (
    <div className="beauty-shell">
      <div className="beauty-container">
        <section className="beauty-hero">
          <h1>{item.name}</h1>
          <div className="beauty-row" style={{ marginTop: 8, justifyContent: "flex-start", gap: 14 }}>
            <RatingStars value={item.rating} />
            <span className="beauty-muted">{item.reviewsCount} reviews</span>
            <span className="beauty-muted">{item.location}</span>
          </div>
        </section>

        <div className="beauty-detail-grid">
          <div>
            <article className="beauty-panel">
              <div className="beauty-panel-body">
                <div className="beauty-gallery">
                  <img src={item.images[index]} alt={`${item.name} view ${index + 1}`} />
                  <button type="button" className="beauty-btn beauty-btn-light prev" onClick={() => setIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1))}>Prev</button>
                  <button type="button" className="beauty-btn beauty-btn-light next" onClick={() => setIndex((prev) => (prev + 1) % item.images.length)}>Next</button>
                </div>
                <div className="beauty-tags">
                  {item.images.map((image, imageIndex) => (
                    <button key={image} className="beauty-btn beauty-btn-light" style={{ border: imageIndex === index ? "1px solid #8e5b35" : undefined }} onClick={() => setIndex(imageIndex)} type="button">
                      {imageIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <article className="beauty-panel" style={{ marginTop: 16 }}>
              <div className="beauty-panel-body">
                <h2 style={{ marginTop: 0 }}>About</h2>
                <p className="beauty-muted">{item.about}</p>
                <h3>Address & Map</h3>
                <p className="beauty-muted">{item.address}</p>
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" alt="Map preview" style={{ width: "100%", height: 170, objectFit: "cover", borderRadius: 14, border: "1px solid var(--beauty-border)" }} />
              </div>
            </article>

            <article className="beauty-panel" style={{ marginTop: 16 }}>
              <div className="beauty-panel-body">
                <h2 style={{ marginTop: 0 }}>Services</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {services.map((service) => (
                    <div key={service.id} className="beauty-service">
                      <div>
                        <strong>{service.name}</strong>
                        <p className="beauty-muted" style={{ margin: "4px 0 0" }}>{service.duration}</p>
                      </div>
                      <div className="beauty-row" style={{ gap: 10 }}>
                        <strong>INR {service.price}</strong>
                        <button
                          type="button"
                          className="beauty-btn beauty-btn-primary"
                          onClick={() => {
                            setPreselectedServiceName(service.name);
                            triggerBookingScroll();
                          }}
                        >
                          Add / Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <div id="booking-section" ref={bookingSectionRef}>
              <InlineBookingWidget
                experience={item}
                open={showBooking}
                preselectedServiceName={preselectedServiceName}
              />
            </div>

            <article className="beauty-panel" style={{ marginTop: 16 }}>
              <div className="beauty-panel-body">
                <h2 style={{ marginTop: 0 }}>Customer Reviews</h2>
                <div className="beauty-reviews">
                  {reviews.map((review) => (
                    <div key={review.id} className="beauty-service" style={{ display: "block" }}>
                      <strong>{review.name}</strong>
                      <RatingStars value={review.rating} />
                      <p className="beauty-muted" style={{ marginBottom: 0 }}>{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="beauty-panel" style={{ marginTop: 16 }}>
              <div className="beauty-panel-body">
                <h2 style={{ marginTop: 0 }}>Similar {type === "spa" ? "Spas" : "Salons"}</h2>
                <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(240px,1fr)", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                  {similar.map((entry) => (
                    <Link key={entry.id} to={`/experiences/${entry.type}/${entry.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <article className="beauty-card">
                        <img className="beauty-thumb" src={entry.images[0]} alt={entry.name} />
                        <div className="beauty-card-body">
                          <h3 className="beauty-title">{entry.name}</h3>
                          <p className="beauty-muted" style={{ marginBottom: 0 }}>{entry.location}</p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <aside className="beauty-panel beauty-sticky">
            <div className="beauty-panel-body">
              <h3 style={{ marginTop: 0 }}>Quick Booking</h3>
              <p className="beauty-muted">Starting at INR {item.price}</p>
              <ul className="beauty-muted" style={{ paddingLeft: 18 }}>
                <li>Instant confirmation</li>
                <li>Free reschedule up to 4 hours before</li>
                <li>Reward points on every booking</li>
              </ul>
              <button
                type="button"
                className="beauty-btn beauty-btn-primary"
                onClick={triggerBookingScroll}
              >
                Book Appointment
              </button>
            </div>
          </aside>
        </div>

        <div className="beauty-mobile-book">
          <button
            type="button"
            onClick={triggerBookingScroll}
            className="beauty-btn beauty-btn-primary"
            style={{ width: "100%", display: "block", textAlign: "center" }}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
