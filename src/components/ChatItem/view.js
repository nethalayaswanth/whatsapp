import { forwardRef, useLayoutEffect,useRef, useMemo, useState } from "react";
import useCollapse from "../../hooks/useCollapse";
import useHover from "../../hooks/useHover";
import { MessageActions } from "../Menu";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { ReactComponent as Pin } from "../../assets/pin.svg";
import { ReactComponent as Down } from "../../assets/down.svg";

import { MenuContainer } from "../Menu";
import { callAll } from "../../utils";
import ToolTip from "../tooltip";



const ChatView = forwardRef(({ onClick,selected,showToolTip, dp,online,pinned,defaultIcon, unread,typing,handleActions, title,details, time,className,tooltip=true },ref) => {
 

  const actions=useMemo(()=>([pinned?'unpin':'pin','clear chat','delete chat']),[pinned])
    
 

 const { Toggle, getCollapseProps } = useCollapse({
   collapseWidth: true,
  
 });


   useLayoutEffect(() => {
     Toggle(showToolTip);
   }, [Toggle, showToolTip]);

const imageRef=useRef()

 useLayoutEffect(()=>{

  const img = imageRef.current;

  if(!img) return
requestAnimationFrame(() => {
 
   img.style.opacity = 0.2;
   img.style.transition ="";

  
   requestAnimationFrame(()=>{
       
    img.style.opacity = 1;
    img.style.transition = "opacity 1000ms ease";
  })
});
 },[dp])
 
 
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`w-full group   h-[72px]  first:border-t-[1px]
             border-solid border-border-list last:border-b-[1px]  ${
               className ? className : ""
             }  ${
        selected ? `bg-panel-header` : `bg-white hover:bg-panel-bg-hover`
      }`}
    >
      <div className="h-full cursor-pointer flex relative flex-row pointer-events ">
        <div className="flex">
          <div className="flex items-center pl-[15px] pr-[13px]">
            <div className="h-[49px] w-[49px] overflow-hidden rounded-full">
              {dp ? (
                <img ref={imageRef} src={dp} alt="" />
              ) : defaultIcon ? (
                defaultIcon
              ) : (
                <DefaultAvatar />
              )}
            </div>
          </div>
        </div>
        <div
          className={`pr-[15px] border-b-[1px] group-last:border-b-[0px]
          
             border-solid border-border-list flex flex-col basis-auto  justify-center min-w-0 flex-grow `}
        >
          <div className="flex items-center leading-normal text-left ">
            <div
              className={`flex leading-normal ${
                !unread ? `font-regular` : `font-medium`
              } text-left text-[17px] text-primary-strongest flex-grow overflow-hidden break-words`}
            >
              <span className="inline-block overflow-hidden text-ellipsis whitespace-nowrap flex-grow relative ">
                {title}
              </span>
            </div>

            {!online && (
              <div
                className={`ml-[6px] mt-[3px] text-[12px] text-ellipsis whitespace-nowrap overflow-hidden leading-[14px] flex-none ${
                  !unread ? `` : `text-unread-timestamp`
                } max-w-full`}
              >
                {time && time}
              </div>
            )}
            {online && (
              <div className="ml-[2px] flex justify-center items-center align-top ">
                <span
                  className={` h-[8px] w-[8px]  rounded-[4px] font-semibold text-center text-white bg-unread-timestamp   `}
                >
                  {unread}
                </span>
              </div>
            )}
          </div>
          <div className="font-normal flex items-center min-h-[20px] text-[13px] leading-[20px] text-secondary-stronger ">
            <div
              className={`${
                !unread ? `font-regular` : `font-medium`
              } overflow-hidden text-[13px] leading-[20px] flex-grow text-ellipsis whitespace-nowrap text-left ${
                typing ? `text-unread-timestamp  font-medium ` : ``
              }`}
            >
              {typing ? typing : details ? details : null}
            </div>
            <div className="flex-none flex justify-center ml-[6px] items-center max-w-full text-[12px] text-bubble-icon leading-[20px]   font-semibold">
              {pinned && (
                <span>
                  <div className="mr-[0px] inline-block align-top ">
                    <span>
                      <Pin />
                    </span>
                  </div>
                </span>
              )}
              {unread !== 0 && unread && (
                <span>
                  <div className="mr-[0px] inline-block align-top ">
                    <span
                      className={`px-[0.4em] pt-[0.3em] inline-block pb-[0.4em] text-[0.75rem] leading-[1] min-h-[1em] min-w-[1.7em] rounded-[1.1em] font-semibold text-center text-white bg-unread-timestamp   `}
                    >
                      {unread}
                    </span>
                  </div>
                </span>
              )}
              {tooltip && (
                <ToolTip
                  Button={
                    <div
                      {...getCollapseProps({
                        style: {
                          width: "100%",
                          height: "100%",

                          overflow: "hidden",
                          position: "relative",
                          right: 0,
                        },
                      })}
                    >
                      <Down />
                    </div>
                  }
                >
                  {({ closeToolTip }) => (
                    <MenuContainer
                      items={actions}
                      onClick={callAll(handleActions, closeToolTip)}
                    />
                  )}
                </ToolTip>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatView;
