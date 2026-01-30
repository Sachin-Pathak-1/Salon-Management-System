import { Link } from 'react-router-dom';
import { useState } from 'react';
import '.././harshal.css'
import './Contact.css';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-intro">We'd love to hear from you. Send us a message!</p>

        <div className="contact-grid">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <div className="info-item">
              <strong> Address</strong>
              <p>123 Business Street, Suite 100<br/>New York, NY 10001</p>
            </div>
            <div className="info-item">
              <strong>Email</strong>
              <p>info@servicehub.com</p>
            </div>
            <div className="info-item">
              <strong>Phone</strong>
              <p>+91 (555) 123-4567</p>
            </div>
            <div className="info-item">
              <strong>Hours</strong>
              <p>Monday - Friday: 9AM - 6PM<br/>Saturday - Sunday: Closed</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            {submitted && (
              <div className="success-message">
                ✓ Thank you! We'll get back to you soon.
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your message here..."
                rows="5"
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
