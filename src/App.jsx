import { Routes, Route, useLocation, Navigate, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import React from "react";

import { Navbar } from "./components/Navbar.jsx";
import { FloatingSideBar } from "./components/FloatingSideBar";
import { SubscriptionPopup } from "./components/SubscriptionPopup.jsx";
import { ToastProvider } from "./context/ToastContext";
import api from "./api.js";

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

function SubscriptionGlassyGate({ trialExpired, trialEndsAt, children }) {
  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none min-h-screen select-none blur-[2px] opacity-80"
      >
        {children}
      </div>
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/35 px-6">
        <div
          className="w-full max-w-xl rounded-2xl border p-8 text-center shadow-lg"
          style={{ borderColor: "var(--border-light)", backgroundColor: "var(--background)" }}
        >
          <h2 className="text-3xl font-bold">Subscription Required</h2>
          <p className="mt-3 text-sm opacity-85">
            {trialExpired
              ? "Your 14-day trial has expired. Subscribe to continue full access."
              : "Choose a subscription plan to unlock full interaction."}
          </p>
          {trialEndsAt && (
            <p className="mt-2 text-xs opacity-70">
              Trial end date: {new Date(trialEndsAt).toLocaleDateString()}
            </p>
          )}
          <Link
            to="/plans"
            className="inline-block mt-6 rounded-lg px-5 py-2.5 font-semibold text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Subscribe / View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {

  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeSalon, setActiveSalon] = useState(localStorage.getItem("activeSalon") || "");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

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

  const isAdminUser = currentUser?.role === "admin";
  const shouldEnforceSubscription = isLoggedIn && isAdminUser;

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!shouldEnforceSubscription || !currentUser?.id) {
      setSubscriptionStatus(null);
      setSubscriptionLoading(false);
      return;
    }

    try {
      setSubscriptionLoading(true);
      const res = await api.get("/plans/selection");
      const data = res?.data || {};
      const hasActiveSubscription = Boolean(data?.selectedPlan || data?.hasActiveSubscription);
      const hasPlanAccess = Boolean(data?.hasPlanAccess) || hasActiveSubscription;

      setSubscriptionStatus({
        loaded: true,
        hasActiveSubscription,
        hasPlanAccess,
        isLocked: Boolean(data?.isLocked) || !hasPlanAccess,
        isDemoPlanSelected: Boolean(data?.isDemoPlanSelected),
        demoPlanActive: Boolean(data?.demoPlanActive),
        demoPlanConsumed: Boolean(data?.demoPlanConsumed),
        trialExpired: Boolean(data?.trialExpired),
        trialRemainingDays: Number(data?.trialRemainingDays) || 0,
        trialEndsAt: data?.trialEndsAt || null
      });
    } catch {
      // Fail-open to avoid locking the app due transient API/network issues.
      setSubscriptionStatus((prev) => prev || {
        loaded: false,
        hasActiveSubscription: false,
        hasPlanAccess: true,
        isLocked: false,
        isDemoPlanSelected: false,
        demoPlanActive: false,
        demoPlanConsumed: false,
        trialExpired: false,
        trialRemainingDays: 0,
        trialEndsAt: null
      });
    } finally {
      setSubscriptionLoading(false);
    }
  }, [shouldEnforceSubscription, currentUser?.id]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  useEffect(() => {
    const onSubscriptionUpdated = () => {
      fetchSubscriptionStatus();
    };

    window.addEventListener("subscription-updated", onSubscriptionUpdated);
    return () => {
      window.removeEventListener("subscription-updated", onSubscriptionUpdated);
    };
  }, [fetchSubscriptionStatus]);

  useEffect(() => {
    if (!shouldEnforceSubscription || !subscriptionStatus?.demoPlanActive || !subscriptionStatus?.trialEndsAt) {
      return;
    }

    const endsAt = new Date(subscriptionStatus.trialEndsAt).getTime();
    const delay = Math.max(endsAt - Date.now(), 0) + 200;
    const timeoutId = setTimeout(() => {
      fetchSubscriptionStatus();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [
    shouldEnforceSubscription,
    subscriptionStatus?.demoPlanActive,
    subscriptionStatus?.trialEndsAt,
    fetchSubscriptionStatus
  ]);

  useEffect(() => {
    setHasShownPopup(false);
    setShowSubscriptionPopup(false);
  }, [currentUser?.id, isLoggedIn]);

  useEffect(() => {
    if (!shouldEnforceSubscription || subscriptionLoading || !subscriptionStatus) return;
    if (subscriptionStatus.hasPlanAccess) {
      setShowSubscriptionPopup(false);
      return;
    }

    if (location.pathname === "/dashboard" && !hasShownPopup) {
      setShowSubscriptionPopup(true);
      setHasShownPopup(true);
    }
  }, [
    shouldEnforceSubscription,
    subscriptionLoading,
    subscriptionStatus,
    location.pathname,
    hasShownPopup
  ]);

  useEffect(() => {
    if (!shouldEnforceSubscription || !subscriptionStatus || subscriptionLoading) return;
    if (location.pathname === "/plans") return;

    if (subscriptionStatus.isLocked) {
      setShowSubscriptionPopup(true);
      navigate("/plans", { replace: true });
    }
  }, [
    shouldEnforceSubscription,
    subscriptionStatus,
    subscriptionLoading,
    location.pathname,
    navigate
  ]);

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

  const RequireRole = ({ roles = [], enforceSubscription = false, children }) => {

    if (!isLoggedIn || !currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(currentUser.role)) {
      return <Navigate to={dashboardLink} replace />;
    }

    if (
      enforceSubscription &&
      shouldEnforceSubscription &&
      location.pathname !== "/plans"
    ) {
      if (subscriptionLoading || !subscriptionStatus) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm opacity-80">Checking subscription status...</p>
          </div>
        );
      }

      if (subscriptionStatus.loaded === false) {
        return children;
      }

      if (!subscriptionStatus.hasPlanAccess) {
        return (
          <SubscriptionGlassyGate
            trialExpired={subscriptionStatus.trialExpired}
            trialEndsAt={subscriptionStatus.trialEndsAt}
          >
            {children}
          </SubscriptionGlassyGate>
        );
      }
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
                <RequireRole enforceSubscription roles={["admin"]}>
                  <Dashboard activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/manager-dashboard"
              element={
                <RequireRole enforceSubscription roles={["manager"]}>
                  <ManagerDashboard />
                </RequireRole>
              }
            />

            <Route
              path="/staff-dashboard"
              element={
                <RequireRole enforceSubscription roles={["staff"]}>
                  <StaffDashboard activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            {/* ================= SYSTEM ROUTES ================= */}

            <Route
              path="/services"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager"]}>
                  <Services activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/reports"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager"]}>
                  <Reports activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/inventory"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager", "staff"]}>
                  <Inventory activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/expenses"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager", "staff"]}>
                  <Expenses activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/customers"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager"]}>
                  <CustomerList />
                </RequireRole>
              }
            />

            <Route
              path="/customer/:id"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager"]}>
                  <CustomerDetails />
                </RequireRole>
              }
            />

            <Route
              path="/appointments"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager", "staff"]}>
                  <AdminAppointments />
                </RequireRole>
              }
            />

            <Route
              path="/add-appointment"
              element={
                <RequireRole enforceSubscription roles={["admin"]}>
                  <AddAppointment />
                </RequireRole>
              }
            />

            <Route
              path="/create-appointment/:salonId"
              element={
                <RequireRole enforceSubscription roles={["admin"]}>
                  <CreateAppointment />
                </RequireRole>
              }
            />

            <Route
              path="/paymenthistory"
              element={
                <RequireRole enforceSubscription roles={["admin"]}>
                  <PaymentHistory />
                </RequireRole>
              }
            />

            <Route
              path="/plans"
              element={
                <RequireRole enforceSubscription roles={["admin"]}>
                  <ViewPlan />
                </RequireRole>
              }
            />

            <Route
              path="/support"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager", "staff"]}>
                  <HelpPage />
                </RequireRole>
              }
            />

            <Route
              path="/staff"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager"]}>
                  <StaffManage activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager"]}>
                  <Settings />
                </RequireRole>
              }
            />

            <Route
              path="/attendance"
              element={
                <RequireRole enforceSubscription roles={["manager"]}>
                  <ManagerAttendance />
                </RequireRole>
              }
            />

            <Route
              path="/attendance-report"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager"]}>
                  <AttendanceReport activeSalon={activeSalon} />
                </RequireRole>
              }
            />

            <Route
              path="/profile"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager", "staff"]}>
                  <Profile />
                </RequireRole>
              }
            />


            <Route
              path="/activity"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager", "staff"]}>
                  <ActivityPage isLoggedIn={isLoggedIn} />
                </RequireRole>
              }
            />

            <Route
              path="/history"
              element={
                <RequireRole enforceSubscription roles={["admin", "manager", "staff"]}>
                  <HistoryPage isLoggedIn={isLoggedIn} />
                </RequireRole>
              }
            />

          </Routes>

        </div>
      </div>
      <SubscriptionPopup
        open={showSubscriptionPopup}
        trialExpired={Boolean(subscriptionStatus?.trialExpired)}
        trialRemainingDays={Number(subscriptionStatus?.trialRemainingDays) || 0}
        isDemoPlanSelected={Boolean(subscriptionStatus?.isDemoPlanSelected)}
        onClose={() => setShowSubscriptionPopup(false)}
        onSubscribe={() => {
          setShowSubscriptionPopup(false);
          navigate("/plans");
        }}
      />
    </ToastProvider>
  );
}

export default App;
