import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import * as auth from '../services/auth';

vi.mock('../services/auth', () => ({
  isAuthenticated: vi.fn(),
}));

describe('RequireAuth', () => {
  it('deve redirecionar para /login se não estiver autenticado', () => {
    auth.isAuthenticated.mockReturnValue(false);
    
    render(
      <MemoryRouter initialEntries={['/protegida']}>
        <Routes>
          <Route path="/protegida" element={<RequireAuth><div>Conteúdo Protegido</div></RequireAuth>} />
          <Route path="/login" element={<div>Tela de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve renderizar os filhos se estiver autenticado', () => {
    auth.isAuthenticated.mockReturnValue(true);
    
    render(
      <MemoryRouter>
        <RequireAuth>
          <div>Conteúdo Protegido</div>
        </RequireAuth>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});