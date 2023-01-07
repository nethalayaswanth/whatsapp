import { useQueryClient } from "@tanstack/react-query";
import { forwardRef } from "react";
import { Suspense, useCallback, useState } from "react";
import { ReactComponent as Close } from "../../assets/closeThin.svg";
import { ReactComponent as Group } from "../../assets/group.svg";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { useAppState } from "../../contexts/appStateContext";
import { useSidebar } from "../../contexts/sidebarContext";
import {
  useExistingUsers,
  useOnlineUsers,
  useSearch,
  useUserById,
} from "../../queries.js/user";
import { createRoomId } from "../../utils";
import ChatView from "../ChatItem/view";
import DrawerHeader from "../header/drawer";
import ListOrderAnimation from "../listOrderAnimation";
import Spinner from "../spinner";

import { useUser } from "../../queries.js/useRequests";

 export const Search = ({query, setQuery }) => {
   return (
     <div className="h-[49px] px-[12px] bg-white  flex flex-none items-center z-[100] relative">
       <div className="flex-1 relative  ">
         <button className="h-[24px] w-[24px] absolute top-[5px] left-[12px] z-[100] ">
           <div className="absolute top-0 left-0 z-[100] h-full w-full flex  text-input-inactive">
             <span>
               <SearchIcon />
             </span>
           </div>
         </button>
         <div className="h-[35px] pl-[65px] pr-[32px] rounded-[8px] bg-panel flex  items-center  relative">
           <div className="flex-1 px-0 flex ">
             <input
               type="text"
               value={query}
               onChange={(event) => {
                 setQuery(event.target.value);
               }}
               placeholder="search user"
               className="h-[20px] px-[2px] flex-1 bg-inherit leading-[20px] text-ellipsis whitespace-nowrap outline-none text-input-inActive focus:text-primary-default text-[15px] align-top"
             ></input>
           </div>
         </div>
         <button
           onClick={() => {
             setQuery('');
           }}
           style={{
             transform: `scale(${query ? 1 : 0})`,
             opacity: query ? 1 : 0,
             transition: "transform 200ms ease-in,opacity 200ms ease-in",
             pointerEvents: query ? "auto" : "none",
           }}
           className="absolute right-[7px] top-[5px] z-[100] text-input-inactive"
         >
           <span>
             <Close />
           </span>
         </button>
       </div>
     </div>
   );
 };

 export const ChatItem = forwardRef(({ userId, handleClick ,last},ref) => {
   const { data: user } = useUserById({ userId });


   const title = user?.name;
   const details = user?.username;
   const dp = user?.dp?.previewUrl;
   return (
     <ChatView
       online={true}
       onClick={() => {
         handleClick(user);
       }}
       ref={ref}
       last={last}
       title={title}
       details={details}
       dp={dp}
     />
   );
 });

export const Discover = ({handleNewGroup, handleClick,newGroup }) => {

  const [query, setQuery] = useState();

  const queryEnabled= query && query.trim().length >=2

  const { data: onlineUsers } = useOnlineUsers({
    queryOptions: { suspense: true,enabled: !query },
  });


const existing=useExistingUsers()

console.log(existing)

  const { data: queryUsers } = useSearch(query, {
    enabled: !!queryEnabled ,
  });

  const data = queryEnabled ? queryUsers : onlineUsers;

   const queryClient = useQueryClient();


 
  return (
    <>
      <Search setQuery={setQuery} query={query} />
      <div className="flex-grow bg-white flex flex-col z-[1] relative scrollbar">
        {!(queryEnabled || newGroup) ? (
          <ChatView
            title={"New group"}
            className="border-b-[1px]"
            defaultIcon={
              <div className="rounded-full text-white h-full w-full flex justify-center items-center bg-primary-teal">
                <span className="text-[transparent]">
                  <Group />
                </span>
              </div>
            }
            onClick={handleNewGroup}
          />
        ) : null}
        {data && data.length !== 0 ? (
          <ListOrderAnimation>
            {data.map((userId, index) => {
              const last = data.length - 1 === index;
            
              return (
                <ChatItem
                  key={userId}
                  handleClick={handleClick}
                  userId={userId}
                  last={last}
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




export default function  NewChat(){

 const [sidebarState, sideBarDispatch] = useSidebar();

 const {dispatch} = useAppState();
 const { data: user } = useUser();


 const queryClient = useQueryClient();

 const handleNewGroup=useCallback(() => {
            sideBarDispatch({
              type: "set state",
              payload: {
                active: "new group",
                from: "new chat",
              },
            });
          },[sideBarDispatch])

 const handleRoom = useCallback(
   (preview) => {

 
     const roomId = createRoomId([preview.id, user.id]);
     
    

    dispatch({
      type: "set current room",
      payload: {
        ...preview,
        roomId: roomId,
        type: "private",
      },
    });
   },
   [dispatch, user.id]
 );


  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <DrawerHeader
          onClick={() => {
            sideBarDispatch({ type: "toggle" });
          }}
          name={"New Chat"}
        />
        <Suspense fallback={<Spinner />}>
          <Discover  handleNewGroup={handleNewGroup} handleClick={handleRoom} />
        </Suspense>
      </div>
    </span>
  );
}
