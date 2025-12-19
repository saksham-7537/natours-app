import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import TourDetails from './pages/TourDetails';
import Footer from './components/Footer';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import Payment from './components/Payment';
import Booking from './pages/Booking';
// import Error from './pages/Error';

const App = () => {
  // checking auth on every reload of page
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth])

  return (
    <Router>
      {/* Common header */}
      <Header />
      {/* All routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours/slug/:slug" element={<TourDetails />} />
        <Route path="/users/login" element={<Login />}  /> 
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
        <Route path="/tour/:tourId/book" element={<Booking />} />
      </Routes>
      {/* Common Footer */}
      <Footer />
    </Router>
  );
};

export default App;
