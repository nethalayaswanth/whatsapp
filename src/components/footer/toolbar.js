
import { useMemo } from "react";
import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react";
import { ReactComponent as AttachmentIcon } from "../../assets/attachment.svg";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Emoji } from "../../assets/emoji.svg";
import { ReactComponent as Gif } from "../../assets/gif.svg";
import { ReactComponent as Sticker } from "../../assets/sticker.svg";

import {
  useFooterDispatch,
  useFooterState,
} from "../../contexts/footerContext";

import usePrevious from "../../hooks/usePrevious";

export const calculateBoundingBoxes = (children) => {
  const boundingBoxes = {};

  children.forEach((child) => {
    const domNode = child;
    const {left} =  domNode.getBoundingClientRect();
    const opacity = domNode.style.opacity;
    boundingBoxes[child.id] = { left,opacity};
  });

  return boundingBoxes;
};

export const Button = forwardRef(({ active,children,absolute,id,className,style, ...props },ref) => {
  
  return (
    <button
      ref={ref}
      id={id}
      style={{ ...style }}
      {...props}
      className={`mr-[8px] pointer-events-auto  p-0 outline-none border-0 cursor-pointer h-full   top-0 ${active?'text-primary-teal':''}  ${
        absolute ? "absolute" : ""
      } ${className ? className : ""}`}
    >
      {children}
    </button>
  );
});

const ToolBar = ({ mobile }) => {
   const footerState = useFooterState();
   const setFooterState = useFooterDispatch();

  const handleClose = useCallback(
    (e) => {
      setFooterState({
        type: "close bottomSheet",
      });
    },
    [setFooterState]
  );

  const handleNavigation = useCallback(
    (active) => {
      setFooterState({
        type: "set activeTab",
        payload: {activeTab: active },
      });
    },
    [setFooterState]
  );

    const handleAttachment = useCallback(
      (active) => {
        setFooterState({
          type: "toggle attachment",
          payload: { activeTab: active },
        });
      },
      [setFooterState]
    );

  const {
    activeTab,
    bottomSheetOpened: openMenu,
    bottomSheetMounted,
    attachmentDialogOpened: attachmentActive,
  } = footerState;

  const menu = useMemo(
    () => ({
      close: {
        Icon: Close ,
        style: {
          zIndex: attachmentActive ? 3 : 1,
          opacity: attachmentActive || openMenu ? 1 : 0,
          transition: "none",
        },
        handler: handleClose,
      },
      emoji: {
        Icon: Emoji,
        style: {
          zIndex: attachmentActive ? 1 : 3,
          opacity: attachmentActive ? 0 : 1,
          transition: "none",
        },
        handler: handleNavigation,
      },
      gif: {
        Icon: Gif ,
        style: { zIndex: 1, opacity: openMenu ? 1 : 0, transition: "none" },
        handler: handleNavigation,
      },
      sticker: {
        Icon: Sticker,
        style: { zIndex: 1, opacity: openMenu ? 1 : 0, transition: "none" },
        handler: handleNavigation,
      },
      attachment: {
        Icon: AttachmentIcon ,
        style: {
          zIndex: 1,
          opacity: 1,
          marginRight: "0px",
          transition: "none",
        },
        handler: handleNavigation,
      },
    }),
    [attachmentActive, handleClose, handleNavigation, openMenu]
  );

  const { close, attachment, ...pickers } = menu;

  const buttonRefs = useRef({});
  const containerRef = useRef(); 

  const prevBoundingBoxRef = useRef();
  const prevContainerRef = useRef();

  useLayoutEffect(() => {
   
    prevBoundingBoxRef.current = null;
  }, [mobile]);

  useLayoutEffect(() => {
    if (!buttonRefs.current) return;
    const boundingBox = calculateBoundingBoxes(
      Object.values(buttonRefs.current)
    );
    const prevBoundingBox = prevBoundingBoxRef.current;
    const prevContainerWidth = prevContainerRef.current;
    const conatainerWidth = containerRef.current.getBoundingClientRect().width;

    if (prevBoundingBox) {
      requestAnimationFrame(() => {
      
        containerRef.current.style.width = prevContainerWidth;
        containerRef.current.style.transition = "width 0ms";
        Object.values(buttonRefs.current).forEach((child) => {
          const domNode = child;

          const prev = prevBoundingBox[child.id];

          const current = boundingBox[child.id];

          const changeInX = prev.left - current.left;

          domNode.style.transform = `translateX(${changeInX}px)`;
          domNode.style.opacity = prev.opacity;
          domNode.style.transition = "transform 0s,opacity 0ms";
          //  domNode.style.pointerEvents = "none";
        });

        requestAnimationFrame(() => {
          containerRef.current.style.width = conatainerWidth;
          containerRef.current.style.transition = "width 300ms";
          Object.values(buttonRefs.current).forEach((child) => {
            const domNode = child;
            const current = boundingBox[child.id];
            domNode.style.transform = "";
            domNode.style.opacity = current.opacity;
            domNode.style.pointerEvents = "auto";
            domNode.style.transition = "transform 300ms,opacity 300ms";
          });
        });
      });
    }
    prevBoundingBoxRef.current = boundingBox;
    prevContainerRef.current = conatainerWidth;
  }, [openMenu, mobile]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          willChange: "width",
          ...(openMenu
            ? !mobile
              ? { margin: "0px", width: "162px" }
              : { width: "100%", flex: 1 }
            : { flexShrink: 1, width: "66px", flexBasis: "auto" }),
        }}
        className="px-[5px] py-[10px] relative  flex items-center min-h-[52px] text-panel-header-icon"
      >
        <div
          style={{
            willChange: "transform width",
            ...(openMenu
              ? !mobile
                ? { width: "162px", margin: "0px" }
                : { width: "100%", flex: 1 }
              : { flexShrink: 1, width: "66px", flexBasis: "auto" }),
          }}
          className="absolute left-0  pointer-events-auto h-full px-[5px] py-[10px] flex items-center  justify-center min-h-[52px] text-panel-header-icon"
        >
          <Button
            onClick={handleClose}
            id="close"
            style={close.style}
            ref={(node) => {
              buttonRefs.current["close"] = node;
            }}
          >
            <Close />
          </Button>
          <div
            className={`flex flex-1  z-[2] relative   items-center  h-full ${
              openMenu ? "justify-center " : "justify-end "
            } `}
          >
            {Object.entries(pickers).map(
              ([key, { Icon, style, handler }], i) => {
                return (
                  <Button
                    style={{ ...style }}
                    onClick={(e) => {
                      handler(key);
                    }}
                    ref={(node) => {
                      buttonRefs.current[key] = node;
                    }}
                    key={key}
                    id={key}
                    name={key}
                    absolute={!openMenu}
                    active={openMenu && activeTab === key}
                  >
                    <Icon />
                  </Button>
                );
              }
            )}
          </div>
          <Button
            key={"attachment"}
            id={"attachment"}
            name={"attachment"}
            ref={(node) => {
              buttonRefs.current["attachment"] = node;
            }}
            onClick={() => {
              handleAttachment();
            }}
            style={attachment.style}
            active={openMenu && footerState.attachmentDialogOpened}
          >
            <AttachmentIcon />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ToolBar
