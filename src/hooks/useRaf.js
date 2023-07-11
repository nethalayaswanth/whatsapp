import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import usePrevious from "./usePrevious";

const useRaf = (
  callback,
  {
    onComplete,
    duration = Number.POSITIVE_INFINITY,
    trigger,
    triggerAlways = false,
    shouldAnimate = true,
  } = {}
) => {
  const frame = useRef(0);
  const cbRef = useRef(callback);
  const onCompleteRef = useRef(onComplete);

  const firstFrameTime = useRef(performance.now());
  const [animating, setAnimating] = useState(false);

  const animateCb = useCallback(
    (now) => {
      let timeFraction = (now - firstFrameTime.current) / duration;

      timeFraction = timeFraction > 1 ? 1 : timeFraction < 0 ? 0 : timeFraction;

      //console.log(timeFraction);
      if (timeFraction < 1) {
        cbRef.current(timeFraction);

        frame.current = requestAnimationFrame(animateCb);
      } else if (timeFraction >= 1) {
        cbRef.current(timeFraction);
        onCompleteRef.current?.();
        setAnimating(false);
      }
    },
    [duration]
  );

  const currentTrigger = useMemo(() => trigger, [trigger]);

  const [prevTriggerState] = usePrevious(currentTrigger);

  useLayoutEffect(() => {
    cbRef.current = callback;
    onCompleteRef.current = onComplete;
  }, [callback, onComplete]);

  useEffect(() => {
    const triggerChanged =
      prevTriggerState !== null && currentTrigger !== prevTriggerState;
    if (!!shouldAnimate || triggerChanged) {
      firstFrameTime.current = performance.now();
      setAnimating(true);
      frame.current = requestAnimationFrame(animateCb);
    }

    return () => {
      setAnimating(false);
      cancelAnimationFrame(frame.current);
    };
  }, [animateCb, currentTrigger, prevTriggerState, shouldAnimate]);

  return animating;
};

export default useRaf;
