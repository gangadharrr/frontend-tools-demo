import * as React from 'react';

/**
 * A `useRef` that always returns the latest version of the value passed in.
 *
 * This is the pattern Dice UI uses for "callback props" inside `useEffect`
 * deps — you capture a mutable ref to the callback so that the `useEffect`
 * doesn't need to re-run every time the parent re-renders, but the callback
 * always sees the latest props/state at the moment it fires.
 *
 * Identical behavior to:
 *
 * ```ts
 * const ref = useRef(value);
 * useLayoutEffect(() => { ref.current = value; });
 * ```
 *
 * but expressed as a single hook so call-sites stay tidy.
 *
 * @example
 *   const propsRef = useAsRef({ onValueChange });
 *   useEffect(() => {
 *     // Always invokes the latest onValueChange, but only subscribes once.
 *   }, []);
 */
function useAsRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value);

  // Sync the ref on every render so the latest value is always available.
  ref.current = value;

  return ref;
}

export { useAsRef };
