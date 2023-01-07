

import { useLayoutEffect, useState } from "react";
import { ReactComponent as Arrow } from "../../assets/arrow.svg";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { ReactComponent as MenuIcon } from "../../assets/menu.svg";
import { useSidebar } from "../../contexts/sidebarContext";
import useCollapse from "../../hooks/useCollapse";
import useMedia from "../../hooks/useMedia";
import { HeaderItem } from "../header/Header";
import { useChatRoom } from "../../contexts/roomContext";

const ChatHeader = () => {


 const data  = useChatRoom();


const { newRoom, ...room } =data
    const [sideBar, sidebarDispatch] = useSidebar()

    const handleClick = () => {
      sidebarDispatch({ type: "set state", payload: { detailsOpened: true } });
    };

    // const handleClose = () => {
    //   dispatch({
    //     type: "set state",
    //     payload: { preview: false },
    //   });
    // };

  const device = useMedia({
    breakPoints: [740, 540, 420],
    breakPointValues: ["xl", "l", "sm"],
    defaultValue: "xs",
  });
  const mobile = device === "xs";

 const title=room?.name
 const typing= room?.typing 
 const dp=room?.dp?.previewUrl


  const { getCollapseProps } = useCollapse({
    // isExpanded: content,
  });


  return (
    <div className="header border-l z-[100] border-solid border-border-header justify-start">
      {mobile && (
        <div
          style={{
            ...(mobile && {
              transform: "translateX(-10px)",
            }),
          }}
          className={`flex items-center self-center  justify-center`}
        >
          <button
            className="m-0 p-0 outline-none border-0 cursor-pointer "
            // onClick={onClose}
          >
            <Arrow
              style={{
                ...(mobile && {
                  height: "24px",
                  width: "24px",
                }),
              }}
            />
          </button>
        </div>
      )}
      <button
        onClick={handleClick }
        className="flex justify-center items-center flex-1 flex-shrink-0 "
      >
        <div className="cursor-pointer pr-[15px]">
          <div
            style={{ ...(mobile && { height: "36px", width: "36px" }) }}
            className={`h-[40px] w-[40px] rounded-full relative overflow-hidden cursor-pointer`}
          >
            {dp ? <img src={dp} alt="" /> : <DefaultAvatar />}
          </div>
        </div>
        <div className="flex flex-col basis-auto  justify-center min-w-0 flex-grow">
          <div
            className={`flex items-center text-inherit leading-normal text-left `}
          >
            <div className="flex font-normal  text-left text-[17px] leading-[21px] flex-grow overflow-hidden break-words ">
              <span className="inline-block overflow-hidden text-ellipsis text-inherit whitespace-nowrap flex-grow relative ">
                {title}
              </span>
            </div>
          </div>

          <div
            {...getCollapseProps({
              style: {
                overflow: "hidden",
                display: "flex",
              },
            })}
            className="text-[13px] leading-[20px]  flex justify-start "
          >
            <div className="flex justify-start ">
              {/* <span className="animate-fade ">{content}</span> */}
            </div>
          </div>
        </div>
      </button>
      <div className="ml-[20px]">
        <HeaderItem>
          <MenuIcon />
        </HeaderItem>
      </div>
    </div>
  );
};

export default ChatHeader;
