import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import ComplaintDetails from './pages/ComplaintDetails';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedType }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedType && user.type !== allowedType) return <Navigate to="/" replace />;
  return children;
};

const RootRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return user.type === 'Student'
    ? <Navigate to="/student/dashboard" replace />
    : <Navigate to="/management/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedType="Student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />

              <Route path="/management/dashboard" element={
                <ProtectedRoute allowedType="Management">
                  <ManagementDashboard />
                </ProtectedRoute>
              } />

              <Route path="/complaint/:id" element={
                <ProtectedRoute>
                  <ComplaintDetails />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
