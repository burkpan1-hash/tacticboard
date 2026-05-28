import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../../lib/authClient', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

import { authClient } from '../../lib/authClient'

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    } as any)

    render(
      <MemoryRouter initialEntries={['/my-plays']}>
        <Routes>
          <Route
            path="/my-plays"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'u1', email: 'a@b.com' }, session: {} },
      isPending: false,
      error: null,
    } as any)

    render(
      <MemoryRouter initialEntries={['/my-plays']}>
        <Routes>
          <Route
            path="/my-plays"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
