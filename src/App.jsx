import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";

import { Navbar } from "./components/Navbar.jsx";
import { FloatingSideBar } from "./components/FloatingSideBar";
import { ToastProvider } from "./context/ToastContext";

/* ================= LANDING PAGES ================= */

import { LoginPage } from "./pages/LadingPage/LoginPage/LoginPage.jsx";
import { SignupPage } from "./pages/LadingPage/SignupPage/SignupPage.jsx";
import { ActivityPage } from "./pages/Activity/ActivityPage.jsx";
import { HistoryPage } from "./pages/History/HistoryPage.jsx";
import { CustomerList } from "./pages/Customers/CustomerList.jsx";
import { CustomerDetails } from "./pages/Customers/CustomerDetails.jsx";
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
import ManagerAttendance from "./pages/Attendance/ManagerAttendance.jsx";
import AttendanceReport from "./pages/Attendance/AttendanceReport.jsx";
import { Inventory } from "./pages/Inventory/Inventory.jsx";
import { Expenses } from "./pages/Expenses/Expenses.jsx";

function App() {

  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeSalon, setActiveSalon] = useState(localStorage.getItem("activeSalon") || "");

  // Callback function to update activeSalon in parent and localStorage
  const handleSetActiveSalon = (salonId) => {
    setActiveSalon(salonId);
    localStorage.setItem("activeSalon", salonId);
  };

  useEffect(() => {
    if (activeSalon) {
      localStorage.setItem("activeSalon", activeSalon);
    }
  }, [activeSalon]);

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
    <ToastProvider>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        dashboardLink={dashboardLink}
        activeSalon={activeSalon}
        setActiveSalon={handleSetActiveSalon}
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
                    setActiveSalon={handleSetActiveSalon}
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
                    setActiveSalon={handleSetActiveSalon}
                  />
              }
            />

            {/* ================= DASHBOARDS ================= */}

            <Route
              path="/dashboard"
              element={
                <RequireRole roles={["admin"]}>
                  <Dashboard activeSalon={activeSalon} />
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
                  <StaffDashboard activeSalon={activeSalon} />
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
                  <Reports activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/inventory"
              element={
                <RequireRole roles={["admin", "manager", "staff"]}>
                  <Inventory activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/expenses"
              element={
                <RequireRole roles={["admin", "manager", "staff"]}>
                  <Expenses activeSalon={activeSalon} />
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
                <RequireRole roles={["admin"]}>
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
                <RequireRole roles={["admin", "manager"]}>
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
              path="/attendance"
              element={
                <RequireRole roles={["manager"]}>
                  <ManagerAttendance />
                </RequireRole>
              }
            />

            <Route
              path="/attendance-report"
              element={
                <RequireRole roles={["admin", "manager"]}>
                  <AttendanceReport activeSalon={activeSalon} />
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
    </ToastProvider>
  );
}

export default App;
