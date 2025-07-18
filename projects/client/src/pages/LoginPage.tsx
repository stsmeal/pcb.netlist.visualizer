// React hooks for state management
import { useState } from 'react';
// API service for authentication requests
import { post } from '../services/ApiService';
// React Router for navigation after successful login
import { useNavigate } from 'react-router-dom';

/**
 * LoginPage Component
 * 
 * Provides user authentication interface for the PCB Netlist Visualizer.
 * Handles user login with username/password and stores JWT token for
 * subsequent authenticated API requests.
 * 
 * Features:
 * - Form validation and submission
 * - Error message display
 * - JWT token storage in localStorage
 * - Automatic navigation to homepage on success
 * - PCB-themed styling consistent with the application
 */
function LoginPage() {
  // Form state for user inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Message state for displaying login errors or feedback
  const [message, setMessage] = useState('');
  // Navigation hook for redirecting after successful login
  const navigate = useNavigate();

  /**
   * Handles form submission for user login
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    const userData = { username, password };

    try {
      // Attempt authentication with the API (no auth required for login endpoint)
      const res = await post('auth/token', userData, false);
      // Store JWT token for future authenticated requests
      localStorage.setItem('token', res.token);
      // Navigate to homepage on successful login
      navigate('/');
    } catch (err: any) {
      // Clear password field and show error message on failure
      setPassword('');
      setMessage(err?.message || 'Login failed');
    }
  };

  return (
    <div className="pcb-login-page">
      {/* Application Header */}
      <div className="pcb-header">
        <h1 className="pcb-title">PCB Netlist Visualizer</h1>
        <div className="pcb-subtitle">Authentication Required</div>
      </div>

      {/* Main Login Content Area */}
      <div className="pcb-login-content">
        <div className="pcb-login-container">
          <div className="pcb-panel">
            <h3 className="panel-title">Login</h3>
            
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="pcb-login-form">
              {/* Username Input */}
              <div className="pcb-input-group">
                <label className="pcb-input-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="pcb-input"
                  required
                  placeholder="Enter username..."
                />
              </div>

              {/* Password Input */}
              <div className="pcb-input-group">
                <label className="pcb-input-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pcb-input"
                  required
                  placeholder="Enter password..."
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="pcb-button primary login-button">
                🔐 Login
              </button>
            </form>

            {/* Error Message Display */}
            {message && (
              <div className="pcb-panel error-panel">
                <div className="error-message">⚠ {message}</div>
              </div>
            )}

            {/* Link to Sign Up Page */}
            <div className="pcb-login-footer">
              <a href="/sign-up" className="pcb-link">
                📝 Create new account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
