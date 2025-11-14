import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import WegoHeader from './components/WegoHeader';
import MediaOnPage from './components/MediaOnPage';
import Partner from './components/partner';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './routes/privatRoutes';

// Import other pages
import About from './pages/About';
// import Contact from './pages/Contact';
// import Support from './pages/Support';
// import Experience from './pages/Experience';
// import Booking from './pages/Booking';

import './index.css';

// ✅ Layout component: manage header visibility
function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Hide header on login, partner, and dashboard pages
  const hideHeader =
    path === '/login' ||
    path === '/login/' ||
    path === '/partner' ||
    path === '/partner/' ||
    path === '/dashboard' ||
    path === '/dashboard/' ||
    path.startsWith('/dashboard/');

  return (
    <>
      {!hideHeader && <WegoHeader />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* 🏠 Home Page */}
            <Route path="/" element={<MediaOnPage />} />

            {/* 📄 Other pages */}
            <Route path="/about" element={<About />} />
            {/* <Route path="/contact" element={<Contact />} /> */}
            {/* <Route path="/support" element={<Support />} /> */}
            {/* <Route path="/experience" element={<Experience />} /> */}
            {/* <Route path="/booking" element={<Booking />} /> */}

            {/* 👥 Partner & Auth */}
            <Route path="/partner" element={<Partner />} />
            <Route path="/login" element={<Login />} />

            {/* 🔒 Dashboard (Protected) */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

