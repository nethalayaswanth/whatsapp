import * as React from "react";
import useLayoutEffect from "use-isomorphic-layout-effect";

export function useLatest(value) {
  const ref = React.useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
