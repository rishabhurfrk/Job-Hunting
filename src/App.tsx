import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

const ProtectedRoute = ({ children, adminOnly }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  if (!adminOnly && profile?.role === 'admin' && window.location.pathname === '/dashboard') {
    // This condition is a bit tricky, ideally handled by a root-level redirect or a dedicated / route
  } else if (!adminOnly && profile?.role !== 'admin' && window.location.pathname === '/admin') {
     return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppRoutes = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route 
        path="/dashboard"
        element={
          <ProtectedRoute>
            {profile?.role === 'admin' ? <Navigate to="/admin" /> : <UserDashboard />}
          </ProtectedRoute>
        }
      />
      <Route 
        path="/admin"
        element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to={profile?.role === 'admin' ? "/admin" : "/dashboard"} />} /> 
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Toaster />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
