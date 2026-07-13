import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, registrar, isAuthenticated, getUsuarioLogado, logout } from './auth';
import api from './api';

// Mock do axios (api.js) para não fazer requisições reais
vi.mock('./api');

describe('auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('deve realizar login e salvar a sessão no localStorage', async () => {
    api.post.mockResolvedValueOnce({ data: { login: 'admin' } });
    
    const response = await login('admin', '123456');
    
    expect(api.post).toHaveBeenCalledWith('/auth/login', { login: 'admin', senha: '123456' });
    expect(response.login).toBe('admin');
    expect(localStorage.getItem('gf_autenticado')).toBe('true');
    expect(localStorage.getItem('gf_usuario')).toBe('admin');
  });

  it('deve registrar um novo usuário sem salvar sessão', async () => {
    api.post.mockResolvedValueOnce({ data: { login: 'novoUser' } });
    
    const response = await registrar('novoUser', 'senha123');
    
    expect(api.post).toHaveBeenCalledWith('/auth/registrar', { login: 'novoUser', senha: 'senha123' });
    expect(response.login).toBe('novoUser');
    expect(localStorage.getItem('gf_autenticado')).toBeNull();
  });

  it('deve retornar corretamente o status de autenticação', () => {
    expect(isAuthenticated()).toBe(false);
    localStorage.setItem('gf_autenticado', 'true');
    expect(isAuthenticated()).toBe(true);
  });

  it('deve retornar o usuário logado corretamente', () => {
    expect(getUsuarioLogado()).toBe('');
    localStorage.setItem('gf_usuario', 'maria');
    expect(getUsuarioLogado()).toBe('maria');
  });

  it('deve limpar os dados do localStorage ao fazer logout', () => {
    localStorage.setItem('gf_autenticado', 'true');
    localStorage.setItem('gf_usuario', 'admin');
    
    logout();
    
    expect(localStorage.getItem('gf_autenticado')).toBeNull();
    expect(localStorage.getItem('gf_usuario')).toBeNull();
  });
});