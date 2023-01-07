
import raf from "raf";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { createContext } from "react";
import { useTransition } from "./useTransition";
import useResizeObserver from "use-resize-observer";
import { formatDate, mergeRefs } from "../../utils";

const ModalWrapperContext = createContext();

 const ModalWrapper = ({ children, modalState, swiper, root,enableMinimize, unMount }) => {


  const {
    styles,
    opened,
    containerRef,
    overlayOpacity,
    mainMounted,
    
    onClosed,
    onTransitionEnd,
  } = useTransition({ modalState, unMount, enableMinimize, swiper });

  const { preview } = modalState;
  const [header, main, footer] = children;

  const {
    ref: resizeRef,
    width: containerWidth,
    height: containerHeight,
  } = useResizeObserver();

  return (
    <ModalWrapperContext.Provider
      value={{ containerWidth, containerHeight, opened }}
    >
      {root &&
        createPortal(
          <div
            className={`image-swiper z-[1002] top-0 left-0 w-full h-full absolute 
              xs:dark text-white 
            `}
          >
            <div className=" left-0 z-[500]  relative top-0 w-full h-full">
              {!opened && (
                <div
                  style={{ ...styles.mini }}
                  className="absolute  z-[500] "
                  onTransitionEnd={onTransitionEnd}
                >
                  <div
                    style={{ ...styles.image }}
                    className="h-full w-full relative items-start justify-center flex"
                  >
                    <div className="w-full h-full  absolute  items-center justify-center flex ">
                      <img
                        // onLoad={() => {mountMini(true)}}
                        className="w-full flex-shrink-0 flex-grow-0 basis-auto"
                        alt=""
                        src={preview}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  opacity: overlayOpacity,
                  transition:
                    "opacity 300ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
                }}
                className={` left-0 z-[400]  fixed  top-0 w-full h-full bg-white `}
              ></div>
              <div className="pb-[100px]   left-0 z-[502] flex flex-col fixed items-center top-0 w-full h-full">
                <div
                  style={{ ...(styles.header && styles.header) }}
                  className="flex z-[502] h-[60px] w-full items-center justify-end flex-none relative "
                >
                  {header}
                </div>
                <div
                  ref={mergeRefs(resizeRef, containerRef)}
                  style={{ ...(styles.main && styles.main) }}
                  onTransitionEnd={onClosed}
                  className="relative px-0 z-[500]  flex flex-auto flex-shrink-0 items-center justify-between h-[calc(100%-60px)]  w-full"
                >
                  {mainMounted && main}
                </div>
              </div>
              {footer && (
                <div
                  style={{ ...(styles.footer && styles.footer) }}
                  className={`thumb border-t
                   border-border-panel  bottom-0 absolute flex z-[502] flex-col overflow-hidden h-[100px] xs:h-[80px] w-full`}
                >
                  {mainMounted && footer}
                </div>
              )}
            </div>
          </div>,
          root
        )}
    </ModalWrapperContext.Provider>
  );
};

export function useModal() {
  const context = useContext(ModalWrapperContext);
  if (context === undefined) {
    throw new Error("useProps must be used within a ModalWrapper");
  }
  return context;
}

export default ModalWrapper