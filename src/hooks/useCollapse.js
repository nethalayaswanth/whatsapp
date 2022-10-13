import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import raf from "raf";

import useControlledState from "./useControlledState";
import { useCallback } from "react";
import { mergeRefs, callAll } from "../utils";
import { memo } from "react";

const easeInOut = "cubic-bezier(0.4, 0, 0.2, 1)";

const noop = () => {};

export const useCollapse = ({
  duration,
  easing = easeInOut,
  collapseStyles = {},
  expandStyles = {},
  onExpandStart = noop,
  onExpandEnd = noop,
  onCollapseStart = noop,
  onCollapseEnd = noop,
  isExpanded: configIsExpanded,
  defaultExpanded = false,
  hasDisabledAnimation = false,
  collapseWidth,
  variable=0,
  ...initialConfig
} = {}) => {
  const [isExpanded, setExpanded] = useControlledState(
    configIsExpanded,
    defaultExpanded
  );

  const el = useRef(null);

  const collapsedHeight = `${initialConfig.collapsedHeight || 0}px`;
  const collapsedWidth = `${initialConfig.collapsedWidth || 0}px`;
  const collapsedStyles = {
    display: collapsedHeight === "0px" ? "none" : "block",
    ...(collapseWidth
      ? { width: collapsedWidth }
      : { height: collapsedHeight }),
    overflow: "hidden",
  };
  const [styles, setStylesRaw] = useState(isExpanded ? {} : collapsedStyles);

  
  const setStyles = (newStyles = (oldStyles) => {}) => {
    flushSync(() => {
      setStylesRaw(newStyles);
    });
  };
  const mergeStyles = useCallback((newStyles = {}) => {
    setStyles((oldStyles) => ({ ...oldStyles, ...newStyles }));
  }, []);

  function getDuration(x) {
    if (!x || typeof x === "string") {
      return 0;
    }

    const constant = x / 36;

    return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
  }
  const getTransitionStyles = useCallback(
    (value) => {
      if (hasDisabledAnimation) {
        return {};
      }
      const _duration = duration || getDuration(value);
      return {
        transition: `all ${_duration}ms ${easing}`,
      };
    },
    [duration, easing, hasDisabledAnimation]
  );

  const mountRef = useRef(true);

  useLayoutEffect(() => {
     raf(() => {
        onExpandStart();
        mergeStyles({
          ...expandStyles,
          willChange: "height width",
          display: "block",
          overflow: "hidden",
        });
         raf(() => {
          
          const change=`${variable}px`
           const value = collapseWidth ? { width: change } : { height: change };
           mergeStyles({
             ...getTransitionStyles(variable),
             ...value,
           });
         });

  })}, [variable]);

  useLayoutEffect(() => {
    if (mountRef.current) {
      mountRef.current = false;
      return;
    }
    if (isExpanded) {
      raf(() => {
        onExpandStart();
        mergeStyles({
          ...expandStyles,
          willChange: "height width",
          display: "block",
          overflow: "hidden",
        });
        raf(() => {
          const height = el.current ? el.current.scrollHeight : "0px";
          const width = el.current ? el.current.scrollWidth : "0px";
          const value = collapseWidth ? { width } : { height };
          mergeStyles({
            ...getTransitionStyles(collapseWidth ? width : height),
            ...value,
          });
        });
      });
    } else {
      raf(() => {
        onCollapseStart();
        const height = el.current ? el.current.scrollHeight : "0px";
        const width = el.current ? el.current.scrollWidth : "0px";
        const value = collapseWidth ? { width } : { height };

        mergeStyles({
          ...collapseStyles,
          ...getTransitionStyles(collapseWidth ? width : height),
          willChange: "height width",
          ...value,
        });
        raf(() => {
          const height = collapsedHeight;
          const width = collapsedWidth;
          const value = collapseWidth ? { width } : { height };
          mergeStyles({
            ...value,
            overflow: "hidden",
          });
        });
      });
    }
  }, [isExpanded]);

  const handleTransitionEnd = (e) => {
    if (e.target !== el.current || e.propertyName !== "height" || "width") {
      return;
    }

    if (isExpanded) {
      const height = el.current ? el.current.scrollHeight : "0px";
      const width = el.current ? el.current.scrollWidth : "0px";

      if (height === styles.height || width === styles.width) {
        setStyles({});
      } else {
        mergeStyles({ height });
      }

      onExpandEnd();
    } else if (
      styles.height === collapsedHeight ||
      styles.width === collapsedWidth
    ) {
      setStyles(collapsedStyles);
      onCollapseEnd();
    }
  };

  const Toggle = useCallback(
    (show) => {
      if (show !== undefined) {
        setExpanded(show);
        return;
      }
      setExpanded((n) => !n);
    },
    [setExpanded]
  );

  function getCollapseProps({
    style = {},
    onTransitionEnd = noop,
    refKey = "ref",
    ...rest
  }={}) {
    const theirRef = rest[refKey];
    return {
      id: `react-collapsed-panel`,
      "aria-hidden": !isExpanded,
      ...rest,
      [refKey]: mergeRefs(el, theirRef),
      onTransitionEnd: callAll(handleTransitionEnd, onTransitionEnd),
      style: {
        boxSizing: "border-box",

        ...style,

        ...styles,
      },
    };
  }

  return {
    Toggle,
    getCollapseProps,
    isExpanded,
    setExpanded,
  };
};

export default useCollapse;
