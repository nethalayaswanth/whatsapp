import { useRef, Children, useLayoutEffect } from "react";
import { ErrorBoundary } from "./errorBoundary";

export const calculateBoundingBoxes = (children) => {
  const boundingBoxes = {};
  children.forEach(([key, child]) => {
    const domNode = child;
    if (!domNode) return;
    const nodeBoundingBox = domNode.getBoundingClientRect();
    boundingBoxes[key] = nodeBoundingBox;
  });

  return boundingBoxes;
};

const ListOrderAnimation = ({ children, order, getKey=()=>{} }) => {
  const list = Children.toArray(children);
  const mountRef = useRef(false);
  const animating = useRef(false);
  const boxRefs = useRef({});
  const prevBoundingBoxes = useRef({});

  const refCb = (key) => (node) => {
    boxRefs.current[key] = node;
  };

  boxRefs.current = {};

  useLayoutEffect(() => {
    const app = document.getElementById("app");
    app.onanimationend = () => {
      const newBoundingBox = calculateBoundingBoxes(
        Object.entries(boxRefs.current)
      );
      prevBoundingBoxes.current = newBoundingBox;
    };
  }, []);

  useLayoutEffect(() => {

    console.log(boxRefs.current);
    if (Object.keys(boxRefs.current).length === 0) return;

    const newBoundingBox = calculateBoundingBoxes(
      Object.entries(boxRefs.current)
    );

    if (!mountRef.current) {
      mountRef.current = true;
      return;
    }

    const prevBoundingBox = prevBoundingBoxes.current;
    prevBoundingBoxes.current = newBoundingBox;

    if (animating.current) {
      return;
    }
  

    Object.entries(boxRefs.current).forEach(([key, child], index) => {
      const domNode = child;

      const prevBox = prevBoundingBox[key];
      const currentBox = newBoundingBox[key];

      if (!prevBox) {
        requestAnimationFrame(() => {
          domNode.style.height = `0px`;
          domNode.style.transition = "transform height 0s";

          requestAnimationFrame(() => {
            domNode.style.height = `${currentBox.height}px`;
            domNode.style.transition = "transform height 300ms";
            if (index === Object.keys(boxRefs.current).length - 1) {
              domNode.onTransitionEnd = () => {
                animating.current = false;
              };
            }
          });
        });
        return;
      }
      
      const changeInY = prevBox.top - currentBox.top;
      const changeInX = prevBox.left - currentBox.left;

      if (changeInY) {
        requestAnimationFrame(() => {
          domNode.style.transform = `translateY(${changeInY}px)`;
          domNode.style.transition = "transform 0s";

          requestAnimationFrame(() => {
            domNode.style.transform = "";
            domNode.style.transition = "transform 300ms";
            if (index === Object.keys(boxRefs.current).length - 1) {
              domNode.onTransitionEnd = () => {
                animating.current = false;
              };
            }
          });
        });
      }
    });
  }, [order]);

  
  return (
    <>
      {list.map((child, index) => {
        return (
          <div
            id={getKey(child, index)}
            key={getKey(child, index)}
            ref={refCb(getKey(child, index))}
          >
            {child}
          </div>
        );
      })}
    </>
  );
};

const List = (props) => {
  return (
    <ErrorBoundary>
      <ListOrderAnimation {...props} />
    </ErrorBoundary>
  );
};

export default List;
