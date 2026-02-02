import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]  px-5 py-10 md:py-16 transition-colors duration-300 ">
      <div className="max-w-4xl mx-auto">

        {/* Back Link */}
        <Link
          to="/"
          className="inline-block mb-8 text-[var(--primary)] font-semibold hover:underline hover:text-[var(--primary)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 rounded"
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          About Services
        </h1>

        {/* Content Box */}
        <div className="bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-lg px-6 py-8 md:px-12 md:py-14 space-y-8 md:space-y-12 dark:bg-gray-900 dark:text-slate-300">

          {/* Our Mission */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Our Mission</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <p className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              ServiceHub is dedicated to providing comprehensive service management solutions
              that empower businesses to operate efficiently and scale effectively.
            </p>
          </section>

          {/* What We Do */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">What We Do</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <p className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              We build powerful platforms that help organizations manage their services,
              track performance, and deliver exceptional customer experiences.
            </p>
          </section>

          {/* Our Values */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Our Values</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <ul className="space-y-3 text-base md:text-lg text-slate-600 dark:text-slate-300">
              <li><span className="font-semibold text-[var(--primary)]">Innovation:</span> We continuously innovate to stay ahead</li>
              <li><span className="font-semibold text-[var(--primary)]">Quality:</span> We maintain the highest quality standards</li>
              <li><span className="font-semibold text-[var(--primary)]">Reliability:</span> Our systems are built to be dependable</li>
              <li><span className="font-semibold text-[var(--primary)]">Customer Focus:</span> Your success is our priority</li>
            </ul>
          </section>

          {/* Our Team */}
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Our Team</h2>
            <div className="h-px w-full bg-[var(--primary)]/40 mb-4"></div>
            <p className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Our team consists of experienced professionals with expertise in software development,
              project management, and customer success.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}