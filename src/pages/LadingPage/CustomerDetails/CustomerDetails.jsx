import './CustomerDetails.css';
import { useNavigate } from 'react-router-dom';
import '.././harshal.css'

export function CustomerDetails() {
  const navigate = useNavigate();
  
  const customerData = {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    status: 'Active',
    joinDate: 'January 15, 2023',
    avatar: '👤',
    address: '123 Business Street, Suite 100, New York, NY 10001',
    company: 'Tech Solutions Inc',
    role: 'Manager',
    totalSpent: '$12,500',
    services: 5,
    orders: [
      { id: 101, name: 'Web Design Service', date: '2025-01-25', amount: '$2,500', status: 'Completed' },
      { id: 102, name: 'Digital Marketing', date: '2025-01-20', amount: '$3,000', status: 'In Progress' },
      { id: 103, name: 'SEO Optimization', date: '2025-01-10', amount: '$1,500', status: 'Completed' },
      { id: 104, name: 'Content Writing', date: '2024-12-28', amount: '$2,000', status: 'Completed' },
    ]
  };

  return (
    <div className="customer-details">
      <div className="details-container">
        <button className="btn-back" onClick={() => navigate('/customers')}>← Back to Customers</button>

        <div className="details-grid">
          {/* Profile Section */}
          <div className="profile-card">
            <div className="avatar-large">{customerData.avatar}</div>
            <h1>{customerData.name}</h1>
            <p className="customer-role">{customerData.role} at {customerData.company}</p>
            <div className="status-badge-large">{customerData.status}</div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="label">Email</span>
                <p>{customerData.email}</p>
              </div>
              <div className="contact-item">
                <span className="label">Phone</span>
                <p>{customerData.phone}</p>
              </div>
              <div className="contact-item">
                <span className="label">Member Since</span>
                <p>{customerData.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <h2>Account Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">${(parseInt(customerData.totalSpent.replace(/\$|,/g, '')) / 1000).toFixed(1)}K</div>
                <div className="stat-label">Total Spent</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{customerData.services}</div>
                <div className="stat-label">Active Services</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{customerData.orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">4.8</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="info-section">
          <h2>Address</h2>
          <p className="full-width">{customerData.address}</p>
        </div>

        {/* Orders Section */}
        <div className="orders-section">
          <h2>Recent Orders</h2>
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Service Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customerData.orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.name}</td>
                    <td>{order.date}</td>
                    <td>{order.amount}</td>
                    <td><span className={`order-badge order-badge-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
