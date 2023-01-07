import { useQueryClient } from "@tanstack/react-query";
import React, { memo, useCallback, useEffect, useRef } from "react";
import { useAppState } from "../../contexts/appStateContext";
import useSocket from "../../contexts/socketContext";
import { useUser } from "../../queries.js/useRequests";
import Header from "../header/Header";

import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useReorderedRooms, useRoomIds } from "../../queries.js/rooms";
import ChatItem from "../ChatItem";
import ListOrderAnimation from "../listOrderAnimation";
import MenuSideBar from "./MenuSidebar";

const SideBar = () => {

  const sideOverlayRoot = document.getElementById("side-overlay");
  const { data: user } = useUser();

  const { state, dispatch } = useAppState();

  const [socket, socketConnected] = useSocket();
  const queryClient = useQueryClient();

 
const {data:reOrderedRooms} =useReorderedRooms()



const {data:rooms}=useRoomIds()


  const handleRoom = useCallback(
    async (preview) => {

      console.log(preview, "preview");

      try {
          dispatch({
            type: "set current room",
            payload: {
              ...preview
            },
          });
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch]
  );


  useEffect(() => { 

    if (!rooms || rooms.length === 0 || !socket || !socketConnected) return;

    rooms.forEach((room) => {
        socket.emit("joinRoom", room, (r) => {
          console.log("joined", room);
         });  
    });


  }, [queryClient, rooms, rooms.length, socket, socketConnected, user.id]);


const chatList=useMemo(()=>{

if(reOrderedRooms && reOrderedRooms.length !== 0){

 return reOrderedRooms.map((roomId, index) => {
                return (
                  <ChatItem
                    onClick={handleRoom}
                    key={roomId}
                    roomId={roomId}
                  />
                )
 })
}
},[handleRoom, reOrderedRooms])



  return (
    <>
      <div className="flex-col flex h-full ">
        <Header user={user} />
        <div className="flex-grow bg-white flex  z-[1] relative scrollbar">
          <div className="relative flex-1 scrollbar">
            <ListOrderAnimation children={chatList} />
          </div>
          {sideOverlayRoot && createPortal(<MenuSideBar />, sideOverlayRoot)}
        </div>
      </div>
    </>
  );
};
export default memo(SideBar);
