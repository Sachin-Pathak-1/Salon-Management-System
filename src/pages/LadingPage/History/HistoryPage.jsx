import { useNavigate } from 'react-router-dom';
import './HistoryPage.css';
 

export function HistoryPage({ isLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const history = [
    { id: 1, date: '2025-01-29', action: 'Service Completed', details: 'Email Marketing Setup - $150', status: 'completed' },
    { id: 2, date: '2025-01-28', action: 'Service Started', details: 'Website Design Project', status: 'in-progress' },
    { id: 3, date: '2025-01-26', action: 'Payment Received', details: 'Payment of $500 from Client XYZ', status: 'completed' },
    { id: 4, date: '2025-01-25', action: 'Service Cancelled', details: 'Social Media Campaign - Client Request', status: 'cancelled' },
    { id: 5, date: '2025-01-24', action: 'Service Completed', details: 'Content Writing - 50 Articles', status: 'completed' },
    { id: 6, date: '2025-01-22', action: 'Review Received', details: '5-star review from John Smith', status: 'completed' },
    { id: 7, date: '2025-01-20', action: 'Service Updated', details: 'Updated pricing for "Logo Design"', status: 'info' },
    { id: 8, date: '2025-01-18', action: 'New Booking', details: 'Booking for "Brand Strategy" service', status: 'in-progress' },
    { id: 9, date: '2025-01-15', action: 'Profile Updated', details: 'Updated profile information', status: 'info' },
    { id: 10, date: '2025-01-12', action: 'Service Completed', details: 'SEO Optimization - Website', status: 'completed' },
    { id: 11, date: '2025-01-10', action: 'Service Completed', details: 'Video Marketing - 5 Videos', status: 'completed' },
    { id: 12, date: '2025-01-08', action: 'New Service Added', details: 'Added "Mobile App Development"', status: 'info' },
  ];

  const getStatusIcon = (status) => {
    const icons = {
      completed: '✅',
      'in-progress': '⏳',
      cancelled: '❌',
      info: 'ℹ️'
    };
    return icons[status] || '•';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#10b981',
      'in-progress': '#f59e0b',
      cancelled: '#ef4444',
      info: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  // Group history by month
  const groupedHistory = {};
  history.forEach(item => {
    const month = new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!groupedHistory[month]) {
      groupedHistory[month] = [];
    }
    groupedHistory[month].push(item);
  });

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <div>
            <h1>History</h1>
            <p>View your complete transaction and activity history</p>
          </div>
          <div className="history-actions">
            <button className="action-btn">📥 Export</button>
            <button className="action-btn">🔍 Search</button>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline">
          {Object.entries(groupedHistory).map(([month, items]) => (
            <div key={month} className="timeline-section">
              <div className="timeline-month">{month}</div>
              <div className="timeline-items">
                {items.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-marker" style={{ background: getStatusColor(item.status) }}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="timeline-content">
                      <div className="history-date">
                        {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="history-item">
                        <h3 className="history-action">{item.action}</h3>
                        <p className="history-details">{item.details}</p>
                      </div>
                      <div className="history-status">
                        <span className="status-badge" style={{ borderColor: getStatusColor(item.status), color: getStatusColor(item.status) }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="history-summary">
          <h2>Summary Statistics</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">✅</div>
              <h4>Completed</h4>
              <p className="summary-value">7</p>
              <small>services</small>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⏳</div>
              <h4>In Progress</h4>
              <p className="summary-value">2</p>
              <small>active services</small>
            </div>
            <div className="summary-card">
              <div className="summary-icon">❌</div>
              <h4>Cancelled</h4>
              <p className="summary-value">1</p>
              <small>services</small>
            </div>
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <h4>Total Earned</h4>
              <p className="summary-value">$650</p>
              <small>from completed</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
