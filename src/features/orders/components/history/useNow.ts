import { useEffect, useState } from 'react';

/** The current time, refreshed every `intervalMs` so time-based UI (the 48 h cancel window) stays current */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
