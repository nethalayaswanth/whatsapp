import * as React from "react";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

export function useLatest(value) {
  const ref = React.useRef(value);

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  },[value]);
  return ref;
}
