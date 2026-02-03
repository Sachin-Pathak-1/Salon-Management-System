import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import React from "react"
import { Navbar } from "./components/Navbar.jsx";
import { FloatingSideBar } from "./components/FloatingSideBar";

import { LoginPage } from "./pages/LadingPage/LoginPage/LoginPage.jsx";
import { ProfilePage } from "./pages/LadingPage/ProfilePage/ProfilePage.jsx";
import Profile from "./pages/Profile/Profile.jsx"
import { ActivityPage } from "./pages/LadingPage/Activity/ActivityPage.jsx";
import { HistoryPage } from "./pages/LadingPage/History/HistoryPage.jsx";
import { CustomerList } from "./pages/LadingPage/CustomerList/CustomerList.jsx";
import { CustomerDetails } from "./pages/LadingPage/CustomerDetails/CustomerDetails.jsx";
import { Home } from "./pages/LadingPage/Home/Home.jsx";
import { LPServices } from "./pages/LadingPage/Services/Services.jsx";

import { Dashboard } from "./pages/Dashboard/Dashboard.jsx";
import { Services } from "./pages/Services/Services.jsx";
import { Reports } from "./pages/Reports/Reports.jsx";
import { Settings } from "./pages/Settings.jsx";

import { About } from "./pages/LadingPage/About/About.jsx";
import { Contact } from "./pages/LadingPage/Contacts/Contact.jsx";
import AdminAppointments from "./pages/Appointments/Appointments.jsx";
import PaymentHistory from "./pages/BillingHistory/PaymentHistory.jsx";
import { HelpPage } from "./pages/Support/HelpPage.jsx";
import TeamManage from "./pages/Staff/TeamManage.jsx";

function App() {

  const location = useLocation();

  /* WHERE SIDEBAR SHOULD APPEAR */
  const systemRoutes = [
    "/dashboard",
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

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <div style={{ display: "flex" }}>

        {showSidebar && <FloatingSideBar />}

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

            {/* SYSTEM */}
            <Route path="/dashboard" element={<Dashboard services={services} />} />

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
            <Route path="/staff" element={<TeamManage/>} />
            <Route path="/settings" element={<Settings/>} />


          </Routes>

        </div>

      </div>
    </>
  );
}

export default App;
