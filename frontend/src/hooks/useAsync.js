import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ejecuta una función async y expone { data, error, loading, reload, setData }.
 * Ignora respuestas viejas si las dependencias cambian mientras carga.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const callId = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const reload = useCallback(async () => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await run();
      if (id === callId.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === callId.current) setState((s) => ({ ...s, error, loading: false }));
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload, setData };
}
