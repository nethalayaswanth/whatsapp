import { useQueryClient } from "@tanstack/react-query";
import React, { memo, useEffect } from "react";
import useSocket from "../../contexts/socketContext";
import { useUser } from "../../queries.js/useRequests";
import Header from "../header/Header";

import { createPortal } from "react-dom";
import { useRoomIds } from "../../queries.js/rooms";
import ChatList from "../ChatList";
import MenuSideBar from "./MenuSidebar";

const SideBar = () => {
  const sideOverlayRoot = document.getElementById("side-overlay");
  const { data: user } = useUser();

  const [socket, socketConnected] = useSocket();
  const queryClient = useQueryClient();

  const { data: rooms } = useRoomIds();

  useEffect(() => {
    if (!rooms || rooms.length === 0 || !socket || !socketConnected) return;

    socket.emit("joinRooms", rooms, (r) => {
      console.log("joined", r);
    });
  }, [queryClient, rooms, rooms.length, socket, socketConnected]);

  return (
    <>
      <div className="flex-col flex h-full ">
        <Header user={user} />
        <ChatList rooms={rooms} user={user} />
        {sideOverlayRoot && createPortal(<MenuSideBar />, sideOverlayRoot)}
      </div>
    </>
  );
};
export default memo(SideBar);
