import { useState,useCallback,useRef } from "react";



function useHover() {
  const [value, setValue] = useState(false);

  const handleMouseOver = useCallback(() =>{ setValue(true)}, []);
  const handleMouseOut = useCallback(() => {setValue(false)}, []);

  const ref = useRef();
  

  const callbackRef = useCallback(
    node => {
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

  return [callbackRef, value] }



  export default useHover