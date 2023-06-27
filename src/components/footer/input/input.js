import { forwardRef } from "react";
import Textarea from "react-textarea-autosize";
import { ReactComponent as Send } from "../../../assets/send.svg";

 const Input = forwardRef(
  ({ handleSubmit, className, handleKeyDown, value, handleChange, children }, ref) => {
    return (
      <div className={`flex flex-1 ${className ? className : ""} `}>
        <div className="flex-1 flex min-h-[20px] min-w-0 text-[15px] font-normal outline-none leading-[20px] will-change-[width] rounded-[8px] my-[5px] mx-[10px]  w-[inherit]">
          {children}
          <Textarea
            className="w-full min-h-[20px] min-w-0 text-[15px] font-normal outline-none leading-[20px] will-change-[width] rounded-[8px]  px-[12px] pt-[9px] pb-[11px] "
            placeholder="Type a Message"
            id="message"
            name="message"
            value={value}
            maxRows={3}
            ref={ref}
            onChange={handleChange}
            style={{
              resize: "none",
              border: 0,
              boxSizing: "border-box",
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="py-[5px] px-[10px] w-[37px] flex items-center justify-center min-h-[52px]">
          <button
            onClick={handleSubmit}
            className="flex-shrink-0 basis-auto flex-grow-0 text text-panel-header-icon"
          >
            <Send />
          </button>
        </div>
      </div>
    );
  }
);

export default Input;
