import {
  useCallback,
  useLayoutEffect,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { FooterProvider, useFooter } from "../../contexts/footerContext";

import useAnimationFrame from "../../hooks/useAnimationFrame";
import usePrevious from "../../hooks/usePrevious";

import { Children } from "react";

const lerp = (a, b, t) => a + (b - a) * t;
const easeIn = (t) => t * t;

const easeOut = (t) => t * (2 - t);


const Stack = ({ children, scroller, footer }) => {
  const spacerRef = useRef();

  const conversationContainerRef = useRef();
  const currentScrollRef = useRef();

  const [footerState, dispatch] = useFooter();

  const bottomSheetOpened = footerState.bottomSheetOpened;
 
  const [prevBottomSheetOpened] = usePrevious(bottomSheetOpened);

  useLayoutEffect(() => {
    if (!scroller.current) return;
    if (bottomSheetOpened) dispatch({ type: "toggle bottomSheetMount" });

    currentScrollRef.current = scroller.current.scrollTop;
  }, [bottomSheetOpened, dispatch, scroller]);

  useAnimationFrame(
    (progress) => {
      const footerHeight = footer.current.getBoundingClientRect().height;

      const t = lerp(0, -footerHeight, easeOut(progress));
      const ft = lerp(footerHeight, 0, easeOut(progress));

      footer.current.style.transform = `translateY(${ft}px)`;

      if (currentScrollRef.current === 0) {
        spacerRef.current.style.height = `${footerHeight}px`;

        return;
      }
      conversationContainerRef.current.style.transform = `translateY(${t}px)`;
    },
    {
      onComplete: () => {
        const footerHeight = footer.current.getBoundingClientRect().height;
        spacerRef.current.style.height = `${footerHeight}px`;
        scroller.current.scroll({
          top: currentScrollRef.current + 320,
        });
        conversationContainerRef.current.style.transform = `translateY(${0}px)`;
      },
      shouldAnimate: bottomSheetOpened && !prevBottomSheetOpened,
      duration: 300,
    }
  );

  useAnimationFrame(
    (progress) => {
      const footerHeight = footer.current.getBoundingClientRect().height;
      const t = lerp(-footerHeight, 0, easeIn(progress));

      const ft = lerp(0, footerHeight, easeIn(progress));

      footer.current.style.transform = `translateY(${ft}px)`;

      spacerRef.current.style.height = "0px";

      if (currentScrollRef.current === 0) return;
      scroller.current.scroll({
        top: currentScrollRef.current - footerHeight,
      });
      conversationContainerRef.current.style.transform = `translateY(${t}px)`;
    },
    {
      onComplete: () => {
        dispatch({ type: "toggle bottomSheetMount" });
      },
      shouldAnimate: !bottomSheetOpened && prevBottomSheetOpened,
      duration: 300,
    }
  );

  const [Conversation, Footer] = Children.toArray(children);

  return (
    <>
      <div
        ref={spacerRef}
        style={{
          height: `${0}px`,
        }}
        className={`flex-grow-0 flex-shrink-0 basis-auto order-3 `}
      ></div>
      <div
        ref={conversationContainerRef}
        className="relative z-[1] flex-auto basis-auto order-2"
      >
        <div>
          <div className="absolute top-0 z-50 flex  flex-col w-full h-full">
            {Conversation}
          </div>
        </div>
      </div>
      <div className="w-full relative z-[1] flex-none order-3">{Footer}</div>
    </>
  );
};



export default Stack;
