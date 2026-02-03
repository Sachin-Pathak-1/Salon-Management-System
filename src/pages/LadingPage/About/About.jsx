import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] px-5 py-10 md:py-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* Back Link */}
        <Link
          to="/"
          className="inline-block mb-8 text-[var(--primary)] font-semibold hover:underline hover:text-[var(--primary)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 rounded"
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[var(--text)]">
          About Our Salon
        </h1>

        {/* Content Box */}
        <div className="bg-[var(--gray-100)] w-full max-w-4xl mx-auto rounded-2xl shadow-lg px-6 py-8 md:px-12 md:py-14 space-y-8 md:space-y-12 border border-[var(--border-light)]">

          {/* Our Mission */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-[var(--text)]">Our Mission</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <p className="text-base md:text-lg leading-relaxed text-[var(--gray-700)]">
              We help you look and feel your best by delivering thoughtful, personalized salon
              experiences in a calm, welcoming space.
            </p>
          </section>

          {/* What We Do */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-[var(--text)]">What We Do</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <p className="text-base md:text-lg leading-relaxed text-[var(--gray-700)]">
              From precision haircuts and color to styling, treatments, and bridal services,
              our stylists create looks that match your lifestyle and personality.
            </p>
          </section>

          {/* Our Values */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-[var(--text)]">Our Values</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <ul className="space-y-3 text-base md:text-lg text-[var(--gray-700)]">
              <li><span className="font-semibold text-[var(--primary)]">Craft:</span> We train continuously to perfect modern and classic techniques.</li>
              <li><span className="font-semibold text-[var(--primary)]">Care:</span> We listen first, then tailor every service to you.</li>
              <li><span className="font-semibold text-[var(--primary)]">Cleanliness:</span> We keep our tools and space spotless and safe.</li>
              <li><span className="font-semibold text-[var(--primary)]">Confidence:</span> We want you to leave feeling refreshed and empowered.</li>
            </ul>
          </section>

          {/* Our Team */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-[var(--text)]">Our Team</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <p className="text-base md:text-lg leading-relaxed text-[var(--gray-700)]">
              Our team of licensed stylists specializes in cutting, coloring, and treatment
              services, with a focus on healthy hair and a great client experience.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
