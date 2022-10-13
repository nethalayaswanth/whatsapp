import { useLayoutEffect } from "react";
import { useCallback } from "react";
import { useRef, useState, useEffect } from "react";

const useAnimationFrame = (
  callback,
  { duration = Number.POSITIVE_INFINITY, shouldAnimate = true } = {}
) => {
  const frame = useRef(0);
  const cbRef = useRef(callback);

  const firstFrameTime = useRef(performance.now());

  const animate = useCallback(
    (now) => {
      let timeFraction = (now - firstFrameTime.current) / duration;

      timeFraction = timeFraction > 1 ? 1 : timeFraction < 0 ? 0 : timeFraction;

      if (timeFraction <= 1) {
        cbRef.current(timeFraction);

        if (timeFraction !== 1) frame.current = requestAnimationFrame(animate);
      }
    },
    [duration]
  );

  useLayoutEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (shouldAnimate) {
      firstFrameTime.current = performance.now();
      frame.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame.current);
    }

    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [animate, shouldAnimate]);
};

export default useAnimationFrame;
