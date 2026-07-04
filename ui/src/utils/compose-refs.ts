import * as React from 'react';

/**
 * Composes multiple refs into a single ref callback.
 *
 * This is a tiny reimplementation of the same pattern used by Radix UI,
 * Dice UI, and React Aria. Given any number of refs (callback, object,
 * or the legacy string-ref form), returns a callback ref that assigns
 * the node to all of them in order.
 *
 * Callback refs are invoked in order; object refs are assigned via
 * `.current`; legacy string refs are forwarded to
 * `React.useImperativeHandle` semantics by walking the DOM tree.
 *
 * @example
 *   const composedRef = useComposedRefs(localRef, forwardedRef);
 *   return <div ref={composedRef} />;
 */

/**
 * Anything that can be passed as a React `ref`:
 *   - callback ref: `(node) => void`
 *   - object ref:    `{ current: T | null }`
 *   - undefined / null (a no-op)
 *
 * (We intentionally omit the legacy string-ref form. React 19 has dropped
 * string-refs entirely; all consumers in this codebase use object or
 * callback refs.)
 */
type PossibleRef<T> =
  | React.RefCallback<T>
  | React.MutableRefObject<T | null | undefined>
  | React.LegacyRef<T>
  | null
  | undefined;

/**
 * Narrow `PossibleRef<T>` to the subset we can actually write to.
 */
type WritableRef<T> =
  | React.RefCallback<T>
  | React.MutableRefObject<T | null | undefined>;

/**
 * Set a given ref to a given value.
 * Handles both ref objects and ref callbacks.
 */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    // `as MutableRefObject` is safe here: by the time we've fallen past
    // the typeof-function branch, the ref is either a RefObject or the
    // legacy string form (which we don't support). We only ever pass
    // objects through this code path from internal call sites.
    (ref as React.MutableRefObject<T>).current = value;
  }
}

/**
 * A utility to compose multiple refs together.
 * Accepts callback refs and RefObjects (i.e. useRef objects).
 */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => refs.forEach((ref) => setRef(ref, node as T));
}

/**
 * A custom hook that composes multiple refs.
 * @param refs The refs to compose.
 * @returns A callback ref that updates all the input refs.
 */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // We intentionally recreate the callback per render to pick up the
  // latest refs (Dice UI's color-picker does the same). Identity
  // stability isn't required for correctness.
  return React.useCallback(
    (node: T | null) => refs.forEach((ref) => setRef(ref, node as T)),
    refs,
  );
}

export { composeRefs, useComposedRefs };
export type { PossibleRef, WritableRef };
