import { useState, useCallback, useRef, useEffect } from "react";

function useHover(getNode) {
  const [value, setValue] = useState(false);

  const handleMouseOver = useCallback(() => {
    setValue(true);
  }, []);
  const handleMouseOut = useCallback(() => {
    setValue(false);
  }, []);

  const ref = useRef();

  const callbackRef = useCallback(
    (node) => {
      if (ref.current) {
        ref.current.removeEventListener("mouseenter", handleMouseOver);
        ref.current.removeEventListener("mouseleave", handleMouseOut);
      }

      ref.current = node;

      if (node) {
        ref.current.addEventListener("mouseenter", handleMouseOver);
        ref.current.addEventListener("mouseleave", handleMouseOut);
      }
    },
    [handleMouseOver, handleMouseOut]
  );

  useEffect(() => {
    if(!getNode) return
    if (typeof getNode ==='function') {
      const node = getNode();
      if (node) {
        callbackRef(node);
      }
    }else{
       callbackRef(getNode);
    }
  }, [callbackRef, getNode]);

  return [callbackRef, value];
}

export default useHover;
