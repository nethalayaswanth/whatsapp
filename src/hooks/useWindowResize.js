import { useState, useLayoutEffect, useRef, useCallback } from "react";
import throttle from "lodash/throttle";

export default function useReSize(ref) {
  const [size, setSize] = useState({
    width: ref ? 0 : window.innerWidth,
    height: ref ? 0 : window.innerHeight,
  });

  const handleResize = () => {
    if (ref) {
      const { width, height } = ref.current.getBoundingClientRect();
      setSize({ width, height });
      return;
    }
    setSize({ width: window.innerWidth, height: window.innerHeight });
  };

  const throttleFn = useRef(throttle(handleResize, 100)).current;

  useLayoutEffect(() => {
    window.addEventListener("resize", throttleFn);

    return () => {
      window.removeEventListener("resize", throttleFn);
    };
  }, [throttleFn]);

  return size;
}
