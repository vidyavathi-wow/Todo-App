import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../pages/auth/Signup';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';

// ✅ Mock toast
vi.mock('react-hot-toast', () => {
  return {
    __esModule: true,
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
    success: vi.fn(),
    error: vi.fn(),
  };
});

describe('Signup Component', () => {
  //   const mockNavigate = vi.fn();
  const mockAxios = {
    post: vi.fn(),
  };

  const renderSignup = () => {
    render(
      <BrowserRouter>
        <AppContext.Provider value={{ axios: mockAxios }}>
          <Signup />
        </AppContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    renderSignup();
    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Sign Up/i })
    ).toBeInTheDocument();
  });

  it('allows typing into input fields', () => {
    renderSignup();

    const nameInput = screen.getByPlaceholderText(/Enter your name/i);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('123456');
  });

  it('submits form and registers successfully', async () => {
    renderSignup();

    const name = screen.getByPlaceholderText(/Enter your name/i);
    const email = screen.getByPlaceholderText(/Enter your email/i);
    const password = screen.getByPlaceholderText(/Enter your password/i);
    const roleSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(name, { target: { value: 'Jane Doe' } });
    fireEvent.change(email, { target: { value: 'jane@example.com' } });
    fireEvent.change(password, { target: { value: 'password' } });
    fireEvent.change(roleSelect, { target: { value: 'user' } });

    mockAxios.post.mockResolvedValueOnce({
      data: { success: true, message: 'Registered successfully' },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/auth/register', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password',
        role: 'user',
      });
      expect(toast.success).toHaveBeenCalledWith('Registered successfully');
    });
  });

  it('shows error toast on failed signup', async () => {
    renderSignup();

    const name = screen.getByPlaceholderText(/Enter your name/i);
    const email = screen.getByPlaceholderText(/Enter your email/i);
    const password = screen.getByPlaceholderText(/Enter your password/i);
    const roleSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(name, { target: { value: 'Bad User' } });
    fireEvent.change(email, { target: { value: 'bad@example.com' } });
    fireEvent.change(password, { target: { value: 'wrong' } });
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    mockAxios.post.mockRejectedValueOnce({
      response: {
        data: { errors: [{ msg: 'Email already exists' }] },
      },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already exists');
    });
  });

  it('handles network or unknown error gracefully', async () => {
    renderSignup();

    const name = screen.getByPlaceholderText(/Enter your name/i);
    const email = screen.getByPlaceholderText(/Enter your email/i);
    const password = screen.getByPlaceholderText(/Enter your password/i);
    const roleSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(name, { target: { value: 'Jane Doe' } });
    fireEvent.change(email, { target: { value: 'jane@example.com' } });
    fireEvent.change(password, { target: { value: 'password' } });
    fireEvent.change(roleSelect, { target: { value: 'user' } });

    mockAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network Error');
    });
  });
});
