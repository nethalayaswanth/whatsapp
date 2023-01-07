
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDateModalState } from "../../contexts/dateModalContext";
import useDisclosure from "../../hooks/useDisclosure";
import { useScrollPosition } from "../../hooks/useScrollPosition";


const DateModal = () => {
 
const { isScrolling,date} = useDateModalState();

 console.log(isScrolling)

  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: !!isScrolling,
    direction: "top",
    easing: "ease-in-out",
    duration: 50,
  });



  return (
    <>
      {date && mount && (
        <span className="fixed z-[100] w-full">
          <div
            {...getParentProps({
              style: {
                position: "absolute",
                zIndex: 100,
                paddingTop: "8px",
                paddingRight: "6px",
                width: "100%",
              },
            })}
          >
            <div
              {...getDisclosureProps()}
              className="px-[6.5%] mb-[12px]  flex justify-center relative flex-row select-text"
            >
              <div className=" pt-[5px] pb-[6px] px-[12px] text-center  bg-white text-primary-default rounded-[7.5px] inline-block text-[12.5px] leading-[21px] shadow-sm  flex-none ">
                {date.toUpperCase()}
              </div>
            </div>
          </div>
        </span>
      )}
    </>
  );
};


export default DateModal; 