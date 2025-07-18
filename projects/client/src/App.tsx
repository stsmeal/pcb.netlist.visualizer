// Global application styles
import './App.css';
// React Router components for client-side navigation
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page components
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
// Authentication wrapper component
import RequireAuth from './components/RequireAuth';

/**
 * App Component
 * 
 * Root component of the PCB Netlist Visualizer application.
 * Sets up client-side routing and authentication protection for pages.
 * 
 * Route Structure:
 * - /login: Public login page for user authentication
 * - /sign-up: Public registration page for new users
 * - /: Protected homepage requiring authentication
 * 
 * Features:
 * - Client-side routing with React Router
 * - Authentication-protected routes
 * - Clean separation of public and private pages
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public authentication routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        
        {/* Protected main application route */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
