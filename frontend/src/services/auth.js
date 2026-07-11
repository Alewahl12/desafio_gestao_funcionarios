import api from './api';

const CHAVE_AUTH = 'gf_autenticado';
const CHAVE_USUARIO = 'gf_usuario';

export async function login(login, senha) {
  const response = await api.post('/auth/login', { login, senha });
  salvarSessao(response.data);
  return response.data;
}

export async function registrar(login, senha) {
  const response = await api.post('/auth/registrar', { login, senha });
  return response.data;
}

function salvarSessao(usuario) {
  localStorage.setItem(CHAVE_AUTH, 'true');
  localStorage.setItem(CHAVE_USUARIO, usuario?.login || '');
}

export function isAuthenticated() {
  return localStorage.getItem(CHAVE_AUTH) === 'true';
}

export function getUsuarioLogado() {
  return localStorage.getItem(CHAVE_USUARIO) || '';
}

export function logout() {
  localStorage.removeItem(CHAVE_AUTH);
  localStorage.removeItem(CHAVE_USUARIO);
}