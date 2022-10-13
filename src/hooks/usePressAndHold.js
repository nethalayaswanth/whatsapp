import { useEffect, useLayoutEffect, useRef } from "react";

function usePressAndHold(callback, delay = 500) {
  const timeOutRef = useRef(null);
  const savedCallback = useRef(callback);

  const startHold = () => {
    if (timeOutRef.current) return;
    timeOutRef.current = setTimeout(() => {
      savedCallback.current(true);
    }, delay);
  };

  const stopHold = () => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
      timeOutRef.current = null;
    }
  };

  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeOutRef.current) {
        clearTimeout(timeOutRef.current);
        timeOutRef.current = null;
      }
    };
  }, []);

  const bind = () => ({
    onMouseDown: startHold,
    onMouseUp: stopHold,
    onMouseLeave: stopHold,
    onTouchStart: startHold,
    onTouchEnd: stopHold,
  });

  return bind;
}

export default usePressAndHold;
