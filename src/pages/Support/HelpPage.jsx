import './HelpPage.css';

export function HelpPage() {
  const topics = [
    {
      id: 1,
      title: 'General Topics',
      description: 'You can find all of the questions and answers of general purpose.',
      count: 7,
    },
    {
      id: 2,
      title: 'Account Security Topics',
      description: 'You can find all of the questions and answers about secure your account.',
      count: 12,
    },
    {
      id: 3,
      title: 'Payment Related Topics',
      description: 'You can find all of the questions and answers about online payment.',
      count: 16,
    },
    {
      id: 4,
      title: 'Terms & Policy Topics',
      description: 'You can find all of the questions and answers about Privacy Policy.',
      count: 5
    }
  ];

  return (
    <div className="help-page">

      {/* Main Content */}
      <div className="help-content">
        {/* Header */}
        <div className="help-header">
          <h1>Hi! How can we help?</h1>
          <p>If you have any problem have a look in our knowledge base support.</p>
        </div>

        {/* Search Bar */}
        <div className="help-search">
          <input type="text" placeholder="Search..." className="search-input" />
          <button className="search-btn">🔍</button>
        </div>

        {/* Topics Grid */}
        <div className="help-topics">
          {topics.map(topic => (
            <div key={topic.id} className="topic-card">
              <div className="topic-body">
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <a href="#topics" className="topic-link">
                  Here are {topic.count} questions and answers.
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="help-contact">
          <div className="contact-icon">💬</div>
          <div className="contact-body">
            <h3>If you don't find your question please contact our support team.</h3>
          </div>
          <button className="contact-btn">Contact Us</button>
        </div>

        {/* Footer */}
        <div className="help-footer">
          <p>© 2024 ServiceHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
