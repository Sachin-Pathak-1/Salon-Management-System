import { Link } from 'react-router-dom';
import './Home.css';
import React from "react"

 

export function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="highlight">Blissful Beauty Salon</span>
          </h1>
          <p className="hero-subtitle">
            Indulge in luxury and beauty with our premium salon services
          </p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn-hero primary">
              Get Started
            </Link>
            <Link to="/login" className="btn-hero secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <h3 className="stat-number">10K+</h3>
          <p className="stat-label">Happy Customers</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">98%</h3>
          <p className="stat-label">Satisfaction Rate</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">5M+</h3>
          <p className="stat-label">Treatments Completed</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">24/7</h3>
          <p className="stat-label">Support</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of clients pampering themselves with Blissful Beauty Salon</p>
        <Link to="/login" className="btn-hero primary large">
          Sign Up Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Blissful Beauty Salon</h4>
            <p>Your premier destination for beauty and wellness</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Blissful Beauty Salon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
