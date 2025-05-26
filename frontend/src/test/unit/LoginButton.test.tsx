import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { LoginButton } from '@/domains/authentication/components/LoginButton'
import { useAuth } from '@/domains/authentication/context/AuthContext'

vi.mock('@/domains/authentication/context/AuthContext')

const mockUseAuth = vi.mocked(useAuth)

describe('LoginButton', () => {
  it('renders login button', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })

    render(<LoginButton />)

    expect(screen.getByRole('button', { name: /connect with spotify/i })).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    })

    render(<LoginButton />)

    expect(screen.getByRole('button', { name: /connecting/i })).toBeInTheDocument()
  })
})
