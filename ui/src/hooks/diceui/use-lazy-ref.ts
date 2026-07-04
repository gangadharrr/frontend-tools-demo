import * as React from 'react';

/**
 * A `useRef` whose initial value is computed lazily.
 *
 * The factory is invoked exactly once, on the first render. On subsequent
 * renders the cached value is returned — identical to a normal `useRef`.
 *
 * Useful when the initial value is expensive to construct (e.g. a `new Set()`
 * of subscribers, a fully-initialized color picker store) and you want to
 * avoid paying that cost during SSR or when the component is never mounted.
 *
 * @example
 *   const listenersRef = useLazyRef(() => new Set<() => void>());
 *   const stateRef = useLazyRef<StoreState>(() => ({ ... }));
 */
function useLazyRef<T>(initialValue: () => T): React.MutableRefObject<T> {
  const ref = React.useRef<T>(undefined as unknown as T);

  if (ref.current === undefined) {
    ref.current = initialValue();
  }

  return ref;
}

export { useLazyRef };
