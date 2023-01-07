import { Suspense, useCallback } from "react";
import { useSidebar } from "../../contexts/sidebarContext";
import {
  useOnlineUsers, useSearch
} from "../../queries.js/useRequests";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ReactComponent as Arrow } from "../../assets/arrow.svg";
import { ReactComponent as Close } from "../../assets/close.svg";
import ChatView from "../ChatItem/view";
import DrawerHeader from "../header/drawer";
import ListOrderAnimation from "../listOrderAnimation";
import { Search } from "../NewChat";
import Spinner from "../spinner";

const Selected=({name,dp,id,onClick })=>{


  return (
    <div className="inline">
      <div className="mr-[6px] text-primary-default bg-panel-bg-lighter mb-[6px] rounded-[16px] align-top inline-flex w-[100%-6px] ">
        <div className="flex">
          <div className="flex-none flex items-center rounded-full overflow-hidden justify-center mr-[8px]">
            <div className="h-[26px] w-[26px]">
              <img alt="" src={dp} />
            </div>
          </div>
          <div className="basis-auto flex-grow flex-col flex  justify-center mr-[8px]">
            <div className="flex items-center justify-center">
              <div className="text-[13.5px] font-normal flex flex-grow break-words overflow-hidden text-ellipsis">
                <div className="text-ellipses overflow-hidden whitespace-nowrap flex-grow">
                  {name}
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={onClick}
             className=" flex-auto text-text-secondary flex justify-center items-center
          ">
            <div className="flex items-center text-[13.5px] justify-center  m-[2px]  cursor-pointer rounded-full hover:bg-white ">
              <span>
                <Close width={16} height={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export const Discover = ({ handleNewGroup, handleClick,selected, newGroup }) => {
  const [query, setQuery] = useState();

  const queryEnabled = query && query.trim().length !== 0;

  const { data: onlineUsers } = useOnlineUsers({
    queryOptions: { suspense: true, enabled: !query },
  });

  const { data: queryUsers } = useSearch(query, {
    enabled: !!queryEnabled,
  });

  const data = queryEnabled ? queryUsers : onlineUsers;

  const queryClient = useQueryClient();

  return (
    <>
      <Search setQuery={setQuery} query={query} />
      <div className="flex-grow bg-white flex flex-col z-[1] relative scrollbar">
       
        {data && data.length !== 0 ? (
          <ListOrderAnimation>
            {data.map((userId, index) => {
              const last = data.length - 1 === index;
              const user = queryClient.getQueryData(["user", userId]);
              const title = user.name;
              const details = user.username;
              const dp = user.dp.previewUrl;
              const isSelected=selected.includes(userId)   
              
              return (
                <ChatView
                  online={user.isOnline}
                  onClick={() => {
                    handleClick(user);
                  }}
                  last={last}
                  title={title}
                  details={details}
                  dp={dp}
                  selected={isSelected}
                  tooltip={false}
                />
              );
            })}
          </ListOrderAnimation>
        ) : (
          <div className="flex flex-grow basis-0 flex-col overflow-y-auto relative">
            <div className="items-center flex-grow-0 flex-shrink-0 basis-auto px-[50px] py-[72px] text-center h-[1] text-input-inActive ">
              {queryEnabled
                ? `No results found for ${query}`
                : `No data to show`}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

  




const NewGroup = () => {
  const [sideBar, dispatch] = useSidebar();


  const isFromNewChat = sideBar.from === "new chat";

 
   const handleClick = useCallback(
     (user) => {
       dispatch({ type: "select", user });
     },
     [dispatch]
   );

   const selected = Object.keys(sideBar.selected);

   console.log(selected, sideBar.selected);

   

  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <DrawerHeader
          onClick={() => {
            dispatch(
              isFromNewChat
                ? {
                    type: "set state",
                    payload: {
                      active: "new chat",
                      from: "new group",
                    },
                  }
                : { type: "toggle" }
            );
          }}
          name={"New Group"}
        />
        <div className="flex-grow bg-white flex flex-col z-[1] relative scrollbar">
          {selected && selected.length !== 0 && (
            <div className="px-[27px] flex text-text-secondary  pt-[26px] pb-[12px]">
              <div className="flex-1   border-solid border-border-list pl-[2px] pb-[2px] pt-[6px]">
                <ul className="list-none">
                  {selected.map((userId, index) => {
                    const user = sideBar.selected[userId];
                    return (
                      <Selected
                        key={index}
                        id={user.id}
                        name={user.name}
                        dp={user.dp.previewUrl}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "deselect", id: user.id });
                        }}
                      />
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          <Suspense fallback={<Spinner />}>
            <Discover
              selected={selected}
              newGroup={true}
              handleClick={handleClick}
            />
          </Suspense>
        </div>
        {selected.length !== 0 && (
          <span className="pb-[40px] pt-[24px] flex flex-col justify-center items-center">
            <div
              onClick={() => {
                dispatch({
                  type: "set state",
                  payload: {
                    active: "create group",
                    from: "new group",
                  },
                });
              }}
              className="rounded-full cursor-pointer h-[46px] w-[46px] flex justify-center items-center bg-panel-header-coloured shadow-lg text-white"
            >
              <span>
                <Arrow style={{ transform: "rotateY(180deg)" }} />
              </span>
            </div>
          </span>
        )}
      </div>
    </span>
  );
};

export default NewGroup;
