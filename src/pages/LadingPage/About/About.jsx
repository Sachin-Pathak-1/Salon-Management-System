import { Link } from 'react-router-dom';
import '.././harshal.css'
import './About.css';

export function About() {
  return (
    <div className="about-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      
      <div className="about-container">
        <h1>About ServiceHub</h1>
        
        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              ServiceHub is dedicated to providing comprehensive service management solutions 
              that empower businesses to operate efficiently and scale effectively.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Do</h2>
            <p>
              We build powerful platforms that help organizations manage their services, 
              track performance, and deliver exceptional customer experiences.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Values</h2>
            <ul className="values-list">
              <li><strong>Innovation:</strong> We continuously innovate to stay ahead</li>
              <li><strong>Quality:</strong> We maintain the highest quality standards</li>
              <li><strong>Reliability:</strong> Our systems are built to be dependable</li>
              <li><strong>Customer Focus:</strong> Your success is our priority</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Our Team</h2>
            <p>
              Our team consists of experienced professionals with expertise in software development, 
              project management, and customer success. We're passionate about delivering value to our clients.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
