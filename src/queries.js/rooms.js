import {
  QueriesObserver,
  useIsFetching,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import isEqual from "lodash/isEqual";
import { getRoomById, getRooms } from "./api";
// import { selectLastMessage } from "./messages";
import { useUserById } from "./user";

export const useRoomsQuery = ({ select, queryOptions }) => {
  const queryClient = useQueryClient();

  return useQuery(
    ["rooms"],
    async () => {
      //console.log(`%cfetching rooms`, "color:blue");
      const data = await getRooms();

      //console.log(`%cfetched rooms`, "color:green");
      //console.log(data);

      const rooms = {};
      data
        .filter((x) => !!x)
        .forEach((room) => {
          let users = [];
          if (
            room.members.length !== 0 &&
            typeof room.members[0] === "object"
          ) {
            room.members.forEach((user) => {
              users.push(user.id);
              queryClient.prefetchQuery(["user", user.id], () => ({
                ...user,
                nope: "abey",
              }));
            });
          } else {
            users = room.members;
          }

          queryClient.prefetchQuery(["room", room.roomId], () => ({
            ...room,
            members: users,
          }));
          rooms[room.roomId] = {
            roomId: room.roomId,
            type: room.type,
            pinned: room.pinned,
          };
        });
      return rooms;
    },
    {
      select,
      suspense: true,
      refetchOnWindowFocus: false,
      ...(queryOptions && queryOptions),
    }
  );
};

export const useRoomIds = ({ queryOptions } = {}) => {
  const select = useCallback((data) => {
    return Object.keys(data);
  }, []);

  return useRoomsQuery({ select, queryOptions });
};

export const selectLastMessage = (data) => {
  if (!data) return null;
  const ids = data.messages ? Object.keys(data.messages) : [];
  const lastMessageId = ids.length !== 0 ? ids[ids.length - 1] : null;
  const lastMessage = lastMessageId ? data.messages[lastMessageId] : null;

  if (lastMessage) {
    const { roomId, deliveredTime, sendTime, from } = lastMessage;
    return { roomId, deliveredTime, sendTime, from };
  }

  return null;
};

const getTime = (message, userId) => {
  return message.from === userId ? message.sendTime : message.deliveredTime;
};

const sort = (messages, userId) => {
  return messages
    ? messages
        .map((x) => x.data)
        .filter((x) => !!x)
        .sort((a, b) => getTime(b, userId) - getTime(a, userId))
        .map((message) => message.roomId)
        .filter((x) => !!x)
    : [];
};

export const useRoomsByLastMessage = ({ rooms, user }) => {
  const queryClient = useQueryClient();

  const queries = useMemo(
    () =>
      rooms.map((room, index) => {
        return {
          queryKey: [room, "messages"],
          select: selectLastMessage,
          enabled: false,
        };
      }),
    [rooms]
  );
  const [orderedByLastMessage, setRoomsByLastMessage] = useState(() => {
    const observer = new QueriesObserver(queryClient, [...queries]);
    const result = observer.getCurrentResult();

    return sort(result, user.id);
  });

  const prevState = useRef(orderedByLastMessage);

  const setResult = useCallback(
    (result) => {
      const temp = sort(result, user.id);

      if (!isEqual(prevState.current, temp)) {
        setRoomsByLastMessage(temp);
        prevState.current = temp;
      }
    },
    [user.id]
  );

  useEffect(() => {
    const observer = new QueriesObserver(queryClient, [...queries]);
    const result = observer.getCurrentResult();

    setResult(result);

    const unsubscribe = observer.subscribe((result) => {
      setResult(result);
    });

    return unsubscribe;
  }, [queries, queryClient, setResult]);

  return orderedByLastMessage;
};

export const useReorderedRooms = ({ rooms, user, queryOptions } = {}) => {
  const roomsOrderedByLastMessage = useRoomsByLastMessage({ rooms, user });

  const select = useCallback((data) => {
    const pinnedRoomIds = Object.values(data)
      .filter((x) => !!x && x.pinned)
      .sort((a, b) => b.pinned - a.pinned)
      .map((room) => room.roomId);

    return pinnedRoomIds;
  }, []);

  const { data: pinnedRooms } = useRoomsQuery({ select, queryOptions });

  const reOrderedRooms = useMemo(() => {
    const temp = new Set([
      ...pinnedRooms,
      ...roomsOrderedByLastMessage,
      ...rooms,
    ]);
    return [...temp];
  }, [roomsOrderedByLastMessage, pinnedRooms, rooms]);

  return reOrderedRooms;
};

export const useRoomQuery = ({ roomId, select, queryOptions }) => {
  const queryClient = useQueryClient();
  return useQuery(
    ["room", roomId],
    async () => {
      const room = await getRoomById(roomId);
      if (!room) return null;
      let members = [];
      if (room.members.length !== 0 && typeof room.members[0] === "object") {
        room.members.forEach((user) => {
          members.push(user.id);
          queryClient.prefetchQuery(["user", user.id], () => ({
            ...user,
          }));
        });
      } else {
        members = room.members;
      }

      return { ...room, members };
    },
    {
      select,
      suspense: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      ...(queryOptions && queryOptions),
    }
  );
};
const selectRoomData = (data) => {
  if (data) {
    const { notification, ...room } = data;
    return room;
  }
};

export const useRoom = ({ roomId, type, member, queryOptions }) => {
  const queryClient = useQueryClient();

  const isFetchingRooms = useIsFetching({ queryKey: ["rooms"] });

  const { data: room } = useRoomQuery({
    roomId,
    select: selectRoomData,
    queryOptions: {
      staleTime: 100000,
      onerror: (e) => {
        //console.log(e);
      },
      ...queryOptions,
    },
  });

  const rooms = queryClient.getQueryData(["rooms"]);
  const roomMeta = rooms ? rooms[roomId] : null;
  const roomType = roomMeta?.type ?? type;

  const isPrivate = roomType === "private";

  const [otherUserId] = isPrivate ? room?.members : [member];

  const { data: otherUser } = useUserById({
    userId: otherUserId,
    queryOptions: { enabled: !!otherUserId, staleTime: 10000 },
  });

  return {
    ...(room && room),
    newRoom: !room,
    isPrivate,
    ...(otherUser && otherUser),
  };
};

export const useRoomNotification = ({ roomId, queryOptions }) => {
  const select = useCallback((data) => {
    return data?.notification;
  }, []);
  const isFetchingRooms = useIsFetching({ queryKey: ["rooms"] });

  return useRoomQuery({
    roomId,
    select,
    queryOptions: {
      ...queryOptions,
      staleTime: 10000,
      enabled: !isFetchingRooms,
      onerror: (e) => {
        //console.log(e);
      },
    },
  });
};

export const useTypingNotification = ({ roomId, queryOptions }) => {
  const select = useCallback((data) => {
    return data?.notification;
  }, []);
  const isFetchingRooms = useIsFetching({ queryKey: ["rooms"] });

  return useRoomQuery({
    roomId,
    select,
    queryOptions: {
      ...queryOptions,
      staleTime: 10000,
      enabled: !isFetchingRooms,
      onerror: (e) => {
        //console.log(e);
      },
    },
  });
};
