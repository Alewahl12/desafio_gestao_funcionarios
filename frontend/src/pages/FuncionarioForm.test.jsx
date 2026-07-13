import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import FuncionarioForm from './FuncionarioForm';
import api from '../services/api';
import { cpf } from 'cpf-cnpj-validator';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('../services/api');
vi.mock('cpf-cnpj-validator', () => ({
  cpf: { isValid: vi.fn(), format: vi.fn((v) => v) }
}));

describe('FuncionarioForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    api.get.mockImplementation((url) => {
      if (url === '/cargos') return Promise.resolve({ data: { content: [{ id: 1, descricao: 'Dev' }] } });
      if (url === '/departamentos') return Promise.resolve({ data: { content: [{ id: 1, descricao: 'TI' }] } });
      if (url === '/funcionarios/1') return Promise.resolve({ data: { nome: 'João', cpf: '111', vinculos: [{ empresa: 'Empresa A', matricula: '123' }] } });
      return Promise.resolve({ data: {} });
    });
  });

  const renderWithRouter = (path = '/funcionarios/novo') => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
          <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve carregar dados de funcionário e auxiliares na edição', async () => {
    renderWithRouter('/funcionarios/editar/1');
    await waitFor(() => {
      expect(screen.getByDisplayValue('João')).toBeInTheDocument();
      expect(screen.getByDisplayValue('111')).toBeInTheDocument();
      expect(screen.getByText('Empresa A')).toBeInTheDocument();
    });
  });

  it('deve adicionar um novo vínculo no modal', async () => {
    renderWithRouter();
    
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /novo vínculo/i }));
    
    // Procura especificamente o título do modal para evitar conflito com o botão
    expect(screen.getByRole('heading', { name: 'Novo Vínculo' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Insira o nome da empresa'), { target: { value: 'Nova Empresa' } });
    fireEvent.change(screen.getByPlaceholderText('0000000000'), { target: { value: '999' } });
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } }); 
    fireEvent.change(selects[1], { target: { value: '1' } }); 

    const botoesConfirmar = screen.getAllByRole('button', { name: /confirmar/i });
    fireEvent.click(botoesConfirmar[botoesConfirmar.length - 1]);
    
    await waitFor(() => {
      expect(screen.getByText('Nova Empresa')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Novo Vínculo' })).not.toBeInTheDocument();
    });
  });

  it('deve editar um vínculo existente', async () => {
    renderWithRouter('/funcionarios/editar/1');
    
    await waitFor(() => expect(screen.getByText('Empresa A')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTitle('Editar vínculo'));
    expect(screen.getByRole('heading', { name: 'Editar Vínculo' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Insira o nome da empresa'), { target: { value: 'Empresa B' } });
    fireEvent.change(screen.getByPlaceholderText('0000000000'), { target: { value: '999' } });
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '1' } });

    const botoesConfirmar = screen.getAllByRole('button', { name: /confirmar/i });
    fireEvent.click(botoesConfirmar[botoesConfirmar.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Empresa B')).toBeInTheDocument();
    });
  });

  it('deve validar CPF incorreto ao tentar salvar', async () => {
    cpf.isValid.mockReturnValue(false);
    renderWithRouter();
    
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText('Insira o nome do funcionário'), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('CPF informado é inválido'));
  });

  it('deve salvar funcionário com sucesso e navegar', async () => {
    cpf.isValid.mockReturnValue(true);
    api.post.mockResolvedValueOnce({});
    renderWithRouter();
    
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText('Insira o nome do funcionário'), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '12345678901' } });
    
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/funcionarios');
    });
  });
});