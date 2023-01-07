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
  width
} = {}) {


  const screen=useWindowSize()
  
  const variable = width || screen.width;

  const getValue = useCallback((screen) => {
    
    const index = breakPoints.findIndex((point) => screen >= point);
     
    return typeof breakPointValues[index] !== "undefined"
      ? breakPointValues[index] 
      : defaultValue;
  },[breakPointValues,breakPoints, defaultValue]);

  const [value, setValue] = useState(getValue);

  useLayoutEffect(() => {
    setValue(getValue(variable));
  }, [getValue, variable]);

  return value; 
}

export default useMedia;
