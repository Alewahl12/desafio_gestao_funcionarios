import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue'; // Adicionado as chaves aqui

describe('useDebouncedValue', () => {
  vi.useFakeTimers();

  it('deve atualizar o valor apenas após o delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'texto', delay: 500 } }
    );

    expect(result.current).toBe('texto');

    rerender({ value: 'novo texto', delay: 500 });
    expect(result.current).toBe('texto'); 

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('novo texto'); 
  });
});