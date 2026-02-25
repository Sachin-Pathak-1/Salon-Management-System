import { useMemo, useState } from "react";
import { PageHeader, EmptyState } from "./beautyUi";
import { offers } from "./beautyData";

const TODAY = new Date("2026-02-24");

export function OffersPage() {
  const [discount, setDiscount] = useState("All");
  const [category, setCategory] = useState("All");
  const [expiringSoon, setExpiringSoon] = useState(false);

  const categories = useMemo(() => ["All", ...new Set(offers.map((offer) => offer.category))], []);

  const filtered = useMemo(() => {
    return offers.filter((offer) => {
      const discountMatch = discount === "All" || offer.discount >= Number(discount);
      const categoryMatch = category === "All" || offer.category === category;
      const validDate = new Date(offer.validTill);
      const nearExpiry = !expiringSoon || (validDate.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24) <= 14;
      return discountMatch && categoryMatch && nearExpiry;
    });
  }, [discount, category, expiringSoon]);

  return (
    <div className="beauty-shell beauty-shell--offers">
      <div className="beauty-container">
        <PageHeader title="Offers & Discounts" subtitle="Claim premium beauty deals before they expire." />

        <div className="beauty-filters" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
          <select className="beauty-select" value={discount} onChange={(e) => setDiscount(e.target.value)}>
            <option>All</option>
            <option value="20">20%+ Off</option>
            <option value="30">30%+ Off</option>
            <option value="40">40%+ Off</option>
          </select>
          <select className="beauty-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
          <label className="beauty-select" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={expiringSoon} onChange={(e) => setExpiringSoon(e.target.checked)} />
            Expiring Soon
          </label>
          <div className="beauty-muted" style={{ display: "grid", placeItems: "center" }}>{filtered.length} offers</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No offers found" subtitle="Try changing discount or category filters." />
        ) : (
          <section className="beauty-grid">
            {filtered.map((offer) => (
              <article key={offer.id} className="beauty-card beauty-offer-wrap">
                <div className="beauty-ribbon">{offer.discount}% OFF</div>
                <img className="beauty-thumb" src={offer.image} alt={offer.title} />
                <div className="beauty-card-body">
                  <h3 className="beauty-title">{offer.title}</h3>
                  <p className="beauty-muted" style={{ margin: "6px 0" }}>{offer.venueName}</p>
                  <p className="beauty-muted" style={{ margin: "6px 0" }}>Valid till {offer.validTill}</p>
                  <button className="beauty-btn beauty-btn-primary" type="button">Claim Offer</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

