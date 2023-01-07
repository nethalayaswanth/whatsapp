import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { formatDate } from "../utils";

import {
  aboutUpdate,
  anotherAccount,
  clearUnread,
  createGroup,
  dpUpdate,
  getDocuments,
  getMedia,
  getMessages,
  getOnlineUsers,
  getRoomById,
  getRooms,
  getUser,
  getUserById,
  login,
  nameUpdate,
  pinRoom,
  search,
  signUp,
} from "./api";
import { useUserById } from "./user";
import { useUser } from "./useRequests";



export const useRoomsQuery = ({ select, queryOptions }) => {

    const queryClient =useQueryClient()
    
  return useQuery(
    ["rooms"],
    async () => {
      const data = await getRooms();
      const rooms = {};

      data
        .filter((x) => !!x)
        .forEach((room) => {
            let users=[]
             if (
            room.members.length !== 0 &&
            typeof room.members[0] === "object"
          ) {
            room.members.forEach((user) => {
              users.push(user.id);
              queryClient.prefetchQuery(["user", user.id], () => ({
                ...user,
              }));
            })}else{
                users= room.members
            }
            rooms[room.roomId]={
                ...room,members:users
            }       
         })
        return rooms
    },
    {
        select,
      ...(queryOptions && queryOptions),
      suspense: true,
      refetchOnWindowFocus: false,
    }
  );
};

export const useReorderedRooms = ({queryOptions } = {}) => {
  

  const select = useCallback((data) => {

    
    const nonPinnedRooms = {};
    const pinnedRooms = {};
    Object.entries(data)
      .filter((x) => !!x)
      .forEach(([roomId, room]) => {
        const pinned = room.pinned;
        const lastMessagetime =
          room.lastMessage?.deliveredTime ||
          room.lastMessage?.sendTime ||
          room.roomId;

        if (pinned) {
          pinnedRooms[pinned] = roomId;
        } else {
          nonPinnedRooms[lastMessagetime] = roomId;
        }
      });

    const pinnedRoomIds = [...Object.keys(pinnedRooms)]
      .sort((a, b) => b - a)
      .map((key) => pinnedRooms[key]);
    const nonPinnedRoomIds = [...Object.keys(nonPinnedRooms)]
      .sort((a, b) => b - a)
      .map((key) => nonPinnedRooms[key]);

    return [...pinnedRoomIds, ...nonPinnedRoomIds];
  }, []);

  return useRoomsQuery({ select, queryOptions });
};


export const useRoomIds = ({ queryOptions }={}) => {
  const select = useCallback((data) => {

return Object.keys(data)
  }, []);

  return useRoomsQuery({ select, queryOptions });
};


export const useRoom = ({ roomMeta, queryOptions }) => {

const {roomId,id:userId,type}=roomMeta
  const select = useCallback(
    (data) => {
      return data[roomId];
    },
    [roomId]
  );
  
 

  const { data: room } = useRoomsQuery({ select, queryOptions });

  const roomType = type || room.type;
  const isPrivate = roomType === "private"; 
  const members= room?.members  

  const targetUserId =  isPrivate? userId ?userId:members[0]:null

  const { data: otherUser } = useUserById({
    userId: targetUserId,
    queryOptions: { enabled: !!targetUserId },
  });

  return { ...roomMeta,...(room && room), newRoom: !room, ...(otherUser && otherUser) }
    
};



