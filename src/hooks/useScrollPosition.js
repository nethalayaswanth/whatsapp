import { useRef, useLayoutEffect, useEffect,useState, useCallback } from "react";

import throttle from "lodash/throttle";
import { useMemo } from "react";

const isBrowser = typeof window !== `undefined`;
const zeroPosition = { x: 0, y: 0 };

const getClientRect = (element) => element?.getBoundingClientRect();

const getScrollPosition = ({ element, useWindow, boundingElement }) => {
  if (!isBrowser) {
    return zeroPosition;
  }

  if (useWindow) {
    return { x: window.scrollX, y: window.scrollY };
  }

  const targetPosition = getClientRect(element || document.body);
  const containerPosition = getClientRect(boundingElement);

  if (!targetPosition) {
    return zeroPosition;
  }

  return containerPosition
    ? {
        x: (containerPosition.x || 0) - (targetPosition.x || 0),
        y: (containerPosition.y || 0) - (targetPosition.y || 0),
      }
    : { x: targetPosition.left, y: targetPosition.top };
};

export const useScrollPosition = ({
  onScrollChange,
  useWindow,
  wait = 400,
  element: elementProp,
  boundingElement: boundingElementProp,
  trackPosition=false
} = {}) => {
  const elementRef = useRef();
  const boundingElementRef = useRef();

const element = elementProp || elementRef
const boundingElement = boundingElementProp || boundingElementRef;


  const position = useRef(
    getScrollPosition({ useWindow, boundingElement: boundingElement?.current })
  );
  const [isScrolling, setScrolling] = useState(false);

  const scrollRef = useRef(false);
  const timeoutRef=useRef()

  const handleScrollChange = useCallback(() => {
    if (scrollRef.current === false) {
      setScrolling(true);
      scrollRef.current = true;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setScrolling(false);
        scrollRef.current = false;
      }, 400);
    }
  }, []);


  const callBack = useCallback(() => {
    
    if(trackPosition){
    const currPos = getScrollPosition({
      element: element?.current,
      useWindow,
      boundingElement: boundingElement?.current,
    });

    onScrollChange?.({ prevPos: position.current, currPos });
  position.current = currPos;
  }
    handleScrollChange();

  }, [trackPosition, handleScrollChange, element, useWindow, boundingElement, onScrollChange]);

  const throttlFn =useMemo(()=>{return throttle(callBack, wait) },[callBack, wait]);

  useEffect(() => {
    if (!isBrowser) {
      return undefined;
    }

    const boundingEl = boundingElement?.current ?? window;
    
    const handleScroll = () => {
      throttlFn();
    };

      boundingEl?.addEventListener("scroll", handleScroll, {
        passive: true,
      });
   

    return () => {
      if (boundingEl) {
        boundingEl?.removeEventListener("scroll", handleScroll);
     
    };}
  }, [boundingElement, callBack, throttlFn, wait]);

  const returnValue = [position, isScrolling, boundingElement, element];

  returnValue.position = position;
  returnValue.boundingElement = boundingElement;
  returnValue.element = element;
  returnValue.isScrolling = isScrolling;
  return returnValue;
};
