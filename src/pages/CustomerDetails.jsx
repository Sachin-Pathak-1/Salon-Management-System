import { useNavigate, useParams } from 'react-router-dom';
import './CustomerDetails.css';
import './Gobal.css';

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const customer = {
    name: 'Francis Mitcham',
    email: 'info@softnio.com',
    plan: 'PLATINUM',
    walletBalance: 237.89,
    creditPoints: 1643,
    totalOrders: 23,
    completeOrders: 20,
    progressOrders: 3,
    orders: [
      {
        id: '#4947',
        product: 'Black Mi Band Smartwatch',
        status: 'Shipped',
        delivery: 'In 2 days',
        image: '⌚'
      },
      {
        id: '#4948',
        product: 'Purple Smartwatch',
        status: 'Delivered',
        delivery: '12 Dec, 2020',
        image: '📱'
      },
      {
        id: '#4949',
        product: 'Pink Fitness Tracker',
        status: 'Canceled',
        delivery: 'Never',
        image: '⌚'
      }
    ]
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'Shipped':
        return 'shipped';
      case 'Delivered':
        return 'delivered';
      case 'Canceled':
        return 'canceled';
      default:
        return '';
    }
  };

  return (
    <div className="customer-details-container">
      <div className="container container-sm">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Back
        </button>

        <h1 className="page-title">Customer Details</h1>


        <div className="details-grid">
          {/* Left Column - Customer Info */}
          <div>
            <div className="customer-card">
              {/* Avatar */}
              <div className="avatar-container">
                <div className="customer-avatar-lg">
                  FM
                </div>
              </div>

              {/* Customer Info */}
              <div className="customer-info">
                <div className="plan-badge">
                  {customer.plan}
                </div>
                <h2 className="customer-name-detail">{customer.name}</h2>
                <p className="customer-email-detail">{customer.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="icon-button">📞</button>
                <button className="icon-button">✉️</button>
                <button className="icon-button">🔖</button>
                <button className="icon-button">⛔</button>
              </div>

              {/* Stats */}
              <div className="stats-section">
                <div className="stat-item">
                  <div className="stat-value">{customer.totalOrders}</div>
                  <div className="stat-label">Total Order</div>
                </div>
                <div className="stats-row">
                  <div className="stat-item">
                    <div className="stat-value">{customer.completeOrders}</div>
                    <div className="stat-label">Complete</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{customer.progressOrders}</div>
                    <div className="stat-label">Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account & Orders */}
          <div>
            {/* Account Info */}
            <div className="account-info-card">
              <h3 className="account-section-title">IN ACCOUNT</h3>
              <div className="account-grid">
                <div className="account-item">
                  <p className="account-amount">
                    {customer.walletBalance} <span className="account-amount-unit">USD</span>
                  </p>
                  <p className="account-desc">Wallet Balance</p>
                </div>
                <div className="account-item">
                  <p className="account-amount">+ {customer.creditPoints}</p>
                  <p className="account-desc">Credit Points</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="orders-card">
              <h3 className="orders-title">Recent Orders</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product Name</th>
                      <th>Status</th>
                      <th>Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="order-id">{order.id}</td>
                        <td>
                          <div className="product-cell">
                            <span className="product-icon">{order.image}</span>
                            <span className="product-name">{order.product}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`order-status-badge ${getOrderStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="delivery-info">{order.delivery}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
