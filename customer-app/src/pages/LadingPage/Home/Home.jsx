<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";

const SALON_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80";
const SPA_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80";

const SPA_KEYWORDS = ["spa", "wellness", "therapy", "retreat", "massage"];

const isSpaSalon = (item) => {
  const source = `${item?.name || ""} ${item?.address || ""}`.toLowerCase();
  return SPA_KEYWORDS.some((keyword) => source.includes(keyword));
};

export function Home() {
  const [salons, setSalons] = useState([]);

  useEffect(() => {
    const loadSalons = async () => {
      try {
        const res = await api.get("/salons/public");
        setSalons(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSalons([]);
      }
    };

    loadSalons();
  }, []);

  const { premiumSalons, luxurySpas } = useMemo(() => {
    const spaList = salons.filter(isSpaSalon).slice(0, 3);
    const salonList = salons.filter((item) => !isSpaSalon(item)).slice(0, 3);
    return { premiumSalons: salonList, luxurySpas: spaList };
  }, [salons]);

=======
import { Link } from "react-router-dom";
import SalonCard from "../../../components/SalonCard";
import MapListSection from "../../../components/MapListSection";
import ServiceCard from "../../../components/ServiceCard";
import NewsletterSection from "../../../components/NewsletterSection";

export function Home() {
>>>>>>> a0a3800945a13170daa2785e86c7a76050b2c68a
  return (
    <div className="bg-[var(--background)] text-[var(--text)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)] via-[var(--gray-100)] to-[color:var(--primary)]/10" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-semibold">
              Beauty. Wellness. Confidence.
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Welcome to{" "}
              <span className="text-[var(--primary)]">Blissful Beauty Salon</span>
            </h1>
            <p className="mt-5 text-lg text-[var(--gray-700)]">
              Indulge in luxury and beauty with our premium salon services
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-light)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--hover-bg)]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
=======
      {/* Browse Experiences Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold mb-6 text-[var(--text)]">Browse Experiences</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 1, name: 'Enrich Salon Beauty', location: 'Belapur Rd, Sector 11', rating: '3.2' ,image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Fsb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'},
            { id: 2, name: 'Sunaina Glow Salon', location: 'Belapur East, Mumbai', rating: '4.0' , image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Fsb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'},
            { id: 3, name: 'Shani', location: 'Dadar, Mumbai', rating: '4.3' , image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Fsb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'},
          ].map(salon => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      </section>

      {/* Map & Nearby Salons Section */}
      <MapListSection salons={[
        { id: 1, name: 'Enrich Salon Beauty', location: 'Belapur Rd, Sector 11', rating: '3.2' ,image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Fsb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'},
        { id: 2, name: 'Urban Style Salon', location: 'Andheri', rating: '2.0' ,image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Fsb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'},
        { id: 3, name: 'Sunaina Glow Salon', location: 'Belapur East', rating: '4.0' ,image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Fsb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'}
      ]} />

>>>>>>> a0a3800945a13170daa2785e86c7a76050b2c68a
      {/* Stats Section */}
      <section className="mx-auto max-w-6xl px-6 mt-10">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-[var(--gray-100)]/90 p-6 shadow-xl ring-1 ring-black/5 sm:grid-cols-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[var(--text)]">10K+</h3>
            <p className="mt-1 text-sm text-[var(--gray-700)]">Happy Customers</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[var(--text)]">98%</h3>
            <p className="mt-1 text-sm text-[var(--gray-700)]">Satisfaction Rate</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[var(--text)]">5M+</h3>
            <p className="mt-1 text-sm text-[var(--gray-700)]">Haircuts Done</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[var(--text)]">50+</h3>
            <p className="mt-1 text-sm text-[var(--gray-700)]">Expert Stylists</p>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Mumbai Map Section */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold">Map of Mumbai</h2>
          <p className="hidden text-sm text-[var(--gray-700)] sm:block">
            Find beauty destinations around the city
          </p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-[var(--border-light)] shadow-lg ring-1 ring-black/5">
          <iframe
            title="Mumbai map"
            src="https://www.google.com/maps?q=Mumbai&z=11&output=embed"
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      {/* Premium Salons Near You */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-3xl font-bold">Premium Salons Near You</h2>
          <Link
            to="/lpservices"
            className="hidden text-sm font-semibold text-[var(--primary)] hover:underline sm:block"
          >
            View all services
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {premiumSalons.map((salon) => (
            <article
              key={salon._id}
              className="overflow-hidden rounded-2xl bg-[var(--gray-100)] shadow-lg ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={salon.logo || SALON_FALLBACK_IMAGE}
                alt={salon.name}
                className="h-52 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold">{salon.name}</h3>
                <p className="mt-1 text-sm text-[var(--gray-700)]">{salon.address}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text)]">
                    Status: {salon.displayStatus || salon.status || "Open"}
                  </p>
                  <Link
                    to="/login"
                    className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {premiumSalons.length === 0 && (
            <p className="text-sm text-[var(--gray-700)]">No salons available right now.</p>
          )}
        </div>
      </section>

      {/* Signature Section */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl bg-[var(--gray-100)]/90 p-8 shadow-lg ring-1 ring-black/5 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
              Signature Section
            </p>
            <h2 className="mt-3 text-3xl font-bold">Crafted Luxury Experiences</h2>
            <p className="mt-3 text-sm text-[var(--gray-700)]">
              Our signature rituals blend modern techniques with personalized care,
              giving you a premium end-to-end salon and spa experience.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-[var(--background)] p-5 shadow ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">Signature Hair Artistry</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Precision cut, styling consultation, and finish for a complete look.
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--background)] p-5 shadow ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">Radiance Skin Ritual</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Deep cleanse, glow mask, and hydration therapy for luminous skin.
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--background)] p-5 shadow ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">Aroma Wellness Escape</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Curated aroma oils with calming massage to unwind and reset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Spas Near You */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-3xl font-bold">Luxury Spas Near You</h2>
          <Link
            to="/spa"
            className="hidden text-sm font-semibold text-[var(--primary)] hover:underline sm:block"
          >
            Explore spa options
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {luxurySpas.map((spa) => (
            <article
              key={spa._id}
              className="overflow-hidden rounded-2xl bg-[var(--gray-100)] shadow-lg ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img src={spa.logo || SPA_FALLBACK_IMAGE} alt={spa.name} className="h-52 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-lg font-semibold">{spa.name}</h3>
                <p className="mt-1 text-sm text-[var(--gray-700)]">{spa.address}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text)]">
                    Status: {spa.displayStatus || spa.status || "Open"}
                  </p>
                  <Link
                    to="/login"
                    className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {luxurySpas.length === 0 && (
            <p className="text-sm text-[var(--gray-700)]">No spas available right now.</p>
          )}
        </div>
      </section>

=======
>>>>>>> a0a3800945a13170daa2785e86c7a76050b2c68a
      {/* Testimonials Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-3xl font-bold">What Our Clients Say</h2>
          <p className="hidden text-sm text-[var(--gray-700)] sm:block">
            Loved by clients across the city
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-lg ring-1 ring-black/5">
            <div className="text-[var(--primary)]">★★★★★</div>
            <p className="mt-4 text-sm text-[var(--gray-700)]">
              "Blissful Beauty Salon transformed my look completely. The stylists
              are incredibly skilled and the atmosphere is so relaxing. I always
              leave feeling beautiful and confident!"
            </p>
            <p className="mt-4 text-sm font-semibold text-[var(--text)]">
              - Sarah Johnson
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-lg ring-1 ring-black/5">
            <div className="text-[var(--primary)]">★★★★★</div>
            <p className="mt-4 text-sm text-[var(--gray-700)]">
              "The best salon experience I've ever had. From the moment I walked
              in, I felt pampered and cared for. Their attention to detail and
              professional service is unmatched."
            </p>
            <p className="mt-4 text-sm font-semibold text-[var(--text)]">
              - Emily Chen
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-lg ring-1 ring-black/5">
            <div className="text-[var(--primary)]">★★★★★</div>
            <p className="mt-4 text-sm text-[var(--gray-700)]">
              "I've been coming here for years and they never disappoint. The
              team stays up-to-date with the latest trends and techniques.
              Highly recommend their coloring services!"
            </p>
            <p className="mt-4 text-sm font-semibold text-[var(--text)]">
              - Maria Rodriguez
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-3xl font-bold">Our Work</h2>
          <p className="hidden text-sm text-[var(--gray-700)] sm:block">
            Signature treatments & artistry
          </p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">
              ✂️
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Hair Styling</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Professional cuts and styling for every occasion, from casual
                looks to elegant updos.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">
              💅
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Nail Care</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Beautiful manicures and pedicures with the finest products and
                expert techniques.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">
              🎨
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Hair Coloring</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Expert color services including highlights, balayage, and full
                color transformations.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">
              🧴
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Spa Treatments</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">
                Luxurious facials and body treatments for ultimate relaxation
                and rejuvenation.
              </p>
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
=======
      {/* Newsletter Section */}
      <NewsletterSection />

>>>>>>> a0a3800945a13170daa2785e86c7a76050b2c68a
      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-[var(--primary)] px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mt-3 text-sm text-white/80">
            Join thousands of clients pampering themselves with Blissful Beauty
            Salon
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[var(--primary)] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-light)] bg-[var(--gray-100)]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">
                Blissful Beauty Salon
              </h4>
              <p className="mt-3 text-sm text-[var(--gray-700)]">
                Your premier destination for beauty and wellness
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">
                Quick Links
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-[var(--gray-700)]">
                <li>
                  <Link className="hover:text-[var(--text)]" to="/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--text)]" to="/services">
                    Services
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--text)]" to="/about">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--text)]" to="/contact">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--text)]" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">
                Legal
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-[var(--gray-700)]">
                <li>
                  <a className="hover:text-[var(--text)]" href="#privacy">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--text)]" href="#terms">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--text)]" href="#cookies">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">
                Connect
              </h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--gray-700)]">
                <a className="hover:text-[var(--text)]" href="#">
                  Twitter
                </a>
                <a className="hover:text-[var(--text)]" href="#">
                  Facebook
                </a>
                <a className="hover:text-[var(--text)]" href="#">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-[var(--border-light)] pt-6 text-center text-xs text-[var(--gray-700)]">
            <p>&copy; 2026 Blissful Beauty Salon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
