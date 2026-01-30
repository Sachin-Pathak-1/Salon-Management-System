import { Link } from 'react-router-dom';
import './Home.css';
import '.././harshal.css'

export function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="highlight">Service Management System</span>
          </h1>
          <p className="hero-subtitle">
            Manage your services efficiently with our comprehensive platform
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
          <p className="stat-label">Active Users</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">98%</h3>
          <p className="stat-label">Uptime</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">5M+</h3>
          <p className="stat-label">Tasks Completed</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">24/7</h3>
          <p className="stat-label">Support</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users managing their services with ServiceHub</p>
        <Link to="/login" className="btn-hero primary large">
          Sign Up Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>ServiceHub</h4>
            <p>The complete service management platform</p>
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
          <p>&copy; 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
