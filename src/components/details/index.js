import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ReactComponent as Arrow } from "../../assets/arrow.svg";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Delete } from "../../assets/delete.svg";
import { ReactComponent as Next } from "../../assets/next.svg";
import { useSidebar } from "../../contexts/sidebarContext";
import useMedia from "../../hooks/useMedia";
import useTransition from "../../hooks/useTransition";
import { useMediaOfRoom, useDocumentsOfRoom } from "../../queries.js/messages";
import Disclosure from "../Disclosure";
import DrawerHeader from "../header/drawer";
import TabNavigation from "../tabNavigation";
import Documents from "./documents";
import Gallery from "./gallery";
import UserCard from "./userCard";
import { useChatRoom } from "../../contexts/roomContext";
import Dp from "./dp";

export function Details() {


  const { newRoom, ...room } = useChatRoom();
  const roomId = room?.roomId;
  const isGroup=room?.type==='group'
  const participants=room?.members?.length
   
  const [openDrawer, setDrawer] = useState(false);
  const [sideBar, dispatch] = useSidebar();

  const handleClose = useCallback(() => {
    dispatch({ type: "set state", payload: { detailsOpened: false } });
  }, [dispatch]);
  const handleDrawerToggle = () => {
    setDrawer(true);
  };

  const { data: media } = useMediaOfRoom({ roomId });



  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: openDrawer,
    direction: "right",
  });

  const { data: documents } = useDocumentsOfRoom([roomId], {
    enabled: !!mount,
  });

   const queryClient = useQueryClient();


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
          <div className="p-[30px] pt-[28px] mb-[10px] animate-land flex-shrink-0 flex-grow-0 bg-white  ">
            <div
              className="mb-[8px] flex items-center text-text-secondary cursor-pointer p-0"
              onClick={handleDrawerToggle}
            >
              <span className="text-[14px] flex-1 leading-normal  ">
                Media and Docs
              </span>
              <div className="flex-none ml-[10px] flex items-center">
                <div>
                  <Next />
                </div>
              </div>
            </div>
            <div className="flex flex-grow flex-wrap justify-center  pt-[6px]  overflow-y-scroll">
              <Gallery roomId={roomId} media={media} />
            </div>
          </div>
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
                {/* {room.members.map((userId, index) => {
                  const last = room.members.length - 1 === index;
                  const user = queryClient.getQueryData(["user", userId]);
                  const title = user?.name;
                  const details = user?.username;
                  const dp = user?.dp?.preview;
                  const isOnline = user.isOnline;
                  return (
                    <UserCard
                      online={isOnline}
                      // onClick={() => {
                      //   handleClick(user);
                      // }}
                      key={userId}
                      last={last}
                      title={title}
                      details={details}
                      dp={dp}
                    />
                  );
                })} */}
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

          {mount && (
            <div className="absolute z-[1002]  left-0 top-0 w-full h-full">
              <div
                {...getParentProps({
                  style: {
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  },
                })}
              >
                <div
                  {...getDisclosureProps()}
                  className="bg-panel-header h-full w-full"
                >
                  <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
                    <DrawerHeader
                      style={{ height: "59px" }}
                      className={"h-[59px] "}
                      onClick={() => {
                        setDrawer(false);
                      }}
                      name={" "}
                    />

                    <TabNavigation
                      className="text-white border-0  bg-panel-header-coloured"
                      activeBar="#25d366"
                      activetext="white"
                    >
                      <div className="w-full  flex flex-col">
                        <div className="flex flex-grow flex-wrap justify-center  p-[30px] pr-[20px] overflow-y-scroll">
                          <Gallery roomId={roomId} media={media} />
                        </div>
                      </div>

                      <Documents documents={documents}></Documents>
                    </TabNavigation>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const DetailsPortal = ({ children }) => {
  const [sideBar, sidebarDispatch] = useSidebar();

  const detailsOpened = sideBar.detailsOpened;


  const drawerRoot = document.getElementById("drawer-right");

  return (
    <>
      {drawerRoot && createPortal(
        <div className={`absolute z-[1002]  left-0 top-0 w-full h-full`}>
          <Disclosure isExpanded={detailsOpened}>{children}</Disclosure>
        </div>,
        drawerRoot
      )}
    </>
  );
};