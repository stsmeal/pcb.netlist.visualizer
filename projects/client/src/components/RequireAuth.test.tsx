import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import { get } from '../services/ApiService';

// Mock ApiService.get
vi.mock('../services/ApiService', () => ({
  get: vi.fn(),
}));

const Protected = () => <div>Protected Content</div>;
const Login = () => <div>Login Page</div>;

const renderWithRouter = (initialEntries = ['/']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Protected />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </MemoryRouter>
  );

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading initially', async () => {
    (get as any).mockImplementation(() => new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children when authorized', async () => {
    (get as any).mockResolvedValueOnce({});
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('redirects to login when not authorized', async () => {
    (get as any).mockRejectedValueOnce(new Error('Unauthorized'));
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
