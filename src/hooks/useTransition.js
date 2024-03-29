import {
  createContext,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import useControlledState from "./useControlledState";

import useAnimationFrame from "./useAnimationFrame";
import usePrevious from "./usePrevious";

import { callAll, mergeRefs } from "../utils";

export const noop = () => {};

const easeInOut = "cubic-bezier(0.4, 0, 0.2, 1)";
const lerp = (a, b, t) => a + (b - a) * t;
const easeIn = (t) => t * t;

const easeOut = (t) => t * (2 - t);

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
    return [-cw, t, v];
  }

  if (right) {
    const t = clamp(0, w, w - cw);
    const v = w - Math.abs(t);

    return [w, t, v];
  }
  if (bottom) {
    const t = clamp(0, h, h - ch);
    const v = h - Math.abs(t);

    return [ch, t, ch];
  }

  if (top) {
    const t = clamp(-ch, 0, h - ch);
    const v = ch - Math.abs(t);
    return [-ch, t, v];
  }

  return [0, 0, 0];
};

export default function useTransition({
  duration = 150,
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

  const currentStyles = useRef([0, 0, 0]);

  const prevStyles = usePrevious(currentStyles.current);

  const [isExpanded, setExpanded] = useControlledState(
    configIsExpanded,
    defaultExpanded
  );

  const [mount, setMount] = useState(isExpanded);

  const direction = configDirection || "bottom";

  const initialStyles = {
    visibility: "hidden",
    transform: "translateX(0px) translateY(0px)",
  };

  const parentStyles = {
    ...parentInitialStyles,
    overflow: "hidden",
    display: "block",
  };

  const [styles, setStylesRaw] = useState(initialStyles);

  const mergeStyles = useCallback((newStyles) => {
    setStylesRaw((oldStyles) => ({ ...oldStyles, ...newStyles }));
  }, []);

  const getTranslate = useCallback(() => {
    if (!parentEl?.current || !el?.current) {
      return [0, 0, 0];
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
  }, [direction]);

  // const elRefCb = (node) => {
  //   if (!node) return;
  //   if (!el.current) {
  //     el.current = node;
  //   }
  //   if (node.getBoundingClientRect() !== el.current.getBoundingClientRect()) {
  //     if (isExpanded && mount) {
  //       //console.log(getTranslate());
  //     }
  //     return;
  //   }
  //   el.current = node;
  // };

  useLayoutEffect(() => {
    if (isExpanded) {
      setMount(true);

      mergeStyles({
        position: "relative",
        willChange: "transform",
        visibility: "visible",
        top: 0,
        left: 0,
      });
    }
  }, [isExpanded]);

  const translate = (t) => {
    const x = direction === "left" || direction === "right";
    return x ? `translateX(${t}px)` : `translateY(${t}px)`;
  };

  useLayoutEffect(() => {
    if (isExpanded && mount) {
      currentStyles.current = getTranslate();
    }
  }, [getTranslate, isExpanded, mount]);

  const easeIn = useCallback((x) => x * x, []);
  const initial = 0;

  useAnimationFrame(
    (progress) => {
      const [i, f] = currentStyles.current;
      const t = lerp(i, f, easeOut(progress));
      el.current.style.transform = translate(t);
    },
    {
      shouldAnimate: isExpanded && mount,
      duration: duration,
    }
  );

  useAnimationFrame(
    (progress) => {
      const [i, f] = currentStyles.current;
      const t = lerp(f, i, easeIn(progress));
      el.current.style.transform = translate(t);

      if (progress >= 1) {
        onCollapseEnd?.();
        setMount(false);
      }
    },
    {
      shouldAnimate: !isExpanded && mount,
      duration: duration,
    }
  );

  function getParentProps({
    style = {},
    onTransitionEnd = noop,
    refKey = "ref",
    ...rest
  }) {
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
      onTransitionEnd: callAll(onTransitionEnd),
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
