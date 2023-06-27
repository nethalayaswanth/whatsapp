import { useCallback, useMemo, useRef, useState } from "react";
import useEventListener from "./useEventListener";

export default function useWindowSize({ el } = {}) {
  const ref = useRef();

  const targetEl = useMemo(
    () => el || ref.current || document.documentElement,
    [el, ref]
  );

  const [size, setSize] = useState({
    width: targetEl ? targetEl.clientWidth : 0,
    height: targetEl ? targetEl.clientHeight : 0,
  });

  const handleSize = useCallback(
    (e) => {
      setSize({
        width: targetEl?.clientWidth || 0,
        height: targetEl?.clientHeight || 0,
      });
    },
    [targetEl]
  );

  useEventListener({ name:"resize", handler: handleSize });

 

  return [ref, size];
}
