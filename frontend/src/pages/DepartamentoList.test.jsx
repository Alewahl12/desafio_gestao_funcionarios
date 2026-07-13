import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DepartamentoList from './DepartamentoList';
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

describe('DepartamentoList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve renderizar a tabela vazia', async () => {
    api.get.mockResolvedValueOnce({ data: { content: [], totalPages: 0, totalElements: 0 } });
    render(<MemoryRouter><DepartamentoList /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum departamento encontrado.')).toBeInTheDocument();
    });
  });

  it('deve carregar dados e testar botões de navegação', async () => {
    api.get.mockResolvedValue({ data: { content: [{ id: 1, codigo: 'TI', descricao: 'Tecnologia' }], totalPages: 2, totalElements: 12 } });
    render(<MemoryRouter><DepartamentoList /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Tecnologia')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Próxima'));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });

  it('deve acionar o download do PDF', async () => {
    api.get.mockResolvedValue({ data: { content: [{ id: 1, codigo: 'TI', descricao: 'Tecnologia' }], totalPages: 1, totalElements: 1 } });
    render(<MemoryRouter><DepartamentoList /></MemoryRouter>);
    
    await waitFor(() => screen.getByText('Tecnologia'));
    fireEvent.click(screen.getByText('Baixar Relatório'));
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/departamentos', expect.objectContaining({ params: expect.objectContaining({ size: 10000 }) }));
    });
  });
});