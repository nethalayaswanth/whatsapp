import { useCallback,useRef, useLayoutEffect, useState } from "react";

export default function usePrevRender(value) {

    const ref = useRef(value);
  
  useLayoutEffect(() => {
  ref.current=value
  }, [value]);

  return ref.current;
}
