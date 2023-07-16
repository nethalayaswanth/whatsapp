import { forwardRef, useLayoutEffect, useState } from "react";
import useCollapse from "../../hooks/useCollapse";
import useHover from "../../hooks/useHover";
import { MessageActions } from "../Menu";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import HoverToolTip from "../tooltip/hoverToolTip";
import { useUserQuery, useUserById } from "../../queries.js/user";
import { Avatar } from "../Avatar";
import { mergeRefs } from "../../utils";

const UserCard = forwardRef(
  ({
    onClick,
    unread,
    time,
    className,
    userId,selected

  },forwardRef) => {

   const {data:user}= useUserQuery({userId})

   const title = user?.name;
   const details = user?.username;
   const dp = user?.dp?.previewUrl;
   const isOnline = user?.isOnline;
    return (
      <div
        ref={mergeRefs(forwardRef)}
        onClick={onClick}
        className={`w-full group   h-[68px]  bg-white hover:bg-panel-bg-hover ${
          className ? className : ""
        }`}
      >
        <div className="h-full cursor-pointer flex relative flex-row pointer-events  pl-[13px]">
          <div className="flex">
            <div className="flex items-center pl-[15px] pr-[13px]">
              <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                <Avatar src={dp} alt="" />
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

              {!isOnline && (
                <div
                  className={`ml-[6px] mt-[3px] text-[12px] text-ellipsis whitespace-nowrap overflow-hidden leading-[14px] flex-none ${
                    !unread ? `` : `text-unread-timestamp`
                  } max-w-full`}
                >
                  {time && time}
                </div>
              )}
              {isOnline && (
                <div className="ml-[2px] flex justify-center items-center align-top ">
                  <span
                    className={` h-[8px] w-[8px]  rounded-[4px] font-semibold text-center text-white bg-unread-timestamp   `}
                  ></span>
                </div>
              )}
            </div>
            <div className="font-normal flex items-center min-h-[20px] text-[13px] leading-[20px] text-secondary-stronger ">
              <div
                className={`${
                  !unread ? `font-regular` : `font-medium`
                } overflow-hidden text-[13px] leading-[20px] flex-grow text-ellipsis whitespace-nowrap text-left`}
              >
                {details && details}
              </div>
              <div className="flex-none flex justify-center items-center max-w-full text-[12px] text-bubble-icon leading-[20px]   font-semibold">
                {/* <HoverToolTip value={value}>
                  <MessageActions />
                </HoverToolTip> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);


export default UserCard;