import useWindowSize from "./useWindowSize";

const breakpointsDefault = [740, 540, 420];

const defaultValues = ["desktop", "tablet", "tablet"];

const defaultvalue = "mobile";

function useMedia({
  breakPoints = breakpointsDefault,
  breakPointValues = defaultValues,
  defaultValue = defaultvalue,
  width,
} = {}) {
  const [_, screen] = useWindowSize();
  //console.log(screen);

  const variable = width || screen.width;

  const getValue = (screen) => {
    const index = breakPoints.findIndex((point) => screen >= point);

    return typeof breakPointValues[index] !== "undefined"
      ? breakPointValues[index]
      : defaultValue;
  };

  return getValue(variable);
}

export default useMedia;
