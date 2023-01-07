import { useState, forwardRef, useEffect, useRef,useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import { useWatch } from "react-hook-form";

const Input = forwardRef(
  (
    { name, className, label, error, control, onWatchChange,children, ...props },
    ref
  ) => {
    const watchedValue = useWatch({ name, control });

    
    const showIcon = watchedValue
      ? watchedValue.trim().length !== 0
      : !!watchedValue;


    const debounceFn = useMemo(()=>
      debounce((value) => {
        
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
        <div className="relative z-0 pt-[14px] w-full group flex justify-start items-center">
          <input
            type="text"
            name={name}
            id={name}
            className={`block py-[8px] px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary-teal ${
              error && `border-app-danger focus:border-app-danger`
            }  appearance-none dark:text-white dark:border-gray-600 dark:focus:text-primary-default focus:outline-none focus:ring-0 focus:text-primary-default peer`}
            placeholder=" "
            required
            ref={ref}
            {...props}
          />
          <label
            htmlFor={name}
            className={`absolute pointer-events-none text-sm text-primary-teal dark:text-gray-400 duration-300 transform -translate-y-0 scale-85 top-0 z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-teal   ${
              error && `text-app-danger peer-focus:text-app-danger`
            }  peer-placeholder-shown:text-gray-500  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-[22px] peer-focus:scale-85 peer-focus:-translate-y-[0px]`}
          >
            {label}
          </label>
          <div className="h-full flex justify-center absolute right-0 items-center">
            <span
              className={`w-[24px] h-[24px]    ${
                error ? "text-app-danger" : "text-primary-green"
              }  `}
            >
              <div className="w-full h-full flex justify-center items-center">
                <span className="text-inherit">
                  {children && showIcon && children}
                </span>
              </div>
            </span>
          </div>
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
