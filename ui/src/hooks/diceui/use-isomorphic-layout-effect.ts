import * as React from 'react';

/**
 * `useLayoutEffect` that is a no-op on the server (during SSR) and the real
 * `useLayoutEffect` on the client.
 *
 * Required because React logs a noisy warning when you call `useLayoutEffect`
 * during SSR, but a number of libraries need synchronous DOM reads/writes
 * that only `useLayoutEffect` provides. The Dice UI color picker uses
 * `useIsomorphicLayoutEffect` to keep `value`/`open` props in sync with its
 * internal store on the very first paint.
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? React.useLayoutEffect
    : React.useEffect;

export { useIsomorphicLayoutEffect };
