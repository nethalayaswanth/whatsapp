import { useState, forwardRef, useEffect, useRef,useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import { useWatch } from "react-hook-form";

const Input = forwardRef(
  (
    { name, className, label, error, control, onWatchChange,children, ...props },
    ref
  ) => {
    const watchedValue = useWatch({ name, control });

    

    // const debounceFn = useRef(
    //   debounce((value) => {console.log(value)
    //     onWatchChange?.(name, value);
    //   }, 300)
    // ).current;

    console.log(watchedValue)
    const showIcon = watchedValue
      ? watchedValue.trim().length !== 0
      : !!watchedValue;

    console.log(showIcon)

    const debounceFn = useMemo(()=>
      debounce((value) => {
        console.log(value);
        onWatchChange?.(name, value);
      }, 300)
    ,[name, onWatchChange]);

    useEffect(() => {
      debounceFn(watchedValue);
    }, [watchedValue, debounceFn]);

    return (
      <div
        className={`px-[30px] mb-[3px] outline-none   flex-shrink-0 flex-grow-0 bg-white basis-auto relative py-[10px] animate-land  ${className} `}
      >
        <div className="p-0 mb-[7px] xl:mb-[7px]">
          <div className="flex items-center">
            <span
              className={`align-left text-primary-teal  ${
                error && `text-app-danger`
              } font-normal text-[12px] leading-[12px] `}
            >
              {label}
            </span>
          </div>
        </div>
        <div
          className={`relative break-words flex items-center outline-none 
         
           ${
             error
               ? `border-b-[2px] border-app-danger`
               : `focus-within:border-b-[2px] focus-within:border-border-input-active`
           }
         `}
        >
          <div className="flex justify-start flex-1 relative z-[2]">
            <div className="p-0 cursor-text outline-none relative flex flex-1 overflow-hidden align-top">
              <input
                name={name}
                {...props}
                ref={ref}
                className="my-[8px] xl:my-[6px]  cursor-text align-middle border-none outline-none bg-transparent p-0 min-w-[5px] relative w-full min-h-[22px] text-[12px] leading-[12px] break-words whitespace-pre-wrap text-select text-primary-default  "
              />
            </div>
          </div>
          <span
            className={`w-[24px] h-[24px] relative ${
              error ? "text-app-danger" : "text-primary-green"
            }  `}
          >
            <button className="w-full h-full flex justify-center items-center">
              <span className="text-inherit">
                {children && showIcon && children}
              </span>
            </button>
          </span>
        </div>
        {error && (
          <p className="text-[10px] mt-[2px] leading-[10px] text-app-danger">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

export default Input;
