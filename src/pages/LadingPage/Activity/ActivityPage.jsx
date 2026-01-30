import { useNavigate } from 'react-router-dom';
import './ActivityPage.css';
import '.././harshal.css'

export function ActivityPage({ isLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const activities = [
    { id: 1, icon: '✅', title: 'Service Completed', description: 'Completed "Email Marketing Setup" service', time: '2 hours ago', category: 'completed' },
    { id: 2, icon: '📝', title: 'Created New Service', description: 'Added "Social Media Management" to portfolio', time: '4 hours ago', category: 'created' },
    { id: 3, icon: '💬', title: 'New Message', description: 'Received message from John Doe', time: '1 day ago', category: 'message' },
    { id: 4, icon: '🎯', title: 'Goal Achieved', description: 'Reached 100 completed services milestone', time: '2 days ago', category: 'milestone' },
    { id: 5, icon: '⭐', title: 'Review Posted', description: 'Received 5-star review from Sarah Smith', time: '3 days ago', category: 'review' },
    { id: 6, icon: '🔔', title: 'New Booking', description: 'Booking received for "Website Design" service', time: '4 days ago', category: 'booking' },
    { id: 7, icon: '💰', title: 'Payment Received', description: 'Received payment of $500 for completed service', time: '5 days ago', category: 'payment' },
    { id: 8, icon: '🏆', title: 'Badge Earned', description: 'Earned "Top Performer" badge', time: '1 week ago', category: 'achievement' },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      completed: '#10b981',
      created: '#3b82f6',
      message: '#f59e0b',
      milestone: '#ec4899',
      review: '#06b6d4',
      booking: '#8b5cf6',
      payment: '#6366f1',
      achievement: '#f97316'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="activity-page">
      <div className="activity-container">
        <div className="activity-header">
          <div>
            <h1>My Activity</h1>
            <p>View all your recent activities and events</p>
          </div>
          <div className="activity-filters">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">Completed</button>
            <button className="filter-btn">Messages</button>
            <button className="filter-btn">Bookings</button>
          </div>
        </div>

        <div className="activities-grid">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-left">
                <div className="activity-icon-circle" style={{ background: getCategoryColor(activity.category) }}>
                  {activity.icon}
                </div>
              </div>
              <div className="activity-middle">
                <h3 className="activity-name">{activity.title}</h3>
                <p className="activity-description">{activity.description}</p>
              </div>
              <div className="activity-right">
                <span className="activity-category-badge" style={{ borderColor: getCategoryColor(activity.category), color: getCategoryColor(activity.category) }}>
                  {activity.category}
                </span>
                <span className="activity-timestamp">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="activity-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <h3>This Month</h3>
            <p className="stat-value">34</p>
            <small>activities</small>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <h3>Rating</h3>
            <p className="stat-value">4.9/5</p>
            <small>average rating</small>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <h3>Completed</h3>
            <p className="stat-value">98%</p>
            <small>success rate</small>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h3>Clients</h3>
            <p className="stat-value">156</p>
            <small>total clients</small>
          </div>
        </div>
      </div>
    </div>
  );
}
