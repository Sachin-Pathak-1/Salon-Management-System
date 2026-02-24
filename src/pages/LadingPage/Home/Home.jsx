import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="bg-[var(--background)] text-[var(--text)]">
      {/* Hero Section */}
      <section className="relative min-h-[74vh] overflow-hidden pb-12">
        <img
          src="/image.png"
          alt="Luxury spa treatment"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/78" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/45 to-white/86" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-28 text-center sm:pt-32">
          <h1 className="max-w-3xl font-['Playfair_Display'] text-5xl font-medium leading-[0.95] text-[#4a3528] sm:text-6xl lg:text-[86px]">
            Renew, Relax,
            <br />
            Rejuvenate
          </h1>

          <div className="relative z-10 mt-10 w-full max-w-[470px] translate-y-6 rounded-[2.25rem] border border-[#ece7e1] bg-white/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.10)] backdrop-blur">
            <Link
              to="/login"
              className="group flex w-full items-center justify-between rounded-full bg-[#5a3f2f] px-9 py-5 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:brightness-110"
            >
              <span className="flex items-center gap-3">
                <span className="text-base opacity-90">📅</span>
                Book Your Appointment Now
              </span>
              <span className="text-lg opacity-80 transition-transform group-hover:translate-x-1">›</span>
            </Link>
            <p className="mt-4 text-[10px] uppercase tracking-[0.26em] text-[#8f8378]">
              Instant Confirmation • Curated Luxury Experts
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[-130px] left-1/2 h-72 w-[145%] -translate-x-1/2 rounded-[50%] bg-[var(--background)]" />
      </section>

      {/* Stats Section */}
      <section className="mx-auto mt-10 max-w-6xl px-6">
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
              "Blissful Beauty Salon transformed my look completely. The stylists are incredibly skilled and the atmosphere is so relaxing."
            </p>
            <p className="mt-4 text-sm font-semibold text-[var(--text)]">- Sarah Johnson</p>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-lg ring-1 ring-black/5">
            <div className="text-[var(--primary)]">★★★★★</div>
            <p className="mt-4 text-sm text-[var(--gray-700)]">
              "The best salon experience I've ever had. Their attention to detail and professional service is unmatched."
            </p>
            <p className="mt-4 text-sm font-semibold text-[var(--text)]">- Emily Chen</p>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-lg ring-1 ring-black/5">
            <div className="text-[var(--primary)]">★★★★★</div>
            <p className="mt-4 text-sm text-[var(--gray-700)]">
              "I've been coming here for years and they never disappoint. Highly recommend their coloring services!"
            </p>
            <p className="mt-4 text-sm font-semibold text-[var(--text)]">- Maria Rodriguez</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-3xl font-bold">Our Work</h2>
          <p className="hidden text-sm text-[var(--gray-700)] sm:block">Signature treatments and artistry</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">✂️</div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Hair Styling</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">Professional cuts and styling for every occasion.</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">💅</div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Nail Care</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">Beautiful manicures and pedicures with expert techniques.</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">🎨</div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Hair Coloring</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">Highlights, balayage, and full color transformations.</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--gray-100)] p-6 shadow-md ring-1 ring-black/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hover-bg)] text-xl">🧴</div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Spa Treatments</h3>
              <p className="mt-2 text-sm text-[var(--gray-700)]">Luxurious facials and body treatments for deep relaxation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-[var(--primary)] px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mt-3 text-sm text-white/80">
            Join thousands of clients pampering themselves with Blissful Beauty Salon
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
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">Blissful Beauty Salon</h4>
              <p className="mt-3 text-sm text-[var(--gray-700)]">Your premier destination for beauty and wellness</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm text-[var(--gray-700)]">
                <li><Link className="hover:text-[var(--text)]" to="/">Home</Link></li>
                <li><Link className="hover:text-[var(--text)]" to="/lpservices">Services</Link></li>
                <li><Link className="hover:text-[var(--text)]" to="/about">About</Link></li>
                <li><Link className="hover:text-[var(--text)]" to="/contact">Contact</Link></li>
                <li><Link className="hover:text-[var(--text)]" to="/profile">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-[var(--gray-700)]">
                <li><a className="hover:text-[var(--text)]" href="#privacy">Privacy Policy</a></li>
                <li><a className="hover:text-[var(--text)]" href="#terms">Terms of Service</a></li>
                <li><a className="hover:text-[var(--text)]" href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">Connect</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--gray-700)]">
                <a className="hover:text-[var(--text)]" href="#">Twitter</a>
                <a className="hover:text-[var(--text)]" href="#">Facebook</a>
                <a className="hover:text-[var(--text)]" href="#">LinkedIn</a>
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
