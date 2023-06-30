import { useRef } from "react";
import { forwardRef } from "react";
import { useMessageDispatch } from "../../contexts/messageContext";




const Container = forwardRef(
  (
    {
      children,
      messageId,
      sameSender,
      tail,
      doc,
      containMedia,
      incoming,
      reply,
      text,
    },
    containerRef
  ) => {

    const wrapperRef=useRef()
    const dispatch=useMessageDispatch()
    const handleMouseEnter=()=>{

        dispatch({type:'set state',payload:{
            isHovering:true
        }})
    }

    const handleMouseLeave = () => {
      dispatch({
        type: "set state",
        payload: {
          isHovering: false,
        },
      });
    };
    return (
      <div
        ref={containerRef}
        id={messageId}
        className={`message  pl-[71px] pr-[57px]  ${
          sameSender || tail ? `mb-[2px] ` : "mb-[12px]"
        } ${tail ? `mt-[10px] ` : ""}   flex relative flex-col select-text`}
      >
        <div
          id="msg-container"
          ref={wrapperRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`  mb-0  max-w-[85%] relative flex-none text-[14.2px] leading-[19px] text-message-primary message ${
            doc ? "w-[336px]" : ""
          } ${reply ? "min-w-[180px]" : ""}  ${incoming ? "incoming" : ""} ${
            containMedia ? "image" : ""
          } ${text ? "text" : ""} `}
        >
          {children}
        </div>
      </div>
    );
  }
);


export default Container