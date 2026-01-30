import "./sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="user-box">
        <div className="avatar">AP</div>
        <h4>Ananya Patel</h4>
        <p>ananyapatel@gmail.com</p>
      </div>

      <div className="wallet-box">
        <p className="wallet-title">NIO WALLET ACCOUNT</p>
        <h3>₹1,24,580</h3>
        <span>Locked balance ₹12,450</span>
      </div>

      <ul className="menu">
        <li className="active">Personal Information</li>
      </ul>
    </div>
  );
};

export default Sidebar;
