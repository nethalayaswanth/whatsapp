import raf from "raf";
import {
  cloneElement,
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import usePrevious from "../../hooks/usePrevious";
import { ReactComponent as MenuIcon } from "../../assets/menu.svg";
import ClickAway from "../OutSideClick";

const Portal = memo(
  ({
    parent,
    trigger,
    children,
    transform,
    align,
    active,
    offset,
    onCollapse,
  }) => {
    const root = parent || document.getElementById("root");

    const childRef = useRef();

    const triggerPos = useRef(trigger.getBoundingClientRect()).current;

    const initialStyles = {
      top: `${triggerPos.top}px`,
      left: `${triggerPos.top}px`,
      visibility: "hidden",
    };

    const [toolTipStyles, setToolStyles] = useState(initialStyles);

    const toolRef = useRef();

    const getStyles = useCallback(() => {
      const triggerRect = trigger.getBoundingClientRect();

      const childRect = childRef.current.getBoundingClientRect();

      const [topOffset, leftOffset] = offset ? offset : [5, 0];
      const childHeight = toolRef.current.scrollHeight;
      const childWidth = toolRef.current.scrollWidth;

      const alignLeft = align === "left" ? "right" : false;
      const alignCenter = align === "center" ? "center" : false;
      const bottom = document.body.clientHeight - triggerRect.bottom;
      const alignBottom = bottom - childHeight > 0 ? "top" : false;
      const alignTop = !alignBottom ? "bottom" : false;
      const alignRight = !alignLeft && !alignCenter ? "left" : false;
      const topPos = alignBottom
        ? `${triggerRect.bottom + window.scrollY + topOffset}px`
        : `${triggerRect.top + window.scrollY - childHeight - topOffset}px`;
      const leftPos = alignLeft
        ? `${triggerRect.left + triggerRect.width - childWidth + leftOffset}px`
        : alignCenter
        ? `${
            triggerRect.left +
            triggerRect.width / 2 -
            childWidth / 2 +
            leftOffset
          }px`
        : `${triggerRect.left + leftOffset}px`;

      const originX = [alignLeft, alignRight, alignCenter].filter((x) => !!x);
      const originY = [alignBottom, alignTop].filter((x) => !!x);

      const transformOrigin = `${originY[0]} ${originX[0]}`;
      return {
        top: topPos,
        left: leftPos,
        maxWidth: "340px",
        transformOrigin,
      };
    }, [align, offset, trigger]);

    useLayoutEffect(() => {
      if (childRef.current && active) {
        raf(() => {
          setToolStyles((x) => ({
            ...x,
            ...getStyles(),
            ...(transform ? { transform: "none" } : { transform: "scale(0)" }),
          }));

          raf(() => {
            setToolStyles((x) => ({
              ...x,
              ...(transform
                ? { transform }
                : {
                    transform: "scale(1)",
                  }),
              transition: "all 150ms cubic-bezier(.1,.82,.25,1)",
              visibility: "visible",
            }));
          });
        });
      }
    }, [getStyles, active, transform]);

    const prevActive = usePrevious(active);

    useLayoutEffect(() => {
      if (childRef.current && !active && prevActive) {
        raf(() => {
          setToolStyles((x) => ({
            ...x,
            ...(transform
              ? { transform: "none" }
              : {
                  transform: "scale(0)",
                }),
            transition: "all 150ms cubic-bezier(.1,.82,.25,1)",
          }));
        });
      }
    }, [active, transform, prevActive]);

    const handleTransitionEnd = () => {
      if (!active && prevActive) {
        onCollapse?.();
      }
    };

    return (
      <>
        {createPortal(
          <span id="tool-tip">
            <div
              ref={toolRef}
              style={{ ...toolTipStyles }}
              onTransitionEnd={handleTransitionEnd}
              className="absolute z-[1000] "
            >
              <div
                ref={childRef}
                className="relative max-h-[calc(100vh-30px)] max-w-[calc(100vw-30px)] "
              >
                {children}
              </div>
            </div>
          </span>,
          root
        )}
      </>
    );
  }
);

const defaultButton = ({ open }) => {
  return (
    <div
      className={`ml-2.5 first-of-type:ml-0 rounded-full h-full flex-none relative ${
        open && `bg-[rgba(11,20,26,0.1)]`
      } `}
    >
      <div className="p-2 flex items-center cursor-pointer">
        <span>
          <MenuIcon />
        </span>
      </div>
    </div>
  );
};

const ToolTip = ({
  align = "left",
  offset,
  children,
  Button,
  onCollapse,
  transform,
}) => {
  const position = align;
  const [isActive, setActive] = useState(false);
  const [opened, setOpened] = useState(false);
  const triggerRef = useRef();

  const openToolTip = useCallback((e) => {
    setActive((x) => !x);
    e.stopPropagation();
  }, []);

  const closeToolTip = useCallback(() => {
    setActive(false);
  }, []);

  useLayoutEffect(() => {
    if (isActive) {
      setOpened(true);
    }
  }, [isActive]);

  const handleOnCollapse = useCallback(() => {
    setOpened(false);
    onCollapse?.();
  }, [onCollapse]);

  return (
    <>
      <ClickAway onClickAway={closeToolTip}>
        <span ref={triggerRef} onClick={openToolTip}>
          {Button && cloneElement(Button, { opened })}
        </span>

        {triggerRef.current && opened && (
          <Portal
            active={isActive}
            align={position}
            offset={offset}
            onCollapse={handleOnCollapse}
            trigger={triggerRef.current}
            transform={transform}
          >
            {children && (
              <>
                {typeof children === "function"
                  ? children({ openToolTip, closeToolTip, opened })
                  : cloneElement(children, {
                      openToolTip,
                      closeToolTip,
                      opened,
                    })}
              </>
            )}
          </Portal>
        )}
      </ClickAway>
    </>
  );
};
export default ToolTip;
