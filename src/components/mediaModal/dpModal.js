import {
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import raf from "raf";

import useMount from "../../hooks/useMount";
import usePrevious from "../../hooks/usePrevious";
import { ReactComponent as Close } from "../../assets/close.svg";

import useResizeObserver from "use-resize-observer";
import { useModalDispatch, useModalState } from "../../contexts/modalContext";
import { ErrorBoundary } from "../errorBoundary";
import { ModalHeader } from "./Header";
import { createContext } from "react";
import { useTransition } from "./useTransition";
import { formatDate, mergeRefs } from "../../utils";

const PropsContext = createContext();

const PropsProvider = ({ children, modalState, root, unMount }) => {
  const {
    styles: { mini, header, main, thumb },
    opened,
    imageStyles,
    containerRef,
    overlayOpacity,
    onClosed,
    onTransitionEnd,
  } = useTransition({ modalState, unMount });

  const { preview } = modalState;
  const [headerComponent, mainComponent] = children;

  const {
    ref: resizeRef,
    width: containerWidth,
    height: containerHeight,
  } = useResizeObserver();

  return (
    <PropsContext.Provider value={{ containerWidth, containerHeight, opened }}>
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
                  style={{ ...mini }}
                  className="absolute  z-[500] "
                  onTransitionEnd={onTransitionEnd}
                >
                  <div
                    style={{ ...imageStyles }}
                    className="h-full w-full relative items-start justify-center flex"
                  >
                    <div className="w-full h-full  absolute  items-center justify-center flex ">
                      <img
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
              <div className="pb-[100px] bg-inherit   left-0 z-[502] flex flex-col fixed items-center top-0 w-full h-full">
                <div
                  style={{ ...(header && header) }}
                  className="flex z-[502] h-[60px] w-full items-center justify-end flex-none relative "
                >
                  {headerComponent}
                </div>
                <div
                  ref={mergeRefs(resizeRef, containerRef)}
                  style={{ ...(main && main) }}
                  onTransitionEnd={onClosed}
                  className="relative px-0 z-[500]  flex flex-auto flex-shrink-0 items-center justify-between h-[calc(100%-60px)]  w-full"
                >
                  {mainComponent}
                </div>
              </div>
            </div>
          </div>,
          root
        )}
    </PropsContext.Provider>
  );
};

export function useProps() {
  const context = useContext(PropsContext);
  if (context === undefined) {
    throw new Error("useProps must be used within a PropsProvider");
  }
  return context;
}


const ImageModal = ({ modalState, unMount, root,children }) => {

  

  return (
    <PropsProvider {...{ modalState, root, unMount }}>
        {children}
    </PropsProvider>
  );
};


export default ImageModal;
