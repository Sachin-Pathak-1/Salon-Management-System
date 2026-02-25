import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-[var(--background)] px-5 py-15">
      <Link to="/" className="inline-block mb-8 text-[var(--primary)] font-bold no-underline transition-none">← Back to Home</Link>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-[var(--text)] mb-3 text-center">Our Services</h1>
        <p className="text-center text-[var(--gray-700)] text-lg mb-12">Indulge in our premium beauty services tailored for your unique style</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className="bg-[var(--gray-100)] rounded-xl p-8 shadow-md border-l-4 border-[var(--primary)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <h3 className="text-2xl text-[var(--text)] mb-4">{service.name}</h3>
              <p className="text-[var(--gray-700)] text-base leading-relaxed mb-6">{service.description}</p>
              <Link to="/login" className="inline-block px-5 py-2.5 bg-[var(--primary)] text-white rounded-md font-bold no-underline transition-all duration-300 hover:bg-[var(--primary-dark,var(--primary))] hover:text-white hover:-translate-y-0.5">Learn More</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
