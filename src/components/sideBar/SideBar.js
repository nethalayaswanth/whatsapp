import React, { useEffect, useMemo, useCallback } from "react";
import useSocket from "../../contexts/socketContext";
import Header from "../header/Header";
import ChatList from "../ChatList/ChatList";
import { useRooms, useUser } from "../../requests.js/useRequests";
import { useLayoutEffect } from "react";
import { useSidebar } from "../../contexts/sidebarContext";
import { useAppState } from "../../contexts/appStateContext";
import { getOtherUserFromRoomId } from "../../utils";
import { createRoomId } from "../../utils";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";

import { clearUnread, uploadTos3 } from "../../requests.js/api";
import { StrokeSpinner } from "../spinner";
const SideBar = () => {
  const { data: {user} } = useUser();

  const { state, dispatch } = useAppState();

  const [socket, socketConnected] = useSocket();

  const queryClient = useQueryClient();

  const { data: rooms } = useRooms({
    enabled: !!(socket && socketConnected),
    refetchOnMount: false,
  });

  const isMutating = useIsMutating();

  console.log(isMutating);

  const handleRoom = useCallback(
    async (preview) => {
      try {
        if (rooms && rooms[preview.id]) {
          dispatch({
            type: "set current room",
            payload: {
              ...preview,
            },
          });
        } else {
          dispatch({
            type: "new room",
            payload: {
              ...preview,
            },
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch, rooms]
  );

  const list = useMemo(() => {
    let list = [];
    if (rooms) {
      Object.entries(rooms).forEach(([id, item], index) => {
        const otherUserID = getOtherUserFromRoomId(item.roomId, user.id);
        if (!otherUserID) return;
        list.push({
          roomId: item.roomId,
          name: item.username,
          lastMessage: item.lastMessage,
          targetUserId: otherUserID,
          typing: item.typing,
          unread: item.unread,
        });
      });
      return list;
    }

    return null;
  }, [rooms, user.id]);

  useEffect(() => {
    queryClient.setMutationDefaults(["rooms", "messages"], {
      mutationFn: async ({ ...args }) => {
        await queryClient.cancelQueries(["messages", args.roomId]);
        return uploadTos3({ ...args });
      },
    });

    queryClient.resumePausedMutations();
  }, [queryClient]);

  useEffect(() => {
    if (!rooms || !socket) return;

    Object.keys(rooms).forEach((roomId) => {
      const otherUserID = getOtherUserFromRoomId(roomId, user.id);
      const room = rooms[roomId];
      if (!room.connected) {
        queryClient.setQueryData(["rooms"], (old) => ({
          ...old,
          [roomId]: { ...old[roomId], connected: true },
        }));

        queryClient.setQueryData(["user", otherUserID], (old) => ({
          ...(old && old),
          username: room.username,
          name: room.name,
          isOnline: room.isOnline,
          id: otherUserID,
        }));
        socket.emit("room.join", roomId, (r) => {
          console.log("room joined", r);
        });
      }
    });
  }, [queryClient, rooms, socket, user.id]);

  return (
    <>
      <div className="flex-col flex h-full ">
        <Header />
        <ChatList list={list} onClick={handleRoom} />
      </div>
    </>
  );
};
export default SideBar;
