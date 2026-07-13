import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as auth from '../services/auth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/auth', () => ({
  login: vi.fn(),
  registrar: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('deve alternar entre os modos de login e registro', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repita sua senha')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve exibir erro se as senhas não coincidirem no registro', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    
    fireEvent.change(screen.getByPlaceholderText('Insira seu login'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Insira sua senha'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita sua senha'), { target: { value: '654321' } });
    
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
  });

  it('deve exibir erro se a senha for muito curta no registro', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    
    // Preenchendo todos os campos required para o formulário ser enviado
    fireEvent.change(screen.getByPlaceholderText('Insira seu login'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Insira sua senha'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Repita sua senha'), { target: { value: '123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    expect(screen.getByText('A senha deve ter pelo menos 6 caracteres.')).toBeInTheDocument();
  });

  it('deve realizar login com sucesso', async () => {
    auth.login.mockResolvedValueOnce({});
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Insira seu login'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Insira sua senha'), { target: { value: '123456' } });
    
    // Usando getByRole para evitar conflito com o h1 "Entrar"
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith('admin', '123456');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('deve exibir erro vindo da API no login', async () => {
    auth.login.mockRejectedValueOnce({ response: { data: 'Credenciais inválidas' } });
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Insira seu login'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Insira sua senha'), { target: { value: 'errada' } });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it('deve registrar com sucesso e alternar para login', async () => {
    auth.registrar.mockResolvedValueOnce({});
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    
    fireEvent.change(screen.getByPlaceholderText('Insira seu login'), { target: { value: 'novo' } });
    fireEvent.change(screen.getByPlaceholderText('Insira sua senha'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita sua senha'), { target: { value: '123456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    await waitFor(() => {
      expect(auth.registrar).toHaveBeenCalledWith('novo', '123456');
      expect(window.alert).toHaveBeenCalledWith('Conta criada com sucesso! Agora faça login.');
      expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    });
  });
});