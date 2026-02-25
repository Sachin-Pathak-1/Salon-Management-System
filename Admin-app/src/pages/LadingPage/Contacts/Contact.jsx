import { Link } from "react-router-dom";
import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--secondary)]/10 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8 text-[var(--primary)] font-semibold hover:underline"
          >
            <span className="text-lg">←</span>
            Back to Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-[var(--text)]">
                Book Your Visit or Say Hello
              </h1>
              <p className="mt-4 text-lg text-[var(--gray-700)]">
                Questions about services, pricing, or availability? Our team is here to help.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--primary)]">Call us</p>
                  <p className="mt-2 text-sm text-[var(--gray-700)]">+91 (555) 123-4567</p>
                </div>
                <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--primary)]">Email</p>
                  <p className="mt-2 text-sm text-[var(--gray-700)]">info@blissfulbeautysalon.com</p>
                </div>
                <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--primary)]">Address</p>
                  <p className="mt-2 text-sm text-[var(--gray-700)]">
                    123 Business Street, Suite 100
                    <br />
                    New York, NY 10001
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--primary)]">Hours</p>
                  <p className="mt-2 text-sm text-[var(--gray-700)]">
                    Mon–Fri: 9AM–8PM
                    <br />
                    Sat: 8AM–6PM • Sun: 10AM–5PM
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-[var(--gray-100)] border border-[var(--border-light)] rounded-2xl p-8 md:p-10 shadow-lg"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--text)]">Send a Message</h2>
                <p className="text-sm text-[var(--gray-700)] mt-2">
                  Tell us what you need and we’ll get back shortly.
                </p>
              </div>

              {submitted && (
                <div className="mb-5 rounded-lg bg-[color:var(--success)]/15 text-[var(--success)] font-semibold text-center py-3 border border-[color:var(--success)]/30">
                  Thank you! We'll get back to you soon.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sm mb-2 text-[var(--text)]">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-2 text-[var(--text)]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-semibold text-sm mb-2 text-[var(--text)]">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Your message here..."
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full py-3 rounded-lg bg-[var(--primary)] text-white font-semibold text-base transition hover:opacity-95"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
