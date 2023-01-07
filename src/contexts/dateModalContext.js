import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import throttle from "lodash/throttle";
import { useMemo } from "react";

const DateModalState = React.createContext();
const DateModalDispatch = React.createContext();

function DateModalProvider({ children, boundingElement=window, wait = 400 }) {
  const [date, setDate] = useState(null);
  const headerRefs = useRef({});

  const [isScrolling, setScrolling] = useState(false);

  const scrollRef = useRef(false);
  const timeoutRef = useRef();
  const currentDateRef = useRef();

  const handleScrollChange = useCallback(() => {
  
    if (scrollRef.current === false) {
      setScrolling(true);
      scrollRef.current = true;
       
    }

     if (timeoutRef.current) clearTimeout(timeoutRef.current);

     timeoutRef.current = setTimeout(() => {
       setScrolling(false);
       scrollRef.current = false;
     }, 1000);
  }, []);

  const getCurrentDate = useCallback(() => {
    let current, recent;

    const headers = Object.entries(headerRefs.current);


    const { top: rootTop } = boundingElement=== window ?0: boundingElement?.getBoundingClientRect();

    for (let i=0 ;i<headers.length;i++ ) {
      const  [date, node] = headers[i]
      const { top } = node.getBoundingClientRect();

      
      recent =i!==0? date:null;
      if (rootTop + 8 <= top) {
        break;
      }
       current = date;
    }

    
   
    
    if (!current) {
      setDate(recent);
      currentDateRef.current = current;
      return;
    }

    if (currentDateRef.current !== current) {
        
      currentDateRef.current = current;
      setDate(current);
    }
  }, [boundingElement]);

  const callBack = useCallback(() => {
    handleScrollChange();
    getCurrentDate();
  }, [getCurrentDate, handleScrollChange]);

  const throttlFn = useMemo(
    () => {
      return throttle((boundingEl) => callBack(boundingEl), wait);
    },
    [callBack, wait]
  );

  useEffect(() => {
   
  

    const handleScroll = () => {
      
      throttlFn();
    };

    boundingElement?.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    handleScroll();

    return () => {
      if (boundingElement) {
        boundingElement?.removeEventListener("scroll", handleScroll);
      }
    };
  }, [boundingElement, callBack, throttlFn, wait]);

  return (
    <DateModalState.Provider value={{ date, isScrolling }}>
      <DateModalDispatch.Provider value={headerRefs}>
        {children}
      </DateModalDispatch.Provider>
    </DateModalState.Provider>
  );
}

function useDateModalState() {
  const context = React.useContext(DateModalState);
  if (context === undefined) {
    throw new Error(
      "useDateModalState must be used within a DateModalProvider"
    );
  }
  return context;
}

function useDateModalDispatch() {
  const context = React.useContext(DateModalDispatch);
  if (context === undefined) {
    throw new Error(
      "useDateModalDispatch must be used within a DateModalProvider"
    );
  }
  return context;
}
export { DateModalProvider, useDateModalState, useDateModalDispatch };
