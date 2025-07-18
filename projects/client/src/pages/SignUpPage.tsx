// React hooks for state management
import { useState } from 'react';
// API service for user registration requests
import { post } from '../services/ApiService';
// React Router for navigation after successful registration
import { useNavigate } from 'react-router-dom';

/**
 * SignUpPage Component
 * 
 * Provides user registration interface for the PCB Netlist Visualizer.
 * Allows new users to create accounts with username, first name, last name,
 * and password. Upon successful registration, redirects to login page.
 * 
 * Features:
 * - Multi-field registration form with validation
 * - Success/error message handling with visual feedback
 * - Automatic redirect to login page after successful registration
 * - PCB-themed styling consistent with the application
 * - Proper form accessibility with labels and IDs
 */
function SignUpPage() {
  // Form state for user registration inputs
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  // Message state for displaying registration feedback
  const [message, setMessage] = useState('');
  // Navigation hook for redirecting after successful registration
  const navigate = useNavigate();

  /**
   * Handles form submission for user registration
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    try {
      // Prepare user data for registration
      const userData = { username, password, firstname, lastname };
      // Attempt registration with the API (no auth required for registration endpoint)
      await post('auth/register', userData, false);
      // Show success message and navigate to login after delay
      setMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000); // 2-second delay for user to read message
    } catch (err: any) {
      // Display error message on registration failure
      setMessage(err?.message || 'Registration failed');
    }
  };

  return (
    <div className="pcb-login-page">
      {/* Application Header */}
      <div className="pcb-header">
        <h1 className="pcb-title">PCB Netlist Visualizer</h1>
        <div className="pcb-subtitle">Create New Account</div>
      </div>

      {/* Main Sign Up Content Area */}
      <div className="pcb-login-content">
        <div className="pcb-login-container">
          <div className="pcb-panel">
            <h3 className="panel-title">Sign Up</h3>
            
            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="pcb-login-form">
              {/* Username Input */}
              <div className="pcb-input-group">
                <label className="pcb-input-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="pcb-input"
                  required
                  placeholder="Choose a username..."
                />
              </div>

              {/* First Name Input */}
              <div className="pcb-input-group">
                <label className="pcb-input-label" htmlFor="firstname">First Name</label>
                <input
                  id="firstname"
                  type="text"
                  value={firstname}
                  onChange={e => setFirstname(e.target.value)}
                  className="pcb-input"
                  required
                  placeholder="Enter first name..."
                />
              </div>

              {/* Last Name Input */}
              <div className="pcb-input-group">
                <label className="pcb-input-label" htmlFor="lastname">Last Name</label>
                <input
                  id="lastname"
                  type="text"
                  value={lastname}
                  onChange={e => setLastname(e.target.value)}
                  className="pcb-input"
                  required
                  placeholder="Enter last name..."
                />
              </div>

              {/* Password Input */}
              <div className="pcb-input-group">
                <label className="pcb-input-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pcb-input"
                  required
                  placeholder="Create a password..."
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="pcb-button primary login-button">
                📝 Create Account
              </button>
            </form>

            {/* Success/Error Message Display */}
            {message && (
              <div className={`pcb-panel ${message.includes('successfully') ? 'success-panel' : 'error-panel'}`}>
                <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>
                  {message.includes('successfully') ? '✓' : '⚠'} {message}
                </div>
              </div>
            )}

            {/* Link to Login Page */}
            <div className="pcb-login-footer">
              <a href="/login" className="pcb-link">
                🔐 Already have an account? Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
