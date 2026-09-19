import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import CustomerLayout from "../layouts/CustomerLayout";
import CRMLayout from "../layouts/CRMLayout";

import Home from "../pages/customer/Home";
import Services from "../pages/customer/Services";
import ServiceDetails from "../pages/customer/ServiceDetails";
import Booking from "../pages/customer/Booking";
import Checkout from "../pages/customer/Checkout";
import BookingSuccess from "../pages/customer/BookingSuccess";

import Dashboard from "../pages/customer/dashboard/Dashboard";
import Bookings from "../pages/customer/dashboard/Bookings";
import BookingDetails from "../pages/customer/dashboard/BookingDetails";

import Wishlist from "../pages/customer/Wishlist";
import Reviews from "../pages/customer/Reviews";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/auth/Unauthorized";

import CRMDashboard from "../pages/crm/Dashboard";
import Customers from "../pages/crm/Customers";
import Providers from "../pages/crm/Providers";
import CRMServices from "../pages/crm/Services";
import Categories from "../pages/crm/Categories";
import CRMBookings from "../pages/crm/Bookings";
import Leads from "../pages/crm/Leads";
import Transactions from "../pages/crm/Transactions";
import Tickets from "../pages/crm/Tickets";
import Notifications from "../pages/crm/Notifications";
import Users from "../pages/crm/Users";


import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";



function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            PUBLIC CUSTOMER ROUTES
        ===================================================== */}

        <Route element={<CustomerLayout />}>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/services/:serviceId"
            element={<ServiceDetails />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* =================================================
              PROTECTED CUSTOMER ROUTES
          ================================================= */}

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <RoleRoute allowedRoles={["customer"]} />
              }
            >
              <Route
                path="/booking/:serviceId"
                element={<Booking />}
              />

              <Route
                path="/checkout/:bookingId"
                element={<Checkout />}
              />

              <Route
                path="/booking-success/:bookingId"
                element={<BookingSuccess />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/dashboard/bookings"
                element={<Bookings />}
              />

              <Route
                path="/dashboard/bookings/:bookingId"
                element={<BookingDetails />}
              />

              <Route
                path="/wishlist"
                element={<Wishlist />}
              />

              <Route
                path="/reviews/:serviceId"
                element={<Reviews />}
              />
            </Route>
          </Route>
        </Route>

        {/* =====================================================
            PROTECTED CRM ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>
  <Route
    element={
      <RoleRoute
        allowedRoles={["admin", "sales", "support"]}
      />
    }
  >
    <Route path="/crm" element={<CRMLayout />}>
  <Route index element={<CRMDashboard />} />
  <Route path="customers" element={<Customers />} />
  <Route path="providers" element={<Providers />} />
  <Route path="services" element={<CRMServices />} />
  <Route path="categories" element={<Categories />} />
  <Route path="bookings" element={<CRMBookings />} />
  <Route path="leads" element={<Leads />} />
  <Route path="transactions" element={<Transactions />}/>
  <Route path="tickets"
  element={<Tickets />}/>
  <Route path="notifications" element={<Notifications />} />
  <Route path="users" element={<Users />} />

</Route>
  </Route>
</Route>
        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;