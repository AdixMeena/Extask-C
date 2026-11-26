import { useCallback, useEffect, useRef, useState } from 'react';

// Small data-fetching hook: { data, error, loading, reload }.
//  - deps:   refetch when these change
//  - enabled: set false to hold off (e.g. until we know the user is the poster)
//  - pollMs: refetch silently every N ms (0 = never)
// reload() refetches WITHOUT flashing the skeleton, which suits "refresh after an action".
export function useApi(fetcher, deps = [], { enabled = true, pollMs = 0 } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = useRef(0);

  const load = useCallback(async (silent = false) => {
    const id = ++requestId.current; // ignore answers from outdated requests
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === requestId.current && !silent) setState({ data: null, error, loading: false });
    }
  }, []);

  useEffect(() => {
    if (enabled) load(false);
    else setState((s) => ({ ...s, loading: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, load, ...deps]);

  useEffect(() => {
    if (!enabled || !pollMs) return undefined;
    const timer = setInterval(() => load(true), pollMs);
    return () => clearInterval(timer);
  }, [enabled, pollMs, load]);

  const reload = useCallback(() => load(true), [load]);
  return { ...state, reload };
}
