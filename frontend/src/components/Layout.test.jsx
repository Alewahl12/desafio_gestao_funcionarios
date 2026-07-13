import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import * as auth from '../services/auth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/auth', () => ({
  logout: vi.fn(),
}));

describe('Layout', () => {
  it('deve renderizar os links de navegação corretamente', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText('Funcionário')).toBeInTheDocument();
    expect(screen.getByText('Cargo')).toBeInTheDocument();
    expect(screen.getByText('Departamento')).toBeInTheDocument();
  });

  it('deve realizar logout e redirecionar ao clicar em Sair', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Sair'));

    expect(auth.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});