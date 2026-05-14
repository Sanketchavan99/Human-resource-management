import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Register from './pages/Register';
import LoginWithPassword from './pages/LoginWithPassword';
import VerifyOTP from './pages/VerifyOTP';
import CreatePassword from './pages/CreatePassword';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ProfileComplete from './pages/ProfileComplete';
import ProfileView from './pages/ProfileView';
import LandingPage from './pages/LandingPage';
import EnquiryForm from './pages/EnquiryForm';
import EnquiriesManagement from './pages/EnquiriesManagement';
import CompanyDashboard from './pages/CompanyDashboard';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AddEmployees from './pages/AddEmployees';
import MyPayslips from './pages/MyPayslips';
import MyPayslipDocuments from './pages/MyPayslipDocuments';
import PayslipManagement from './pages/PayslipManagement';
import PayslipDocumentManagement from './pages/PayslipDocumentManagement';
import AcceptOfferLetter from './pages/AcceptOfferLetter';
import OfferLetterManagement from './pages/OfferLetterManagement';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import EmployerDetailPage from './pages/EmployerDetailPage';
import { Providers } from './Providers';

function App() {
  return (
    <Providers>
      <Routes>
        <Route element={<MainLayout><Outlet /></MainLayout>}>
          {/* Public Routes */}
          <Route index path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginWithPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/enquiry" element={<EnquiryForm />} />

          {/* Protected Routes */}
          <Route
            path="/create-password"
            element={
              <ProtectedRoute>
                <CreatePassword />
              </ProtectedRoute>
            }
          />

          {/* Employee-Only Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="employee">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/complete"
            element={
              <ProtectedRoute requiredRole="employee">
                <ProfileComplete />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/view"
            element={
              <ProtectedRoute requiredRole="employee">
                <ProfileView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payslips"
            element={
              <ProtectedRoute requiredRole="employee">
                <MyPayslips />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payslip-documents"
            element={
              <ProtectedRoute requiredRole="employee">
                <MyPayslipDocuments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/accept-offer-letter"
            element={
              <ProtectedRoute requiredRole="employee">
                <AcceptOfferLetter />
              </ProtectedRoute>
            }
          />

          {/* Employer-Only Routes */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute requiredRole="employer">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/add-employees"
            element={
              <ProtectedRoute requiredRole="employer">
                <AddEmployees />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/payslips"
            element={
              <ProtectedRoute requiredRole="employer">
                <PayslipManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/payslip-documents"
            element={
              <ProtectedRoute requiredRole="employer">
                <PayslipDocumentManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/offer-letters"
            element={
              <ProtectedRoute requiredRole="employer">
                <OfferLetterManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin-Only Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employee/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employer/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <EmployerDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute requiredRole="admin">
                <EnquiriesManagement />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Providers>
  );
}

export default App;

