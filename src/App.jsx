import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react"
import { Navbar } from "./components/Navbar.jsx";
import { FloatingSideBar } from "./components/FloatingSideBar";

import { LoginPage } from "./pages/LadingPage/LoginPage/LoginPage.jsx";
import { SignupPage } from "./pages/LadingPage/SignupPage/SignupPage.jsx";
import { ProfilePage } from "./pages/LadingPage/ProfilePage/ProfilePage.jsx";
import Profile from "./pages/Profile/Profile.jsx"
import { ActivityPage } from "./pages/LadingPage/Activity/ActivityPage.jsx";
import { HistoryPage } from "./pages/LadingPage/History/HistoryPage.jsx";
import { CustomerList } from "./pages/LadingPage/CustomerList/CustomerList.jsx";
import { CustomerDetails } from "./pages/LadingPage/CustomerDetails/CustomerDetails.jsx";
import { Home } from "./pages/LadingPage/Home/Home.jsx";
import { LPServices } from "./pages/LadingPage/Services/Services.jsx";

import { Dashboard } from "./pages/Dashboard/Dashboard.jsx";
import { StaffDashboard } from "./pages/Dashboard/StaffDashboard.jsx";
import { Services } from "./pages/Services/Services.jsx";
import { Reports } from "./pages/Reports/Reports.jsx";
import { Settings } from "./pages/Settings.jsx";

import { About } from "./pages/LadingPage/About/About.jsx";
import { Contact } from "./pages/LadingPage/Contacts/Contact.jsx";
import AdminAppointments from "./pages/Appointments/Appointments.jsx";
import PaymentHistory from "./pages/BillingHistory/PaymentHistory.jsx";
import { HelpPage } from "./pages/Support/HelpPage.jsx";
import StaffManage from "./pages/Staff/StaffManage.jsx";

function App() {

  const location = useLocation();

  /* WHERE SIDEBAR SHOULD APPEAR */
  const systemRoutes = [
    "/dashboard",
    "/staff-dashboard",
    "/services",
    "/reports",
    "/customers",
    "/profile",
    "/activity",
    "/history",
    "/appointments",
    "/paymenthistory",
    "/support",
    "/staff",
    "/settings"
  ];

  const showSidebar = systemRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  const [services, setServices] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("currentUser");
      if (token && storedUser) {
        setIsLoggedIn(true);
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, []);

  const resolveDashboardPath = (user) =>
    user?.role === "admin" ? "/dashboard" : "/staff-dashboard";

  const dashboardLink = isLoggedIn && currentUser ? resolveDashboardPath(currentUser) : "/login";

  const RequireRole = ({ role, children }) => {
    if (!isLoggedIn || !currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (role && currentUser.role !== role) {
      return <Navigate to={resolveDashboardPath(currentUser)} replace />;
    }
    return children;
  };

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        dashboardLink={dashboardLink}
      />

      <div style={{ display: "flex" }}>

        {showSidebar && (
          <FloatingSideBar
            dashboardLink={dashboardLink}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
          />
        )}

        <div style={{ flex: 1 }}>

          <Routes>

            {/* LANDING */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lpservices" element={<LPServices />} />


            {/* AUTH */}
            <Route
              path="/login"
              element={
                <LoginPage
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  setCurrentUser={setCurrentUser}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <SignupPage
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  setCurrentUser={setCurrentUser}
                />
              }
            />

            {/* SYSTEM */}
            <Route
              path="/dashboard"
              element={
                <RequireRole role="admin">
                  <Dashboard services={services} />
                </RequireRole>
              }
            />
            <Route
              path="/staff-dashboard"
              element={
                <RequireRole role="staff">
                  <StaffDashboard />
                </RequireRole>
              }
            />

            <Route
              path="/services"
              element={<Services services={services} setServices={setServices} />}
            />

            <Route
              path="/reports"
              element={<Reports services={services} setServices={setServices} />}
            />

            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customer/:id" element={<CustomerDetails />} />

            <Route path="/profilepage" element={<ProfilePage isLoggedIn={isLoggedIn} currentUser={currentUser} />} />
            <Route path="/activity" element={<ActivityPage isLoggedIn={isLoggedIn} />} />
            <Route path="/history" element={<HistoryPage isLoggedIn={isLoggedIn} />} />
            <Route path="/appointments" element={<AdminAppointments/>}/>
            <Route path="/profilepage" element={<ProfilePage/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/paymenthistory" element={<PaymentHistory/>} />
            <Route path="/support" element={<HelpPage/>} />
            <Route path="/staff" element={<StaffManage/>} />
            <Route path="/settings" element={<Settings/>} />

          </Routes>

        </div>

      </div>
    </>
  );
}

export default App;
