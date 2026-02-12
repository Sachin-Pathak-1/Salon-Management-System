import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";

import { Navbar } from "./components/Navbar.jsx";
import { FloatingSideBar } from "./components/FloatingSideBar";

/* ================= LANDING PAGES ================= */

import { LoginPage } from "./pages/LadingPage/LoginPage/LoginPage.jsx";
import { SignupPage } from "./pages/LadingPage/SignupPage/SignupPage.jsx";
import { ProfilePage } from "./pages/LadingPage/ProfilePage/ProfilePage.jsx";
import { ActivityPage } from "./pages/LadingPage/Activity/ActivityPage.jsx";
import { HistoryPage } from "./pages/LadingPage/History/HistoryPage.jsx";
import { CustomerList } from "./pages/LadingPage/CustomerList/CustomerList.jsx";
import { CustomerDetails } from "./pages/LadingPage/CustomerDetails/CustomerDetails.jsx";
import { Home } from "./pages/LadingPage/Home/Home.jsx";
import { LPServices } from "./pages/LadingPage/Services/Services.jsx";
import { About } from "./pages/LadingPage/About/About.jsx";
import { Contact } from "./pages/LadingPage/Contacts/Contact.jsx";

/* ================= SYSTEM PAGES ================= */

import { Dashboard } from "./pages/Dashboard/Dashboard.jsx";
import { StaffDashboard } from "./pages/Dashboard/StaffDashboard.jsx";
import { ManagerDashboard } from "./pages/Dashboard/ManagerDashboard.jsx";
import { Services } from "./pages/Services/Services.jsx";
import { Reports } from "./pages/Reports/Reports.jsx";
import { Settings } from "./pages/Settings.jsx";
import AdminAppointments from "./pages/Appointments/Appointments.jsx";
import AddAppointment from "./pages/Appointments/AddAppointment.jsx";
import CreateAppointment from "./pages/Appointments/CreateAppointment.jsx";
import PaymentHistory from "./pages/BillingHistory/PaymentHistory.jsx";
import { HelpPage } from "./pages/Support/HelpPage.jsx";
import StaffManage from "./pages/Staff/StaffManage.jsx";
import { ViewPlan } from "./pages/Plans/Plans.jsx";
import Profile from "./pages/Profile/Profile.jsx";

function App() {

  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeSalon, setActiveSalon] = useState("");

  /* ============================================
     RESTORE AUTH ON REFRESH (SAFE VERSION)
  ============================================ */

  useEffect(() => {

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");

    if (!token || !storedUser) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setAuthReady(true);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setCurrentUser(parsedUser);
    } catch {
      localStorage.clear();
      setIsLoggedIn(false);
      setCurrentUser(null);
    }

    setAuthReady(true);

  }, []);

  if (!authReady) return null;

  /* ============================================
     SIDEBAR VISIBILITY
  ============================================ */

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/lpservices"
  ];

  const showSidebar =
    isLoggedIn && !publicRoutes.includes(location.pathname);

  /* ============================================
     ROLE HELPERS
  ============================================ */

  const resolveDashboardPath = (user) => {
    if (!user) return "/login";

    if (user.role === "admin") return "/dashboard";
    if (user.role === "manager") return "/manager-dashboard";
    return "/staff-dashboard";
  };

  const dashboardLink = resolveDashboardPath(currentUser);

  const RequireRole = ({ roles = [], children }) => {

    if (!isLoggedIn || !currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(currentUser.role)) {
      return <Navigate to={dashboardLink} replace />;
    }

    return children;
  };

  /* ============================================
     RENDER
  ============================================ */

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        dashboardLink={dashboardLink}
        activeSalon={activeSalon}
        setActiveSalon={setActiveSalon}
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

            {/* ================= PUBLIC ================= */}

            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lpservices" element={<LPServices />} />

            {/* ================= AUTH ================= */}

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

            {/* ================= DASHBOARDS ================= */}

            <Route
              path="/dashboard"
              element={
                <RequireRole roles={["admin"]}>
                  <Dashboard />
                </RequireRole>
              }
            />

            <Route
              path="/manager-dashboard"
              element={
                <RequireRole roles={["manager"]}>
                  <ManagerDashboard />
                </RequireRole>
              }
            />

            <Route
              path="/staff-dashboard"
              element={
                <RequireRole roles={["staff"]}>
                  <StaffDashboard />
                </RequireRole>
              }
            />

            {/* ================= SYSTEM ROUTES ================= */}

            <Route
              path="/services"
              element={
                <RequireRole roles={["admin", "manager"]}>
                  <Services activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/reports"
              element={
                <RequireRole roles={["admin", "manager"]}>
                  <Reports />
                </RequireRole>
              }
            />

            <Route
              path="/customers"
              element={
                <RequireRole roles={["admin", "manager"]}>
                  <CustomerList />
                </RequireRole>
              }
            />

            <Route
              path="/customer/:id"
              element={
                <RequireRole roles={["admin", "manager"]}>
                  <CustomerDetails />
                </RequireRole>
              }
            />

            <Route
              path="/appointments"
              element={
                <RequireRole roles={["admin", "manager", "staff"]}>
                  <AdminAppointments />
                </RequireRole>
              }
            />

            <Route
              path="/add-appointment"
              element={
                <RequireRole roles={["admin"]}>
                  <AddAppointment />
                </RequireRole>
              }
            />

            <Route
              path="/create-appointment/:salonId"
              element={
                <RequireRole roles={["admin"]}>
                  <CreateAppointment />
                </RequireRole>
              }
            />

            <Route
              path="/paymenthistory"
              element={
                <RequireRole roles={["admin", "manager"]}>
                  <PaymentHistory />
                </RequireRole>
              }
            />

            <Route
              path="/plans"
              element={
                <RequireRole roles={["admin"]}>
                  <ViewPlan />
                </RequireRole>
              }
            />

            <Route
              path="/support"
              element={
                <RequireRole roles={["admin", "manager", "staff"]}>
                  <HelpPage />
                </RequireRole>
              }
            />

            <Route
              path="/staff"
              element={
                <RequireRole roles={["admin"]}>
                  <StaffManage activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireRole roles={["admin", "manager"]}>
                  <Settings />
                </RequireRole>
              }
            />

            <Route
              path="/profile"
              element={
                <RequireRole roles={["admin", "manager", "staff"]}>
                  <Profile />
                </RequireRole>
              }
            />

            <Route
              path="/profilepage"
              element={
                <RequireRole roles={["admin", "manager", "staff"]}>
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
                <RequireRole roles={["admin", "manager", "staff"]}>
                  <ActivityPage isLoggedIn={isLoggedIn} />
                </RequireRole>
              }
            />

            <Route
              path="/history"
              element={
                <RequireRole roles={["admin", "manager", "staff"]}>
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
