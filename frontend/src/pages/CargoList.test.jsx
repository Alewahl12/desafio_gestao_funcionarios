import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CargoList from './CargoList';
import api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('../services/api');

// Mock corrigido para atuar como classe
vi.mock('jspdf', () => {
  return {
    default: class {
      text() {}
      setFontSize() {}
      setTextColor() {}
      save() {}
    }
  };
});
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));

describe('CargoList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve renderizar a lista vazia caso não haja resultados', async () => {
    api.get.mockResolvedValueOnce({ data: { content: [], totalPages: 0, totalElements: 0 } });
    render(<MemoryRouter><CargoList /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum cargo encontrado.')).toBeInTheDocument();
    });
  });

  it('deve carregar os itens e permitir paginação', async () => {
    api.get.mockResolvedValue({ data: { content: [{ id: 1, codigo: 'C1', descricao: 'Desenvolvedor' }], totalPages: 2, totalElements: 15 } });
    render(<MemoryRouter><CargoList /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Desenvolvedor')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Próxima'));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByText('Anterior'));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(3));
  });

  it('deve baixar o relatório PDF', async () => {
    api.get.mockResolvedValue({ data: { content: [{ id: 1, codigo: 'C1', descricao: 'Dev' }], totalPages: 1, totalElements: 1 } });
    render(<MemoryRouter><CargoList /></MemoryRouter>);
    
    await waitFor(() => screen.getByText('Dev'));
    fireEvent.click(screen.getByText('Baixar Relatório'));
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/cargos', expect.objectContaining({ params: expect.objectContaining({ size: 10000 }) }));
    });
  });
});