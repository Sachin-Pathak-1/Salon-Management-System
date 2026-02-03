import { Link } from 'react-router-dom';
import './Services.css';
 

export function LPServices() {
  const services = [
    { id: 1, name: 'Haircuts', description: 'Professional haircuts and styling for all hair types' },
    { id: 2, name: 'Massages', description: 'Relaxing massages to rejuvenate your body and mind' },
    { id: 3, name: 'Facials', description: 'Rejuvenating facials for healthy, glowing skin' },
    { id: 4, name: 'Manicure/Pedicure', description: 'Beautiful nails with our expert nail care services' },
    { id: 5, name: 'Hair Coloring', description: 'Expert hair coloring and highlighting services' },
    { id: 6, name: 'Spa Treatments', description: 'Luxurious spa treatments for ultimate relaxation' },
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
