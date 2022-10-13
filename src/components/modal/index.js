import raf from "raf";
import { useLayoutEffect, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";

export function Modal({
  width = "500px",
  height = "500px",
  style,
  show,
  children,
  animate = true,
}) {
  const [mount, setMount] = useState();

  const root = useMemo(() => document.getElementById("globalmodal"), []);

  const initialStyles = animate
    ? {
        ...style,
        transform: "scaleX(0) scaleY(0)",
        opacity: 0,
      }
    : {
        ...style,
        transform: "scaleX(1) scaleY(1)",
        opacity: 1,
      };

  const [styles, setStyles] = useState(initialStyles);
  useLayoutEffect(() => {
    if (show) {
      setMount(true);
      return;
    }
    if (!animate && !show) {
      setMount(false);
    }
  }, [show, animate]);

  useEffect(() => {
    if (!animate) return;
    if (show) {
      raf(() => {
        setStyles((old) => ({
          ...old,
          transform: "scaleX(0) scaleY(0)",
          opacity: 0,
        }));

        raf(() => {
          setStyles((old) => ({
            ...old,
            transform: "scaleX(1) scaleY(1)",
            opacity: 1,
            transition: "all ease-out 0.3s ",
          }));
        });
      });
      return;
    }
    if (!show) {
      raf(() => {
        setStyles((old) => ({
          ...old,
          transform: "scaleX(0) scaleY(0)",
          opacity: 0,
        }));
      });
    }
  }, [animate, show]);

  const handleTransitionEnd = () => {
    if (!show) {
      setMount(false);
    }
  };

  return (
    <>
      {mount &&
        createPortal(
          <div className="absolute t-0 l-0 b-0 r-0 z-[1000]">
            <div className="fixed top-0 l-0 w-full h-full bg-[hsla(0,0%,100%,0.85)]">
              <div className="flex flex-col items-center justify-center w-full h-[600px] min-w-[748px] min-h-full ">
                <div
                  style={{ width, height, ...styles }}
                  onTransitionEnd={handleTransitionEnd}
                  className="pt-[22px] px-[24px] pb-[26px] bg-white rounded-[3px] relative"
                >
                  {children}
                </div>
              </div>
            </div>
          </div>,
          root
        )}
    </>
  );
}
