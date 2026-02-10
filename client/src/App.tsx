import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';

const AuthWrapper: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return showLogin ? (
    <Login onToggle={() => setShowLogin(false)} />
  ) : (
    <Register onToggle={() => setShowLogin(true)} />
  );
};

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AuthWrapper />
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
