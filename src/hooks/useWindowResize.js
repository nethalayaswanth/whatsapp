import { useState, useEffect,useRef, useCallback } from "react";
import throttle from "lodash/throttle";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

   const handleResize = () => {
     setWindowSize({ width: window.innerWidth, height: window.innerHeight });
   };
   const throttleFn = useRef(throttle(handleResize, 100)).current;

  useEffect(() => {
    window.addEventListener("resize", throttleFn);

    return () => {
      window.removeEventListener("resize", throttleFn);
    };
  }, [throttleFn]);

  return windowSize;
}
