
import { forwardRef, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDateModalDispatch } from "../../contexts/dateModalContext";



const DateHeader = forwardRef(({  date },ref) => {
 

  
const headers=useDateModalDispatch()



  return (
    <div
      ref={(node)=>{if(!node)return;headers.current[date] = node}}
      className="px-[6.5%] mb-[12px] first:mt-[8px] flex justify-center relative flex-row select-text"
    >
      <div className=" pt-[5px] pb-[6px] px-[12px] text-center  bg-white text-primary-default rounded-[7.5px] inline-block text-[12.5px] leading-[21px] shadow-sm  flex-none ">
        {date.toUpperCase()}
      </div>
    </div>
  );
});

export default DateHeader