import "./Dashboard.css";
import { Footer } from "../../components/Footer";
import { Layout } from "../Layout";

const Views = [
  { page: "Service A", views: 2150 },
  { page: "Service B", views: 120 },
  { page: "Service C", views: 90 },
  { page: "Service D", views: 80 },
  { page: "Service E", views: 70 },
];

const Recent = [
  { profile: "/image.png", name: "John Doe", activity: "Viewed Service A", time: "2 hours ago" },
  { profile: "/image.png", name: "Jane Smith", activity: "Booked Service B", time: "3 hours ago" },
  { profile: "/image.png", name: "Alice Johnson", activity: "Left a review on Service C", time: "5 hours ago" },
  { profile: "/image.png", name: "Bob Brown", activity: "Updated profile information", time: "1 day ago" },
];

export function Dashboard({ services }) {
  return (
    <Layout>
      <div className="dashboard">
        {/* Welcome Section */}
        <div className="card">
          <h2 className="title">Welcome to Services Management Dashboard!</h2>

          <div className="intro">
            <span className="subtitle">Get Started</span>
            <p className="description">You can customize your dashboard here.</p>
          </div>

          <button className="primary-btn">Customize Dashboard</button>

          <div className="three-columns">
            <div>
              <h3 className="section-title">Next Steps</h3>
              <ul>
                <li>Write a blog</li>
                <li>Add an about page</li>
                <li>View your site</li>
              </ul>
            </div>

            <div>
              <h3 className="section-title">At a Glance</h3>
              <ul>
                <li>35 Posts</li>
                <li>{services?.length || 0} Services</li>
                <li>18 Comments</li>
              </ul>
            </div>

            <div>
              <h3 className="section-title">More Actions</h3>
              <ul>
                <li>Manage Widgets or Menu</li>
                <li>Turn comments on or off</li>
                <li>More about getting started</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Draft */}
        <div className="card">
          <h3 className="section-title">Quick Draft</h3>
          <form className="draft-form">
            <input type="text" placeholder="Title" />
            <textarea placeholder="What's on your mind?" />
            <button className="primary-btn">Save Draft</button>
          </form>
        </div>

        {/* Tables */}
        <div className="tables">
          <div className="card half">
            <h3 className="section-title">Viewed services by users</h3>
            <div className="table-header">
              <span>Page</span>
              <span>Page Views</span>
            </div>

            {Views.map((item, index) => (
              <div className="table-row" key={index}>
                <span>{item.page}</span>
                <span>{item.views}</span>
              </div>
            ))}
          </div>

          <div className="card half">
            <h3 className="section-title">Recent Activities</h3>
            <div className="table-header">
              <span>Name</span>
              <span>Time</span>
            </div>

            {Recent.map((item, index) => (
              <div className="table-row" key={index}>
                <div className="profile">
                  <img src={item.profile} alt="profile" />
                  <div>
                    <div>{item.name}</div>
                    <small>{item.activity}</small>
                  </div>
                </div>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </Layout>
  );
}
