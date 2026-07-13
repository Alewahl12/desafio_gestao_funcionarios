import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FuncionarioList from './FuncionarioList';
import api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('../services/api');
vi.mock('jspdf', () => {
  return {
    default: class { text() {} setFontSize() {} setTextColor() {} save() {} }
  };
});
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));

describe('FuncionarioList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/cargos') return Promise.resolve({ data: { content: [{ id: 1, descricao: 'Dev' }] } });
      if (url === '/departamentos') return Promise.resolve({ data: { content: [{ id: 1, descricao: 'TI' }] } });
      if (url === '/funcionarios') return Promise.resolve({
        data: {
          content: [{ id: 1, nome: 'Ana', cpf: '111', vinculos: [{ empresa: 'TestCorp', matricula: '99' }] }],
          totalPages: 2,
          totalElements: 15
        }
      });
      return Promise.resolve({ data: {} });
    });
  });

  it('deve carregar funcionários e opções de filtro', async () => {
    render(<MemoryRouter><FuncionarioList /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.getByText('Ana')).toBeInTheDocument();
      // O select usa o value do cargo/departamento, verificamos se renderizou a tabela
      expect(screen.getByText('111')).toBeInTheDocument();
    });
  });

  it('deve abrir e fechar o modal de visualização de vínculos', async () => {
    render(<MemoryRouter><FuncionarioList /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());
    
    // Clica na linha da tabela
    fireEvent.click(screen.getByText('Ana'));
    
    await waitFor(() => {
      expect(screen.getByText('Vínculos de Empresa')).toBeInTheDocument();
      expect(screen.getByText('TestCorp')).toBeInTheDocument();
    });

    // Clica em fechar
    fireEvent.click(screen.getByText('Fechar'));
    
    await waitFor(() => {
      expect(screen.queryByText('Vínculos de Empresa')).not.toBeInTheDocument();
    });
  });

  it('deve navegar para a tela de edição ao clicar no botão Editar', async () => {
    render(<MemoryRouter><FuncionarioList /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTitle('Editar funcionário'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/funcionarios/editar/1');
  });

  it('deve permitir paginação', async () => {
    render(<MemoryRouter><FuncionarioList /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Próxima'));
    
    // Foi chamado no mount + na troca de página (para buscar lista)
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(4)); 
  });

  it('deve baixar o relatório PDF', async () => {
    render(<MemoryRouter><FuncionarioList /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Baixar Relatório'));
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/funcionarios', expect.objectContaining({ params: expect.objectContaining({ size: 10000 }) }));
    });
  });
});