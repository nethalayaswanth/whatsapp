import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useLayoutEffect,
  cloneElement,
} from "react";
import useTransition from "../../hooks/useTransition";

export const noop = () => {};



export default function Disclosure({
  style: parentInitialStyles = {},
  onExpandStart = noop,
  onExpandEnd = noop,
  onCollapseStart = noop,
  onCollapseEnd = noop,
  isExpanded,
  defaultExpanded = false,
  hasDisabledAnimation = false,
  unMount = true,
  children = <div></div>,
  direction='left',
  duration,
  ...props
} = {}) {

  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: isExpanded,
    direction,
    duration,
  });

  return (
    <>
      {mount && (
        <div
          {...getParentProps({
            style: {
              ...parentInitialStyles,
              width: "100%",
              height: "100%",
              overflow: "hidden",
            },
          })}
        >
          <div
            {...getDisclosureProps()}
            className="bg-panel-header h-full w-full"
          >
           { children}
          </div>
        </div>
      )}
    </>
  );
}
