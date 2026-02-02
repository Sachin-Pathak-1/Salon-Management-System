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
      count: 5,
    },
  ];

  return (
    <div className="min-h-screen w-[85%] mx-auto
      bg-slate-50 dark:bg-slate-900
      text-slate-800 dark:text-slate-100
      transition-colors">

      <div className="p-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            Hi! How can we help?
          </h1>
          <p className="text-base opacity-70">
            If you have any problem have a look in our knowledge base support.
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 max-w-md px-5 py-3 rounded-full text-sm
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              placeholder:opacity-50
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="px-5 py-3 rounded-full text-lg
              bg-slate-200 dark:bg-slate-700
              hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            🔍
          </button>
        </div>

        {/* Topics */}
        <div className="grid grid-cols-1 gap-5 mb-10">
          {topics.map(topic => (
            <div
              key={topic.id}
              className="p-6 rounded-xl cursor-pointer
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <h3 className="text-lg font-semibold mb-2">
                {topic.title}
              </h3>
              <p className="text-sm opacity-80 mb-3 leading-relaxed">
                {topic.description}
              </p>
              <a
                href="#topics"
                className="text-sm font-medium text-blue-500 hover:text-blue-600 underline"
              >
                Here are {topic.count} questions and answers.
              </a>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div
          className="flex items-center gap-5 p-6 mb-10 rounded-xl
            bg-blue-50 dark:bg-slate-800
            border border-blue-500"
        >
          <div className="text-4xl">💬</div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              If you don't find your question please contact our support team.
            </h3>
          </div>
          <button
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white
              bg-blue-500 hover:bg-blue-600 transition"
          >
            Contact Us
          </button>
        </div>

        {/* Footer */}
        <div
          className="text-center text-sm py-5 w-6x h-full justify-center items-center
            border-t border-slate-200 dark:border-slate-700
            bg-slate-600 text-slate-300"
        >
          © 2024 ServiceHub. All rights reserved.
        </div>

      </div>
    </div>
  );
}
