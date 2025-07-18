import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SignUpPage from './SignUpPage';
import * as ApiService from '../services/ApiService';

// Mock the ApiService
vi.mock('../services/ApiService', () => ({
  post: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.clearAllTimers();
  });

  it('should render the sign up form correctly', () => {
    renderWithRouter(<SignUpPage />);
    
    expect(screen.getByText('PCB Netlist Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Create New Account')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    
    expect(screen.getByText('🔐 Already have an account? Login')).toBeInTheDocument();
  });

  it('should update input values when typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(usernameInput, 'testuser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(firstnameInput).toHaveValue('John');
    expect(lastnameInput).toHaveValue('Doe');
    expect(passwordInput).toHaveValue('testpass');
  });

  it('should have required attributes on all inputs', () => {
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(usernameInput).toBeRequired();
    expect(firstnameInput).toBeRequired();
    expect(lastnameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should call ApiService.post with correct data on form submission', async () => {
    const user = userEvent.setup();
    (ApiService.post as any).mockResolvedValueOnce({});
    
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    expect(ApiService.post).toHaveBeenCalledWith(
      'auth/register',
      { 
        username: 'testuser', 
        password: 'testpass', 
        firstname: 'John', 
        lastname: 'Doe' 
      },
      false
    );
  });

  it('should display success message on successful registration', async () => {
    const user = userEvent.setup();
    (ApiService.post as any).mockResolvedValueOnce({});
    
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('✓ Account created successfully! Redirecting to login...')).toBeInTheDocument();
    });
  });

  it('should display error message on registration failure', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Username already exists');
    (ApiService.post as any).mockRejectedValueOnce(mockError);
    
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(usernameInput, 'existinguser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('⚠ Username already exists')).toBeInTheDocument();
    });
  });

  it('should display generic error message when error has no message', async () => {
    const user = userEvent.setup();
    (ApiService.post as any).mockRejectedValueOnce({});
    
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('⚠ Registration failed')).toBeInTheDocument();
    });
  });

  it('should prevent form submission when fields are empty', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SignUpPage />);
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    // Try to submit without filling fields
    await user.click(submitButton);
    
    // API should not be called
    expect(ApiService.post).not.toHaveBeenCalled();
  });

  it('should have correct placeholder text', () => {
    renderWithRouter(<SignUpPage />);
    
    expect(screen.getByPlaceholderText('Choose a username...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter first name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter last name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password...')).toBeInTheDocument();
  });

  it('should have link to login page', () => {
    renderWithRouter(<SignUpPage />);
    
    const loginLink = screen.getByRole('link', { name: /already have an account/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup();
    (ApiService.post as any).mockResolvedValueOnce({});
    
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(usernameInput, 'testuser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    await user.keyboard('{Enter}');
    
    expect(ApiService.post).toHaveBeenCalledWith(
      'auth/register',
      { 
        username: 'testuser', 
        password: 'testpass', 
        firstname: 'John', 
        lastname: 'Doe' 
      },
      false
    );
  });

  it('should show success panel with correct styling for successful registration', async () => {
    const user = userEvent.setup();
    (ApiService.post as any).mockResolvedValueOnce({});
    
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      const successMessage = screen.getByText('✓ Account created successfully! Redirecting to login...');
      expect(successMessage).toBeInTheDocument();
      
      // Check that the success panel has the correct CSS class
      const successPanel = successMessage.closest('.pcb-panel');
      expect(successPanel).toHaveClass('success-panel');
    });
  });

  it('should show error panel with correct styling for failed registration', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Registration failed');
    (ApiService.post as any).mockRejectedValueOnce(mockError);
    
    renderWithRouter(<SignUpPage />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const firstnameInput = screen.getByLabelText(/first name/i);
    const lastnameInput = screen.getByLabelText(/last name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(firstnameInput, 'John');
    await user.type(lastnameInput, 'Doe');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      const errorMessage = screen.getByText('⚠ Registration failed');
      expect(errorMessage).toBeInTheDocument();
      
      // Check that the error panel has the correct CSS class
      const errorPanel = errorMessage.closest('.pcb-panel');
      expect(errorPanel).toHaveClass('error-panel');
    });
  });
});
