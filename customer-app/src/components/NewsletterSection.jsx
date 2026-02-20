import React, { useState } from 'react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="bg-[var(--gray-100)] py-16">
      <div className="max-w-3xl mx-auto text-center px-6">
        <h2 className="text-3xl font-bold mb-4 text-[var(--text)]">
          Find Spas in Your City
        </h2>
        <p className="mb-8 text-[var(--gray-700)]">
          Join our newsletter for exclusive spa offers & wellness tips
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-grow px-4 py-3 rounded-full border border-[var(--border-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-[var(--primary)] text-white font-semibold"
          >
            Subscribe
          </button>
        </form>
        {submitted && (
          <p className="mt-4 text-green-600">Thank you for subscribing!</p>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
