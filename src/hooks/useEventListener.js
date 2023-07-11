import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";
import { useLatest } from "./useLatest";

function useEventListener({
  name,
  handler = (e) => null,
  element,
  runOnMount = true,
} = {}) {
  const savedHandler = useLatest(handler);

  const savedElement = useLatest(element);

  useIsomorphicLayoutEffect(() => {
    const el =
      typeof savedElement?.current === "function"
        ? savedElement?.current()
        : savedElement?.current;
    const targetElement = el || window;

    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    const eventListener = (event) => {
      //console.log(event)
      savedHandler.current(event);
    };
    if (runOnMount) {
      eventListener({ target: targetElement });
    }
    //console.log(targetElement,name)
    targetElement.addEventListener(name, eventListener);

    return () => {
      targetElement.removeEventListener(name, eventListener);
    };
  }, [name, savedElement, runOnMount, savedHandler]);
}

export default useEventListener;
