export default function TeamManage() {
  return (
    <div className="p-6 bg-[var(--gray-100)] border border-[var(--border-light)] rounded-lg shadow-md w-[85%] mx-auto mt-7 text-[var(--text)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Staff Manage</h1>
          <p className="text-[var(--gray-700)]">You can add and remove team member as you want.</p>
        </div>
        <button className="bg-[var(--primary)] hover:opacity-95 text-white px-4 py-2 rounded-md font-medium">
          Invite New Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="text-left p-3 font-semibold text-[var(--gray-700)]">TEAM MEMBER</th>
              <th className="text-left p-3 font-semibold text-[var(--gray-700)]">PERMISSION</th>
              <th className="text-left p-3 font-semibold text-[var(--gray-700)]">ROLE</th>
              <th className="text-left p-3 font-semibold text-[var(--gray-700)]">ACTION</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b border-[var(--border-light)]">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    AB
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text)]">Abu Bin Ishtiyak</h4>
                    <span className="text-sm text-[var(--gray-700)]">info@softnio.com</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-[var(--gray-700)]">Owner</td>
              <td className="p-3 text-[var(--gray-700)]">All</td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <span className="text-[var(--primary)] hover:opacity-80 cursor-pointer">Edit</span>
                  <span className="text-[var(--danger)] hover:opacity-80 cursor-pointer">Remove</span>
                </div>
              </td>
            </tr>

            <tr className="border-b border-[var(--border-light)]">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    Kw
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text)]">mark kiefer watson</h4>
                    <span className="text-sm text-[var(--gray-700)]">markkieferwatson@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-[var(--gray-700)]">Member</td>
              <td className="p-3">
                <select className="border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] rounded px-2 py-1 text-sm">
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <span className="text-[var(--primary)] hover:opacity-80 cursor-pointer">Edit</span>
                  <span className="text-[var(--danger)] hover:opacity-80 cursor-pointer">Remove</span>
                </div>
              </td>
            </tr>

            <tr className="border-b border-[var(--border-light)]">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    SB
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text)]">Stephen Barber</h4>
                    <span className="text-sm text-[var(--gray-700)]">stephenbarber@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-[var(--gray-700)]">Member</td>
              <td className="p-3">
                <select className="border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] rounded px-2 py-1 text-sm">
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <span className="text-[var(--primary)] hover:opacity-80 cursor-pointer">Edit</span>
                  <span className="text-[var(--danger)] hover:opacity-80 cursor-pointer">Remove</span>
                </div>
              </td>
            </tr>

            <tr className="border-b border-[var(--border-light)]">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    HP
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text)]">Heriberto Patterson</h4>
                    <span className="text-sm text-[var(--gray-700)]">heribertopatterson@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-[var(--gray-700)]">Member</td>
              <td className="p-3">
                <select className="border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] rounded px-2 py-1 text-sm">
                  <option>Admin</option>
                  <option>Super Admin</option>
                  <option>Manager</option>
                </select>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <span className="text-[var(--primary)] hover:opacity-80 cursor-pointer">Edit</span>
                  <span className="text-[var(--danger)] hover:opacity-80 cursor-pointer">Remove</span>
                </div>
              </td>
            </tr>

            <tr className="border-b border-[var(--border-light)]">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                    AB
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text)]">Arturo Blain</h4>
                    <span className="text-sm text-[var(--gray-700)]">arturoblain@gmail.com</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-[var(--gray-700)]">Member</td>
              <td className="p-3">
                <select className="border border-[var(--border-light)] bg-[var(--background)] text-[var(--text)] rounded px-2 py-1 text-sm">
                  <option>Manager</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <span className="text-[var(--primary)] hover:opacity-80 cursor-pointer">Edit</span>
                  <span className="text-[var(--danger)] hover:opacity-80 cursor-pointer">Remove</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
