import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";

import { Navbar } from "./components/Navbar.jsx";
import { FloatingSideBar } from "./components/FloatingSideBar";

import { LoginPage } from "./pages/LadingPage/LoginPage/LoginPage.jsx";
import { SignupPage } from "./pages/LadingPage/SignupPage/SignupPage.jsx";
import { ProfilePage } from "./pages/LadingPage/ProfilePage/ProfilePage.jsx";
import Profile from "./pages/Profile/Profile.jsx";
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
import AddAppointment from "./pages/Appointments/AddAppointment.jsx";
import CreateAppointment from "./pages/Appointments/CreateAppointment.jsx";
import PaymentHistory from "./pages/BillingHistory/PaymentHistory.jsx";
import { HelpPage } from "./pages/Support/HelpPage.jsx";
import StaffManage from "./pages/Staff/StaffManage.jsx";
import { ViewPlan } from "./pages/Plans/Plans.jsx";
import Attendance from "./pages/Attendance/Attendance.jsx";

function App() {

  /* ===============================
     HOOKS (ORDER SAFE)
  =============================== */

  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  /* ===============================
     FETCH STAFF PROFILE
  =============================== */

  const fetchStaffProfile = async () => {
    const token = localStorage.getItem("staffToken");
    if (!token || !currentUser || currentUser.role !== "staff") return;

    try {
      const res = await fetch("http://localhost:5000/api/staffProfile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const updatedUser = { ...data, role: "staff" };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to fetch staff profile", err);
    }
  };

  /* ===============================
     RESTORE AUTH ON REFRESH
  =============================== */

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const staffToken = localStorage.getItem("staffToken");

    const token = adminToken || staffToken;
    const storedUser = localStorage.getItem("currentUser");

    if (token && storedUser) {
      setIsLoggedIn(true);
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      if (user.role === "staff") {
        fetchStaffProfile();
      }
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }

    setAuthReady(true);
  }, []);

  if (!authReady) return null;

  /* ===============================
     SIDEBAR VISIBILITY
  =============================== */

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
    "/plans",
    "/support",
    "/staff",
    "/attendance",
    "/settings"
  ];

  const showSidebar = systemRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  /* ===============================
     ROLE HELPERS
  =============================== */

  const resolveDashboardPath = (user) =>
    user?.role === "admin" ? "/dashboard" : "/staff-dashboard";

  const dashboardLink = resolveDashboardPath(currentUser);

  const RequireRole = ({ role, children }) => {
    if (!isLoggedIn || !currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (role && currentUser.role !== role) {
      return <Navigate to={resolveDashboardPath(currentUser)} replace />;
    }

    return children;
  };

  /* ===============================
     RENDER
  =============================== */

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
        {showSidebar && isLoggedIn && (
          <FloatingSideBar
            dashboardLink={dashboardLink}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
          />
        )}

        <div style={{ flex: 1 }}>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lpservices" element={<LPServices />} />

            {/* AUTH */}
            <Route
              path="/login"
              element={
                isLoggedIn
                  ? <Navigate to={dashboardLink} replace />
                  : <LoginPage
                      setIsLoggedIn={setIsLoggedIn}
                      setCurrentUser={setCurrentUser}
                    />
              }
            />

            <Route
              path="/signup"
              element={
                isLoggedIn
                  ? <Navigate to={dashboardLink} replace />
                  : <SignupPage
                      setIsLoggedIn={setIsLoggedIn}
                      setCurrentUser={setCurrentUser}
                    />
              }
            />

            {/* DASHBOARDS */}
            <Route
              path="/dashboard"
              element={
                <RequireRole role="admin">
                  <Dashboard />
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

            {/* SYSTEM */}
            <Route
              path="/services"
              element={
                <RequireRole>
                  <Services />
                </RequireRole>
              }
            />

            <Route
              path="/reports"
              element={
                <RequireRole>
                  <Reports />
                </RequireRole>
              }
            />

            <Route
              path="/customers"
              element={
                <RequireRole>
                  <CustomerList />
                </RequireRole>
              }
            />

            <Route
              path="/customer/:id"
              element={
                <RequireRole>
                  <CustomerDetails />
                </RequireRole>
              }
            />

            <Route
              path="/appointments"
              element={
                <RequireRole>
                  <AdminAppointments />
                </RequireRole>
              }
            />

            <Route
              path="/add-appointment"
              element={
                <RequireRole role="admin">
                  <AddAppointment />
                </RequireRole>
              }
            />

            <Route
              path="/create-appointment/:salonId"
              element={
                <RequireRole role="admin">
                  <CreateAppointment />
                </RequireRole>
              }
            />

            <Route
              path="/paymenthistory"
              element={
                <RequireRole>
                  <PaymentHistory />
                </RequireRole>
              }
            />

            <Route
              path="/plans"
              element={
                <RequireRole role="admin">
                  <ViewPlan />
                </RequireRole>
              }
            />

            <Route
              path="/support"
              element={
                <RequireRole>
                  <HelpPage />
                </RequireRole>
              }
            />

            <Route
              path="/staff"
              element={
                <RequireRole role="admin">
                  <StaffManage />
                </RequireRole>
              }
            />

            <Route
              path="/attendance"
              element={
                <RequireRole role="admin">
                  <Attendance />
                </RequireRole>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireRole>
                  <Settings />
                </RequireRole>
              }
            />

            <Route
              path="/profile"
              element={
                <RequireRole>
                  <Profile />
                </RequireRole>
              }
            />

            <Route
              path="/profilepage"
              element={
                <RequireRole>
                  <ProfilePage
                    isLoggedIn={isLoggedIn}
                    currentUser={currentUser}
                  />
                </RequireRole>
              }
            />

            <Route
              path="/activity"
              element={
                <RequireRole>
                  <ActivityPage isLoggedIn={isLoggedIn} />
                </RequireRole>
              }
            />

            <Route
              path="/history"
              element={
                <RequireRole>
                  <HistoryPage isLoggedIn={isLoggedIn} />
                </RequireRole>
              }
            />

          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
