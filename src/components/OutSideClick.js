import { useRef, useEffect, useCallback, createElement } from "react";

const ClickAway = ({ onClickAway,onClick, children, ...props }) => {
  const clickCaptured = useRef();

  const handleClick = useCallback(
    (e) => {
      if (!clickCaptured.current && onClickAway) {
        onClickAway?.();
      }

      clickCaptured.current = false;
    },
    [onClickAway]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [handleClick]);

  const innerClick = () => {
    clickCaptured.current = true;
    onClick?.()
  };

  const getProps = () => {
    return {
      onMouseDown: innerClick,
      onTouchStart: innerClick,
    };
  };

  if (typeof children === "function") {
    return children(getProps());
  }

  return createElement(props.component || "span", getProps(), children);
};

export default ClickAway;
