import { useEffect, useState } from 'react';

export function useDebouncedValue(valor, atrasoMs = 400) {
  const [valorComAtraso, setValorComAtraso] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setValorComAtraso(valor), atrasoMs);
    return () => clearTimeout(timer);
  }, [valor, atrasoMs]);

  return valorComAtraso;
}