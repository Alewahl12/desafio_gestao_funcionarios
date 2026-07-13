import { describe, it, expect } from 'vitest';
import api from './api';

describe('api.js', () => {
  it('deve ter a configuração de baseURL correta', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});