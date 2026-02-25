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
    <div className="flex min-h-screen w-[85%] mx-auto bg-[var(--background)] text-[var(--text)] transition-colors duration-300 ease-in-out">

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2.5">Hi! How can we help?</h1>
          <p className="text-base text-[var(--text)] opacity-70 m-0">If you have any problem have a look in our knowledge base support.</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2.5 mb-10">
          <input type="text" placeholder="Search..." className="flex-1 p-3 border border-[var(--border-light)] rounded-full text-sm text-[var(--text)] bg-[var(--gray-100)] max-w-[500px] placeholder:text-[var(--text)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(24,146,247,0.1)]" />
          <button className="p-3 bg-[var(--gray-200)] border border-[var(--border-light)] rounded-full cursor-pointer text-base text-[var(--text)] hover:bg-[var(--gray-100)]">🔍</button>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 gap-5 mb-10">
          {topics.map(topic => (
            <div key={topic.id} className="flex items-start gap-5 p-6 bg-[var(--gray-100)] border border-[var(--border-light)] rounded-lg cursor-pointer">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text)] m-0 mb-2.5">{topic.title}</h3>
                <p className="text-sm text-[var(--text)] m-0 mb-3 leading-relaxed opacity-80">{topic.description}</p>
                <a href="#topics" className="text-blue-500 no-underline text-sm font-medium hover:text-blue-700 hover:underline">
                  Here are {topic.count} questions and answers.
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="flex items-center gap-5 p-6 bg-[#f8f9ff] border border-blue-500 rounded-lg mb-10">
          <div className="text-4xl min-w-[50px] text-center">💬</div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#1a1a1a] m-0 leading-relaxed">If you don't find your question please contact our support team.</h3>
          </div>
          <button className="px-6 py-2.5 bg-blue-500 text-white no-underline rounded-md border-none font-semibold text-sm whitespace-nowrap hover:bg-blue-700">Contact Us</button>
        </div>

        {/* Footer */}
        <div className="text-center py-5 border-t border-gray-200 bg-white text-gray-600 text-sm">
          <p>© 2024 Blissful Beauty Salon. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
