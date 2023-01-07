import { useCallback, useMemo } from "react";
import { useLayoutEffect, useState } from "react";

const breakpointsDefault = [
  `(min-width:740px)`,
  `(max-width:438px)`,
  `(min-width:439px)`,
];

const queryStrings = (breakpoints = []) =>
  breakpoints.map((breakPoint) => breakPoint);

const defaultValues = ["desktop", "tablet", "mobile"];

const defaultvalue = "mobile";

function useMedia({
  breakPoints = breakpointsDefault,
  breakPointValues = defaultValues,
  defaultValue = defaultvalue,
} = {}) {
  const mediaQueryLists = useMemo(
    () => breakPoints.map((q) => window.matchMedia(q)),
    [breakPoints]
  );

  const getValue = useCallback(() => {
    const index = mediaQueryLists.findIndex((mql) => mql.matches);

    return typeof breakPointValues[index] !== "undefined"
      ? breakPointValues[index]
      : defaultValue;
  }, [breakPointValues, defaultValue, mediaQueryLists]);
  const [value, setValue] = useState(getValue);

  useLayoutEffect(() => {
    const handler = () => {
      setValue(getValue);
    };

    mediaQueryLists.forEach((mql) => {
      mql.addEventListener("change", handler);
    });
    return () =>
      mediaQueryLists.forEach((mql) => {
        mql.removeEventListener("change", handler);
      });
  }, [getValue, mediaQueryLists]);
  return value;
}

export default useMedia;
 