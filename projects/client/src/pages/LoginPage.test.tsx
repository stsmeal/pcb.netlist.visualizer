import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('should render the login form correctly', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('PCB Netlist Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText('Enter username...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    
    expect(screen.getByText('📝 Create new account')).toBeInTheDocument();
  });

  it('should update input values when typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    const passwordInput = screen.getByPlaceholderText('Enter password...');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  it('should have required attributes on inputs', () => {
    renderWithRouter(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    const passwordInput = screen.getByPlaceholderText('Enter password...');
    
    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should call ApiService.post with correct data on form submission', async () => {
    const user = userEvent.setup();
    const mockResponse = { token: 'mock-token-123' };
    (ApiService.post as any).mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    const passwordInput = screen.getByPlaceholderText('Enter password...');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    expect(ApiService.post).toHaveBeenCalledWith(
      'auth/token',
      { username: 'testuser', password: 'testpass' },
      false
    );
  });

  it('should store token in localStorage and navigate to home on successful login', async () => {
    const user = userEvent.setup();
    const mockResponse = { token: 'mock-token-123' };
    (ApiService.post as any).mockResolvedValueOnce(mockResponse);
    
    renderWithRouter(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    const passwordInput = screen.getByPlaceholderText('Enter password...');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-token-123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should display error message and clear password on login failure', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Invalid credentials');
    (ApiService.post as any).mockRejectedValueOnce(mockError);
    
    renderWithRouter(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    const passwordInput = screen.getByPlaceholderText('Enter password...');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('⚠ Invalid credentials')).toBeInTheDocument();
      expect(passwordInput).toHaveValue('');
      expect(usernameInput).toHaveValue('testuser'); // Username should remain
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should display generic error message when error has no message', async () => {
    const user = userEvent.setup();
    (ApiService.post as any).mockRejectedValueOnce({});
    
    renderWithRouter(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    const passwordInput = screen.getByPlaceholderText('Enter password...');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('⚠ Login failed')).toBeInTheDocument();
    });
  });

  it('should have correct placeholder text', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByPlaceholderText('Enter username...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password...')).toBeInTheDocument();
  });

  it('should have link to sign up page', () => {
    renderWithRouter(<LoginPage />);
    
    const signUpLink = screen.getByRole('link', { name: /create new account/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });
});
