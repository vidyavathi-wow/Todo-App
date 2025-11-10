import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';

// ✅ mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}));

describe('Login Component', () => {
  const mockNavigate = vi.fn();
  const mockAxios = {
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  };
  const mockSetToken = vi.fn();

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <AppContext.Provider
          value={{
            navigate: mockNavigate,
            axios: mockAxios,
            setToken: mockSetToken,
          }}
        >
          <Login />
        </AppContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLogin();
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your password/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('allows typing into email and password fields', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('123456');
  });

  it('submits form and logs in successfully', async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    mockAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Login successful',
        accessToken: 'fake-token',
      },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'user@test.com',
        password: 'password',
      });
      expect(mockSetToken).toHaveBeenCalledWith('fake-token');
      expect(toast.success).toHaveBeenCalledWith('Login successful');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error toast on failed login', async () => {
    renderLogin();

    // 🟢 Fill inputs so form validation passes
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'wrongpass' },
    });

    // Mock rejected response with "errors" array
    mockAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          errors: [{ msg: 'Invalid credentials' }],
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});
