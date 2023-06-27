import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const useAnimationFrame = (
  callback,
  {onComplete, duration = Number.POSITIVE_INFINITY,trigger,triggerAlways=false, shouldAnimate = true } = {}
) => {
  const frame = useRef(0);
  const cbRef = useRef(callback);
  const onCompleteRef = useRef(onComplete);

  const firstFrameTime = useRef(performance.now());
  const [animating,setAnimating]=useState(false)

  const animateCb = useCallback(
    (now) => {
      let timeFraction = (now - firstFrameTime.current) / duration;

      timeFraction = timeFraction > 1 ? 1 : timeFraction < 0 ? 0 : timeFraction;

      if (timeFraction <1) {
        cbRef.current(timeFraction);

        frame.current = requestAnimationFrame(animateCb);
      }else if( timeFraction >=1 ){
                cbRef.current(timeFraction);
                onCompleteRef.current?.();
                setAnimating(false)
      }
    },
    [duration]
  );

// const prevTriggerState=  usePrevious(trigger)

  useLayoutEffect(() => {
    cbRef.current = callback;
    onCompleteRef.current=onComplete
  }, [callback, onComplete]);

  useEffect(() => {

   
    if (!!shouldAnimate) {
      firstFrameTime.current = performance.now();
      setAnimating(true);
      frame.current = requestAnimationFrame(animateCb);
    }
 
    return () => {
      setAnimating(false)
      cancelAnimationFrame(frame.current);
    };

  }, [animateCb,trigger, shouldAnimate]);

  return animating;
};


export default useAnimationFrame;
