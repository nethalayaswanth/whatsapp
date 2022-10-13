import { useCallback, useLayoutEffect, useState } from "react";
import useWindowSize from "./useWindowSize";

const breakpointsDefault = [
 740,540,420
];

const defaultValues = ["desktop", "tablet", "tablet"];

const defaultvalue = "mobile";

function useMedia({
  breakPoints = breakpointsDefault,
  breakPointValues = defaultValues,
  defaultValue = defaultvalue,
} = {}) {


  const screen=useWindowSize()

  console.log(screen);

  const width=screen.width

  const getValue = useCallback((screen) => {
    
    const index = breakPoints.findIndex((point) => screen >= point);
    
    console.log(index)
    
    return typeof breakPointValues[index] !== "undefined"
      ? breakPointValues[index] 
      : defaultValue;
  },[breakPointValues,breakPoints, defaultValue]);

  const [value, setValue] = useState(getValue);

  useLayoutEffect(() => {
    setValue(getValue(width));
  }, [getValue, width]);

  return value;
}

export default useMedia;
