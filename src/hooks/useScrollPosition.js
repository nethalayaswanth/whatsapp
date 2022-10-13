import { useRef, useLayoutEffect, useState, useCallback } from "react";

import throttle from "lodash/throttle";

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

  const targetPosition = getClientRect(element?.current || document.body);
  const containerPosition = getClientRect(boundingElement?.current);

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
  wait = 500,
} = {}) => {
  const element = useRef();
  const boundingElement = useRef();
  const position = useRef(getScrollPosition({ useWindow, boundingElement }));
  const [isScrolling, setScrolling] = useState(false);

  const scrollRef = useRef(false);

  const handleScrollChange = useCallback(({ prevPos, currPos }) => {
    if (scrollRef.current === false) {
      setScrolling(true);
      scrollRef.current = true;
    }
    let isScrolling;
    clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
      setScrolling(false);
      scrollRef.current = false;
    }, 100);
  }, []);

  const callBack = useCallback(() => {
    const currPos = getScrollPosition({ element, useWindow, boundingElement });

    onScrollChange?.({ prevPos: position.current, currPos });
    handleScrollChange({ prevPos: position.current, currPos });

    position.current = currPos;
  }, [onScrollChange, handleScrollChange, useWindow]);

  const throttlFn = useRef(throttle(callBack, wait)).current;

  useLayoutEffect(() => {
    if (!isBrowser) {
      return undefined;
    }

    const boundingEl = boundingElement.current;
    const handleScroll = () => {
      throttlFn();
    };

    if (boundingEl) {
      boundingEl?.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (boundingEl) {
        boundingEl?.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [callBack, wait]);

  const returnValue = [position, isScrolling, boundingElement, element];

  returnValue.position = position;
  returnValue.boundingElement = boundingElement;
  returnValue.element = element;
  returnValue.isScrolling = isScrolling;
  return returnValue;
};
