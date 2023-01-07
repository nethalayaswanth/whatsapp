


import {
  useCallback,
  useState,
  useRef,
  createElement,
  ReactNode,
  ReactPortal,
  MutableRefObject,
  CSSProperties,
  useEffect
} from "react";
import { createPortal } from "react-dom";
import mergeRefs from '../../utils'
import useClickAway from "./useOutsideClick";
import { computePosition } from "./utils";

export const DEFAULT_OPTIONS= {
 
  floatOffset: 10,
  placement: "bottom-left",
  transformOrigin:'top-left',
  container:document.documentElement
};

export function useLayer({
  open = false,
  container= DEFAULT_OPTIONS.container,
  placement = DEFAULT_OPTIONS.placement,
  floatOffset = DEFAULT_OPTIONS.floatOffset,
  onOutsideClick,
  onParentClose,
  trigger,
}) {
  const [state, setState] = useState(() => ({
    placement,
    style: {
      position: "absolute",
      top: 0,
      left: 0,
    },
  }));

  const [data, setData] = useState({
    x: null,
    y: null,
    placement,
    transformOrigin: null,
  });

  const reference = useRef;
  const floating = useRef(null);
  const cleanupRef = useRef(null);
  const dataRef = useRef(data);

  const repositioningToken = useRef({ cancelled: false });

  const clickAwayProps = useClickAway({ onOutsideClick });

  useEffect(() => {
    return () => {
      repositioningToken.current.cancelled = true;
    };
  }, []);

  const handlePositioning = useCallback(function handlePositioning() {
    computePosition({
      reference,
      floating,
      offset: floatOffset,
      placement,
    });

    //   if (!lastState.current || didStateChange(lastState.current, newState)) {
    //     lastState.current = newState;
    //     repositioningToken.current.cancelled = true;
    //     const token = { cancelled: false };
    //     repositioningToken.current = token;

    //     Promise.resolve().then(() => {
    //       if (!token.cancelled) {
    //         setState(newState);
    //       }
    //     });
    //   }
  }, []);

  const props = {
    referenceProps: ({ ref }) => ({
      ref: mergeRefs(ref, triggerBoundsRef),
      ...clickAwayProps,
    }),
    floatingProps: ({ ref }) => ({
      ref: mergeRefs(ref, triggerBoundsRef),
      ...clickAwayProps,
    }),

    placement: state.layerplacement,

    renderLayer: (children) =>
      typeof document !== "undefined"
        ? createPortal(createElement(), getContainerElement(container))
        : null,
  };

  return props;
}

function didStateChange(previous, next) {
  if (previous.layerSide !== next.layerSide) {
    return true;
  }

  const styleProps = [
    "position",
    "top",
    "left",
    "right",
    "bottom"
  ];
  for (const prop of styleProps) {
    if (
      previous.styles.layer[prop] !== next.styles.layer[prop] ||
      previous.styles.arrow[prop] !== next.styles.arrow[prop]
    ) {
      return true;
    }
  }

  return false;
}

const DEFAULT_CONTAINER_ID = "root";

function getContainerElement(container) {
  let element

  if (typeof container === "function") {
    element = container();
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error(
        ` You've passed a function to the 'container' prop, but it returned no valid HTMLElement`
      );
    }
  } else if (container instanceof HTMLElement) {
    element = container;
  } else if (typeof container === "string") {
    element = document.getElementById(container);
    if (!element) {
      throw new Error(
        `  You've passed element with id '${container}' to the 'container' prop, but it returned no valid HTMLElement`
      );
    }
  } else {
    element = document.getElementById(DEFAULT_CONTAINER_ID);
    if (!element) {
      element = document.createElement("span");
      element.id = DEFAULT_CONTAINER_ID;
      element.style.cssText = `
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
      `;
      document.body.appendChild(element);
    }
  }

  return element;
}


