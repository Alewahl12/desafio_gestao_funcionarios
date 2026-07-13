import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DepartamentoForm from './DepartamentoForm';
import api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('../services/api');

describe('DepartamentoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderWithRouter = (path = '/departamentos/novo') => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/departamentos/novo" element={<DepartamentoForm />} />
          <Route path="/departamentos/editar/:id" element={<DepartamentoForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve carregar os dados se tiver ID', async () => {
    api.get.mockResolvedValueOnce({ data: { codigo: 'TI', descricao: 'Tecnologia' } });
    renderWithRouter('/departamentos/editar/1');
    await waitFor(() => {
      expect(screen.getByDisplayValue('TI')).toBeInTheDocument();
    });
  });

  it('deve criar e atualizar departamentos', async () => {
    api.post.mockResolvedValueOnce({});
    renderWithRouter();
    
    fireEvent.change(screen.getByPlaceholderText('Insira o nome do departamento'), { target: { value: 'RH' } });
    fireEvent.change(screen.getByPlaceholderText('0000000000'), { target: { value: 'RH1' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/departamentos', { codigo: 'RH1', descricao: 'RH' });
    });
  });

  it('deve falhar e exibir alert', async () => {
    api.post.mockRejectedValueOnce(new Error('Erro'));
    renderWithRouter();
    
    fireEvent.change(screen.getByPlaceholderText('Insira o nome do departamento'), { target: { value: 'Falha' } });
    fireEvent.change(screen.getByPlaceholderText('0000000000'), { target: { value: 'RH1' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Erro ao guardar'));
    });
  });
});