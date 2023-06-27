import { useLayoutEffect, useRef } from "react";
import { useLatest } from "./useLatest";

export default function useEffectAfterMount(cb = () => {}, dependencies = []) {
  const justMounted = useRef(true);
  const latest = useLatest(cb);

  useLayoutEffect(() => {
    if (!justMounted.current) {
      return latest.current();
    }
    justMounted.current = false;
  }, [dependencies, latest]);
}
