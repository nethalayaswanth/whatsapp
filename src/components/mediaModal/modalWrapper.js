
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
import { useTransition } from ".";
import useResizeObserver from "use-resize-observer";
import { formatDate, mergeRefs } from "../../utils";

const ModalWrapperContext = createContext();

 const ModalWrapper = ({ children, modalState, swiper, root,enableMinimize, unMount }) => {


  const {
    showMini,
    containerRef,
    opened,
    mainMounted,
    register,
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
              {showMini && (
                <div
                  {...register({ name: "mini" })}
                  onTransitionEnd={onTransitionEnd}
                  className="absolute  z-[500] "
                >
                  <div
                    {...register({ name: "image" })}
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
                {...register({
                  name: "overlay",
                })}
                className={` left-0 z-[400]  fixed  top-0 w-full h-full bg-white `}
              ></div>
              <div className="pb-[100px]   left-0 z-[502] flex flex-col fixed items-center top-0 w-full h-full">
                <div
                  {...register({ name: "header" })}
                  className="flex z-[502] h-[60px] w-full items-center justify-end flex-none relative "
                >
                  {header}
                </div>
                <div
                  onTransitionEnd={onClosed}
                  {...register({
                    name: "main",
                    ref: mergeRefs(resizeRef, containerRef),
                  })}
                  className="relative px-0 z-[500]  flex flex-auto flex-shrink-0 items-center justify-between h-[calc(100%-60px)]  w-full"
                >
                  {mainMounted && main}
                </div>
              </div>
              {footer && (
                <div
                  {...register({
                    name: "footer",
                  })}
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