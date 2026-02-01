import { Link } from 'react-router-dom';
import './Services.css';
 

export function LPServices() {
  const services = [
    { id: 1, name: 'Web Development', description: 'Custom web applications and websites' },
    { id: 2, name: 'Mobile App Development', description: 'Native and cross-platform mobile apps' },
    { id: 3, name: 'Cloud Solutions', description: 'Scalable cloud infrastructure and solutions' },
    { id: 4, name: 'AI & Machine Learning', description: 'Intelligent solutions powered by AI/ML' },
    { id: 5, name: 'DevOps', description: 'Continuous integration and deployment' },
    { id: 6, name: 'Consulting', description: 'Technical and business consulting' },
  ];

  return (
    <div className="services-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      
      <div className="services-container">
        <h1>Our Services</h1>
        <p className="services-intro">Comprehensive solutions for your business needs</p>

        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <Link to="/login" className="service-btn">Learn More</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
