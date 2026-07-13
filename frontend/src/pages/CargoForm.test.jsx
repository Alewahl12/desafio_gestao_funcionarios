import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CargoForm from './CargoForm';
import api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('../services/api');

describe('CargoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderWithRouter = (path = '/cargos/novo') => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/cargos/novo" element={<CargoForm />} />
          <Route path="/cargos/editar/:id" element={<CargoForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve carregar os dados se tiver ID na rota', async () => {
    api.get.mockResolvedValueOnce({ data: { codigo: '123', descricao: 'Dev' } });
    renderWithRouter('/cargos/editar/1');
    await waitFor(() => {
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Dev')).toBeInTheDocument();
    });
  });

  it('deve criar um novo cargo com sucesso', async () => {
    api.post.mockResolvedValueOnce({});
    renderWithRouter();
    
    fireEvent.change(screen.getByPlaceholderText('Insira o nome do cargo'), { target: { value: 'Novo Cargo' } });
    fireEvent.change(screen.getByPlaceholderText('0000000000'), { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/cargos', { codigo: '999', descricao: 'Novo Cargo' });
      expect(mockNavigate).toHaveBeenCalledWith('/cargos');
    });
  });

  it('deve atualizar um cargo existente', async () => {
    api.get.mockResolvedValueOnce({ data: { codigo: '123', descricao: 'Dev' } });
    api.put.mockResolvedValueOnce({});
    renderWithRouter('/cargos/editar/1');

    await waitFor(() => expect(screen.getByDisplayValue('123')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/cargos/1', { codigo: '123', descricao: 'Dev' });
    });
  });

  it('deve exibir erro ao falhar na requisição', async () => {
    api.post.mockRejectedValueOnce(new Error('Erro da API'));
    renderWithRouter();
    
    fireEvent.change(screen.getByPlaceholderText('Insira o nome do cargo'), { target: { value: 'Erro' } });
    fireEvent.change(screen.getByPlaceholderText('0000000000'), { target: { value: '111' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Erro ao guardar'));
    });
  });
});