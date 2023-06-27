import { Children, cloneElement, memo, useLayoutEffect, useRef } from "react";
import { useLatest } from "../hooks/useLatest";

import { throttle } from "lodash";
import React from "react";
import useElementSize from "../hooks/useElementSize";
import "./styles.scss";

const bufferedItems = 2;

const InfiniteScroll = ({
  children,
  gap = 10,
  isVirtualizationEnabled = true,
}) => {
  const [containerRef, { height: containerHeight }] = useElementSize();
  const [scrollPosition, setScrollPosition] = React.useState(0);

  
  const visibleChildren = React.useMemo(() => {
    if (!isVirtualizationEnabled)
      return children.map((child, index) =>
        React.cloneElement(child, )
      );
    const startIndex = Math.max(
      Math.floor(scrollPosition / rowHeight) - bufferedItems,
      0
    );
    const endIndex = Math.min(
      Math.ceil((scrollPosition + containerHeight) / rowHeight - 1) +
        bufferedItems,
      children.length - 1
    );

    return children.slice(startIndex, endIndex + 1).map((child, index) =>
      React.cloneElement(child, {
        style: {
          position: "absolute",
          top: (startIndex + index) * rowHeight + index * gap,
          height: rowHeight,
          left: 0, 
          right: 0,
          lineHeight: `${rowHeight}px`,
        },
      })
    );
  }, [children, containerHeight, scrollPosition, gap, isVirtualizationEnabled]);

  const onScroll = React.useMemo(
    () =>
      throttle(
        function (e) {
          setScrollPosition(e.target.scrollTop);
        },
        50,
        { leading: false }
      ),
    []
  );

  return (
   
      {visibleChildren} 
    
  );
};

export default InfiniteScroll;
