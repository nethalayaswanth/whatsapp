import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { ReactComponent as Arrow } from "../../assets/arrow.svg";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Delete } from "../../assets/delete.svg";
import { ReactComponent as Next } from "../../assets/next.svg";
import { useChatRoom } from "../../contexts/roomContext";
import {  useSidebarDispatch, useSidebarState } from "../../contexts/sidebarContext";
import useMedia from "../../hooks/useMedia";
import useTransition from "../../hooks/useTransition";
import { useDocumentsOfRoom, useMediaOfRoom } from "../../queries.js/messages";
import { useUser } from "../../queries.js/user";
import Disclosure from "../Disclosure";
import DrawerHeader from "../header/drawer";
import TabNavigation from "../tabNavigation";
import Documents from "./documents";
import Dp from "./dp";
import Gallery from "./gallery";
import UserCard from "../listItem/userCard";
import Media from "./mediaDetails";
import { useAppDispatch } from "../../contexts/appStore";
import { useQueryClient } from "@tanstack/react-query";
import { createRoomId } from "../../utils";


export function Details() {
  const { newRoom, ...room } = useChatRoom();
  const { data: user } = useUser();
  const roomId = room?.roomId;
  const isGroup = room?.type === "group";
  const participants = room?.members?.length;

  const dispatch = useSidebarDispatch();
  const appDispatch=useAppDispatch()
  const queryClient=useQueryClient()

  

    const handleUserClick = useCallback(
      (payload) => {
        const user = queryClient.getQueryData(["user"]);

        const roomId = createRoomId([payload.id, user.id]);
        appDispatch({
          type: "set current room",
          payload: {
            roomId: roomId,
            member: payload.id,
            type: "private",
          },
        });
      },
      [appDispatch, queryClient]
    );
 
 const handleClose = useCallback(() => {
   dispatch({ type: "set state", payload: { detailsOpened: false } });
 }, [dispatch]);

  const device = useMedia({
    breakPoints: [740, 540, 420],
    breakPointValues: ["xl", "l", "sm"],
    defaultValue: "xs",
  });
  const mobile = device === "xs";

  return (
    <>
      <div className="flex flex-col bg-panel-header  h-full w-full  pointer-events-auto">
        <div className="header z-[1000] justify-start pr-[20px] pl-[25px] ">
          <div className="flex  justify-start">
            <div className="w-[56px] flex items-center">
              <button onClick={handleClose}>
                {mobile ? (
                  <Arrow
                    style={{
                      ...(mobile && {
                        height: "24px",
                        width: "24px",
                      }),
                    }}
                  />
                ) : (
                  <Close onClick={handleClose} />
                )}
              </button>
            </div>
            <div className="max-h-[46px] text-[16px] leading-normal flex-grow-1 ">
              <h1>Account Info</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-1 overflow-y-scroll flex-col  justify-start">
          <div className="p-[30px] pt-[28px] mb-[10px]  flex-shrink-0 flex-grow-0 bg-white  ">
            <div className="flex-none  flex flex-col animate-pop justify-center ">
              <Dp dp={room?.dp?.url} name={room?.name} />
              <div className="flex flex-col justify-start items-center ">
                <h2 className="text-[24px] px-[10px] pt-[4px] pb-[5px] font-normal align-center">
                  {room.name}
                </h2>
                <div className="mt-[4px] leading-[1.5] ">
                  <span className="text-[16px]">
                    {!isGroup ? (
                      `@${room.username}`
                    ) : (
                      <span className="text-[16px] text-regular text-text-secondary">{`Group · ${participants} Participants`}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-[30px] pt-[28px] mb-[10px] animate-land flex-shrink-0 flex-grow-0 bg-white  ">
            <div className="mb-[8px]">
              <span className="text-[14px] leading-normal text-text-secondary ">
                {isGroup ? "Description" : " About"}
              </span>
            </div>
            <div className="text-[16px] leading-[24px] pt-[0px] min-h-[32px] relative break-words">
              <div className="text-ellipses overflow-y-hidden white-space-preline flex-grow overflow-x-hidden relative">
                {room.about}
              </div>
            </div>
            <span></span>
          </div>
          <Media roomId={roomId} />
          {isGroup ? (
            <div className=" mb-[10px] animate-land flex-shrink-0 flex-grow-0 bg-white ">
              <div className={`w-ful mb-[8px] mt-[17px] px-[30px] `}>
                <div className="h-full cursor-pointer flex relative flex-row pointer-events ">
                  <div className="flex items-center ">
                    <div className=" flex-grow text-ellipsis whitespace-nowrap text-text-secondary text-[14px] leading-normal ">
                      {`${participants} participants`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                {room.members.map((userId, index) => {
                  const last = room.members.length - 1 === index;

                  return (
                    <UserCard
                      onClick={handleUserClick}
                      key={userId}
                      userId={userId}
                      last={last}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className=" mb-[10px] animate-land flex-shrink-0 flex-grow-0 bg-white  ">
            <div className="text-[16px] flex h-[54px] pl-[13px] flex-none items-center cursor-pointer leading-[24px] pt-[0px] min-h-[32px] relative break-words">
              <div className="flex justify-center flex-none w-[74px] text-primary-danger">
                <Delete />
              </div>
              <div className="flex flex-1 pr-[30px] items-center h-full  ">
                <div
                  className=" overflow-hidden
                  text-ellipses
                  overflow-y-hidden
                  white-space-preline
                  flex-grow
                  overflow-x-hidden"
                >
                  <span className="text-[16px] leading-[22px] text-regular text-primary-danger">
                    Delete chat
                  </span>
                </div>
              </div>
            </div>
          </div>
      
        </div>
      </div>
    </>
  );
}

export const DetailsPortal = ({ children }) => {
  const { detailsOpened } = useSidebarState();

  const drawerRoot = document.getElementById("drawer-right");

  return (
    <>
      {drawerRoot &&
        createPortal(
          <div className={`absolute z-[1002]  left-0 top-0 w-full h-full`}>
            <Disclosure isExpanded={detailsOpened}>{children}</Disclosure>
          </div>,
          drawerRoot
        )}
    </>
  );
};
