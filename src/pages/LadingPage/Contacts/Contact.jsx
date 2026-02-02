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
    <div className="min-h-screen bg-background text-text px-5 py-14 flex flex-col items-center justify-center">
      <Link
        to="/"
        className="inline-block mb-8 text-blue-600 font-bold hover:underline"
      >
        ← Back to Home
      </Link>

      <div className="max-w-5xl mx-auto ">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-3">
          Contact Us
        </h1>
        <p className="text-center text-lg mb-10">
          We'd love to hear from you. Send us a message!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Contact Info */}
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 shadow justify-self-center md:justify-self-start">
            <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>

            <div className="space-y-5">
              <div>
                <strong className="block text-blue-600 mb-1">Address</strong>
                <p className="text-sm leading-relaxed">
                  123 Business Street, Suite 100<br />
                  New York, NY 10001
                </p>
              </div>

              <div>
                <strong className="block text-blue-600 mb-1">Email</strong>
                <p className="text-sm">info@servicehub.com</p>
              </div>

              <div>
                <strong className="block text-blue-600 mb-1">Phone</strong>
                <p className="text-sm">+91 (555) 123-4567</p>
              </div>

              <div>
                <strong className="block text-blue-600 mb-1">Hours</strong>
                <p className="text-sm leading-relaxed">
                  Monday - Friday: 9AM - 6PM<br />
                  Saturday - Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-100 border border-gray-200 rounded-xl p-8 shadow justify-self-center md:justify-self-end w-full"
          >
            {submitted && (
              <div className="mb-5 rounded-lg bg-emerald-100 text-emerald-700 font-semibold text-center py-3">
                ✓ Thank you! We'll get back to you soon.
              </div>
            )}

            <div className="mb-5 justify-self-center md:justify-self-start">
              <label className="block font-bold text-sm mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
                className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 text-sm
                           focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div className="mb-5 justify-self-center md:justify-self-start">
              <label className="block font-bold text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 text-sm
                           focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div className="mb-6 justify-self-center md:justify-self-start">
              <label className="block font-bold text-sm mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Your message here..."
                className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 text-sm resize-none
                           focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-base
                         transition hover:shadow-xl hover:shadow-blue-600/30"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
