import { Link } from "react-router-dom";
import SalonCard from "../../../components/SalonCard";
import MapListSection from "../../../components/MapListSection";
import NewsletterSection from "../../../components/NewsletterSection";

export function Home() {
  return (
    <div className="bg-[var(--background)] text-[var(--text)]">
      <section className="relative min-h-[74vh] overflow-hidden pb-12">
        <img
          src="/image.png"
          alt="Luxury spa treatment"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/78" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/45 to-white/86" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-28 text-center sm:pt-32">
          <h1 className="max-w-3xl font-['Playfair_Display'] text-5xl font-medium leading-[0.95] text-[var(--secondary] sm:text-6xl lg:text-[86px]">
            Beauty, Wellness, Confidence
          </h1>

          <div className="relative z-10 mt-10 w-full max-w-[470px] translate-y-6 rounded-[2.25rem] border border-[#ece7e1] bg-white/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.10)] backdrop-blur">
            <Link
              to="/login"
              className="group flex w-full items-center justify-between rounded-full bg-[var(--primary)] px-9 py-5 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:brightness-110"
            >
              <span className="flex items-center gap-3">
                <span className="text-base opacity-90">📅</span>
                Book Your Appointment Now
              </span>
            </Link>
            <p className="mt-4 text-[10px] uppercase tracking-[0.26em] text-[var(--gray-700)]">
              Instant Confirmation � Curated Luxury Experts
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[-130px] left-1/2 h-72 w-[145%] -translate-x-1/2 rounded-[50%] bg-[var(--background)]" />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-6 text-3xl font-bold text-[var(--text)]">Browse Experiences</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 1, name: "Enrich Salon Beauty", location: "Belapur Rd, Sector 11", rating: "3.2", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60" },
            { id: 2, name: "Sunaina Glow Salon", location: "Belapur East, Mumbai", rating: "4.0", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=60" },
            { id: 3, name: "Shani", location: "Dadar, Mumbai", rating: "4.3", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60" }
          ].map((salon) => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      </section>

      <MapListSection
        salons={[
          { id: 1, name: "Enrich Salon Beauty", location: "Belapur Rd, Sector 11", rating: "3.2", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60" },
          { id: 2, name: "Urban Style Salon", location: "Andheri", rating: "2.0", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=60" },
          { id: 3, name: "Sunaina Glow Salon", location: "Belapur East", rating: "4.0", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60" }
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 mt-10">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-[var(--gray-100)]/90 p-6 shadow-xl ring-1 ring-black/5 sm:grid-cols-4">
          <div className="text-center"><h3 className="text-2xl font-bold text-[var(--text)]">10K+</h3><p className="mt-1 text-sm text-[var(--gray-700)]">Happy Customers</p></div>
          <div className="text-center"><h3 className="text-2xl font-bold text-[var(--text)]">98%</h3><p className="mt-1 text-sm text-[var(--gray-700)]">Satisfaction Rate</p></div>
          <div className="text-center"><h3 className="text-2xl font-bold text-[var(--text)]">5M+</h3><p className="mt-1 text-sm text-[var(--gray-700)]">Haircuts Done</p></div>
          <div className="text-center"><h3 className="text-2xl font-bold text-[var(--text)]">50+</h3><p className="mt-1 text-sm text-[var(--gray-700)]">Expert Stylists</p></div>
        </div>
      </section>

      <NewsletterSection />

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-[var(--primary)] px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mt-3 text-sm text-white/80">Join thousands of clients pampering themselves with Blissful Beauty Salon</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[var(--primary)] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}
