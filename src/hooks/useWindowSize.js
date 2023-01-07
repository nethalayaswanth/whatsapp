import { useLayoutEffect, useState } from "react";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: document.body.clientWidth,
    height: document.body.clientHeight,
  });
  useLayoutEffect(() => {
    function handleResize() {
      setWindowSize({
        width: document.body.clientWidth,
        height: document.body.clientHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

 
  return windowSize;
}
