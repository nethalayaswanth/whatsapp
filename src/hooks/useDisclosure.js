import {
  createContext,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import useControlledState from "./useControlledState";

import raf from "raf";
import { flushSync } from "react-dom";
import usePrevious from "./usePrevious";

import { callAll, mergeRefs } from "../utils";

export const noop = () => {};

const easeInOut = "cubic-bezier(0.4, 0, 0.2, 1)";

const DisclosureContext = createContext();

const clamp = (min, max, x) => Math.max(min, Math.min(x, max));

const getTransfrom = (w, h, cw, ch, direction) => {
  const left = direction === "left";
  const right = direction === "right";
  const top = direction === "top";
  const bottom = direction === "bottom";
  if (left) {
    const t = clamp(-cw, 0, w - cw);
    const v = cw - Math.abs(t);
    return [`translateX(${-cw}px)`, `translateX(${t}px)`, v];
  }

  if (right) {
    const t = clamp(0, w, w - cw);
    const v = w - Math.abs(t);

    return [`translateX(${w}px)`, `translateX(${t}px)`, v];
  }
  if (bottom) {
    const t = clamp(0, h, h - ch);
    const v = h - Math.abs(t);

    return [`translateY(${ch}px)`, `translateY(${t}px)`, ch];
  }

  if (top) {
    const t = clamp(-ch, 0, h - ch);
    const v = ch - Math.abs(t);
    return [`translateY(${-ch}px)`, `translateY(${t}px)`, v];
  }

  return [`translateY(${0}px)`, `translateY(${0}px)`, 0];
};

export default function useDisclosure({
  duration,
  easing = easeInOut,
  style: parentInitialStyles = {},
  onExpandStart = noop,
  onExpandEnd = noop,
  onCollapseStart = noop,
  onCollapseEnd = noop,
  isExpanded: configIsExpanded,
  defaultExpanded = false,
  hasAnimationDisabled = false,
  unMount = true,
  children = <div></div>,
  direction: configDirection,
  ...props
} = {}) {
  const parentEl = useRef(null);
  const el = useRef(null);

  const [isExpanded, setExpanded] = useControlledState(
    configIsExpanded,
    defaultExpanded
  );

  const [mount, setMount] = useState(isExpanded);

  const direction = configDirection || "bottom";

  const initialStyles = {
    visibility: "hidden",
    transform: "translateX(9999px) translateY(9999px)",
  };

  const parentStyles = {
    position: "relative",
    ...parentInitialStyles,
    overflow: "hidden",
    display: "block",
  };

  const [styles, setStylesRaw] = useState(initialStyles);

  const setStyles = (newStyles) => {
    flushSync(() => {
      setStylesRaw(newStyles);
    });
  };
  const mergeStyles = useCallback((newStyles) => {
    setStyles((oldStyles) => ({ ...oldStyles, ...newStyles }));
  }, []);

  const prevChild = usePrevious();

  const getTranslate = useCallback(() => {
    if (!parentEl?.current || !el?.current) {
      return [`translateY(${0}px)`, `translateY(${0}px)`, 0];
    }

    const parent = parentEl.current.getBoundingClientRect();
    const child = el.current.getBoundingClientRect();

    return getTransfrom(
      parent.width,
      parent.height,
      child.width,
      child.height,
      direction
    );
  }, [getTransfrom]);

  function getDuration(x) {
    if (!x || typeof x === "string") {
      return 0;
    }

    const constant = x / 36;

    return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
  }

  const getTransitionStyles = useCallback(
    (height) => {
      if (hasAnimationDisabled) {
        return {};
      }
      const _duration = duration || getDuration(height);
      return {
        transition: `transform ${_duration}ms ${easing}`,
      };
    },
    [duration, easing, hasAnimationDisabled]
  );

  const justMounted = useRef(true);

  useLayoutEffect(() => {
    if (isExpanded) {
      setMount(true);
    }
  }, [isExpanded]);

  const [prevIsExpanded] = usePrevious(isExpanded);

  useLayoutEffect(() => {
    if (isExpanded) {
      raf(() => {
        onExpandStart();
        const [initial, final, value] = getTranslate();

        mergeStyles({
          position: "relative",
          willChange: "transform",
          visibility: "visible",
          transform: initial,
          top: 0,
          left: 0,
        });
        raf(() => {
          const [initial, final, value] = getTranslate();
          mergeStyles({
            ...getTransitionStyles(value),
            transform: final,
          });
        });
      });
    }
  }, [isExpanded]);

  useLayoutEffect(() => {
    if (!isExpanded && prevIsExpanded) {
      raf(() => {
        onCollapseStart();

        const [initial, final, value] = getTranslate();

        mergeStyles({
          ...getTransitionStyles(value),
          willChange: "transform",
          transform: final,
          position: "relative",
          top: 0,
          left: 0,
        });
        raf(() => {
          mergeStyles({
            transform: initial,
          });
        });
      });
    }
  }, [isExpanded]);

  const handleClose = useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  const handleTransitionEnd = (e) => {
    if (e.target !== el.current || e.propertyName !== "transform") {
      return;
    }

    if (isExpanded) {
      onExpandEnd();
      return;
    }

    onCollapseEnd();
    if (unMount) setMount(false);
  };

  function getParentProps({
    style = {},
    onTransitionEnd = noop,
    refKey = "ref",
    ...rest
  } = {}) {
    const theirRef = rest[refKey];
    return {
      id: `react-disclosure-parent`,
      "aria-hidden": !isExpanded,
      ...rest,
      [refKey]: mergeRefs(parentEl, theirRef),
      style: {
        boxSizing: "border-box",
        ...style,
        ...parentStyles,
      },
    };
  }

  function getDisclosureProps({
    style = {},
    onTransitionEnd = noop,
    refKey = "ref",
    ...rest
  } = {}) {
    const theirRef = rest[refKey];
    return {
      id: `react-disclosure-panel`,
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
    mount,
    getParentProps,
    getDisclosureProps,
  };
}
