import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

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

export const useUser = (queryOptions) => {
  return useQuery(["user"], getUser, {
    ...(queryOptions && queryOptions),
    suspense: true,
  });
};

export const useLogin = ({
  mutationOptions: { onSuccess, ...options },
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => login(data), {
    ...(options && options),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        ...data,
      }));
      onSuccess?.(data);
    },
  });
};

export const useAnotherAccount = ({ mutationOptions } = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => anotherAccount(data), {
    ...(mutationOptions && mutationOptions),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        ...data,
      }));
      mutationOptions?.onSuccess?.(data);
    },
  });
};

export const useSignUp = ({
  mutationOptions: { onSuccess, ...options },
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => signUp(data), {
    ...(options && options),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        ...data,
      }));
      onSuccess?.(data);
    },
  });
};

export const useNameUpdate = ({ onSuccess = () => {} } = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => nameUpdate(data), {
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        ...data,
      }));
      onSuccess?.(data);
    },
  });
};

export const useAboutUpdate = ({ onSuccess = () => {} } = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => aboutUpdate(data), {
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        ...data,
      }));
      onSuccess?.(data);
    },
  });
};

export const usePin = ({ ...mutationOptions } = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => pinRoom(data), {
    ...mutationOptions,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["rooms"], (old) => ({
        ...old,
        [data.roomId]: { ...old[data.roomId], pinned: data.pinned },
      }));
      queryClient.setQueryData(["room", data.roomId], (old) => ({
        ...old,
        pinned: data.pinned,
      }));
    },
  });
};
export const useCreateGroup = ({ onSuccess = () => {} } = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => createGroup(data), {
    onSuccess: (data, variables) => {
      // queryClient.setQueryData(["user"], (old) => ({
      //   ...old,
      //   ...data,
      // }));
      // onSuccess?.(data);
    },
  });
};

export const useClearUnread = (mutateOptions) => {
  const queryClient = useQueryClient();

  return useMutation((roomId) => clearUnread(roomId), {
    onSuccess: (data, roomId) => {
      queryClient.setQueryData(["rooms"], (old) => ({
        ...old,
        [roomId]: {
          ...old[roomId],
          unread: 0,
        },
      }));
      mutateOptions?.onSuccess?.(data);
    },
    ...(mutateOptions && mutateOptions),
  });
};

export const useDpUpdate = (mutateOptions) => {
  const queryClient = useQueryClient();

  return useMutation((data) => dpUpdate(data), {
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        ...data,
      }));
      mutateOptions?.onSuccess?.(data);
    },
    ...(mutateOptions && mutateOptions),
  });
};

export const useSearch = (queryKey, queryOptions) => {
  const queryClient = useQueryClient();
  return useQuery(
    ["search", queryKey],
    async () => {
      const data = await search(queryKey);

      if (data.length === 0) return [];

      const users = data.map((user) => {
        queryClient.setQueryData(["user", user.id], (old) => ({
          ...(old && old),
          ...user,
        }));

        return user.id;
      });
      return users;
    },
    {
      ...(queryOptions && queryOptions),
    }
  );
};

export const useOnlineUsers = ({ queryOptions } = {}) => {
  const queryClient = useQueryClient();
  return useQuery(
    ["onlineUsers"],
    async () => {
      const data = await getOnlineUsers();

      console.log(data, "online");
      const users = data.map((user) => {
        queryClient.setQueryData(["user", user.id], (old) => ({
          ...(old && old),
          ...user,
        }));

        return user.id;
      });
      return users;
    },
    {
      ...(queryOptions && queryOptions),
    }
  );
};

const getRoom = async ({ roomId, queryClient }) => {
  const data = await getRoomById({ id: roomId });
  const { members, ...room } = data;

  const prev = queryClient.getQueryData(["room", room.roomId]);

  if (members.length !== 0 && typeof members[0] === "object") {
    let users = [];
    members.forEach((user) => {
      users.push(user.id);
      queryClient.setQueryData(["user", user.id], (old) => ({
        ...(old && old),
        ...user,
      }));
    });
    return { ...prev, ...room, members: users };
  }
  return { ...prev, ...data };
};

export const useRooms = ({ onSuccess = () => {}, ...options } = {}) => {
  const queryClient = useQueryClient();

  const { data: rooms } = useQuery(
    ["rooms"],
    async () => {
      const data = await getRooms();

      // console.log(data, "%cfetching rooms", "color:blue");

      const rooms = {};

      data
        .filter((x) => !!x)
        .forEach((room) => {
          const pinned = room.pinned;
          const lastMessagetime =
            room.lastMessage?.deliveredTime ||
            room.lastMessage?.sendTime ||
            room.id;
          rooms[room.id] = {
            roomId: room.id,
            pinned,
            lastMessagetime,
          };
        });
      // data
      //   .filter((x) => !!x)
      //   .forEach((room) => {
      //     let users = [];
      //     if (
      //       room.members.length !== 0 &&
      //       typeof room.members[0] === "object"
      //     ) {
      //       room.members.forEach((user) => {
      //         users.push(user.id);
      //         queryClient.prefetchQuery(["user", user.id], () => ({
      //           ...user,
      //         }),{staleTime:5000});
      //       });
      //       queryClient.prefetchQuery(["room", room.roomId], () => ({
      //         ...room,
      //         members: users,
      //       }),{staleTime:5000});
      //     } else {
      //       queryClient.prefetchQuery(
      //         ["room", room.roomId],
      //         () => ({
      //           ...room,
      //         }),
      //         { staleTime: 5000 }
      //       );
      //     }
      //     const pinned = room.pinned;
      //     const lastMessagetime =
      //       room.lastMessage?.deliveredTime ||
      //       room.lastMessage?.sendTime ||
      //       room.roomId;
      //     rooms[room.roomId] = {
      //       roomId: room.roomId,
      //       pinned,
      //       lastMessagetime,
      //     };
      //   });
      return rooms;
    },
    {
      ...options,
      suspense: true,
      refetchOnWindowFocus: false,
    }
  );

  const reOrderedRooms = useMemo(() => {
    if (!rooms) return [null, null];
    const nonPinnedRooms = {};
    const pinnedRooms = {};

    Object.keys(rooms).forEach((roomId) => {
      const { pinned, lastMessagetime } = rooms[roomId];
      if (pinned) {
        pinnedRooms[pinned] = roomId;

        return;
      }
      nonPinnedRooms[lastMessagetime] = roomId;
    });

    const pinnedRoomIds = [...Object.keys(pinnedRooms)]
      .sort((a, b) => b - a)
      .map((key) => pinnedRooms[key]);
    const nonPinnedRoomIds = [...Object.keys(nonPinnedRooms)]
      .sort((a, b) => b - a)
      .map((key) => nonPinnedRooms[key]);
    return [Object.keys(rooms), [...pinnedRoomIds, ...nonPinnedRoomIds]];
  }, [rooms]);

  return reOrderedRooms;
};

export const useRoom = ([roomId], queryOptions) => {
  const queryClient = useQueryClient();

  // console.log(`%cfetching onlyy roomhook`, "color:blue");
  return useQuery(
    ["room", roomId],
    async () => {
      const data = await getRoom({ roomId, queryClient });

      // console.log(`%cfetching room-${roomId}`, "color:orange");
      // console.log(data)
      return data;
    },
    {
      refetchOnWindowFocus: false,
      ...(queryOptions && queryOptions),
    }
  );
};



export const useUserById = ([userId], { ...options } = {}) => {
  return useQuery(["user", userId], async () => await getUserById(userId), {
    ...options,
  });
};

export const useUsers = (users, { ...options } = {}) => {
  const queries = useMemo(() => {
    if (!users) return [];
    return users.map((userId, index) => {
      return {
        queryKey: ["user", userId],
        queryFn: async () => {
          // console.log(`%cfetching user-${userId}`, "color:blue");
          return await getUserById(userId);
        },
        refetchOnWindowFocus: false, 
        ...options,
      };
    });
  }, [options, users]);

  return useQueries({
    queries,
  });
};

 

export const useMediaOfRoom = ([roomId], queryOptions) => {
  return useQuery([roomId, "media"], async () => await getMedia(roomId), {
    ...(queryOptions && queryOptions),
  });
};

export const useDocumentsOfRoom = ([roomId], queryOptions) => {
  return useQuery(
    [roomId, "documents"],
    async () => await getDocuments(roomId),
    {
      ...(queryOptions && queryOptions),
    }
  );
};

export const useMessagesOfRoom = ([roomId], { queryOptions } = {}) => {
  const queryClient = useQueryClient();

  const [hasMore, setHasMore] = useState(true);

  // console.log("%cmessages hok", "color:blue;font-size:24px");

  const messagesQuery = useQuery(
    [roomId, "messages"],
    async () => {
      // console.log("%cfetching messages", "color:red;font-size:32px");
      const response = await getMessages({ roomId });

      setHasMore(Object.keys(response).length !== 0);
      return response;
    },
    {
      refetchOnMount: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      ...(queryOptions && queryOptions),
    }
  );

  // const messagesQuery = useInfiniteQuery({
  //   queryKey: [roomId, "messages"],
  //   queryFn:
  //     ({ pageParam = 0 }) =>{  console.log("%cfetching messages", "color:red;font-size:'32px"); return getMessages({ roomId, offset: pageParam })},
  //   ...(queryOptions && queryOptions),
  //   getNextPageParam: (lastPage, allPages) =>{
  //     if(Object.keys(lastPage).length===0){
  //       return undefined
  //     }
  //     const totalMessages=allPages.reduce((prev,curr)=>{
  //       return Object.keys(curr).length+prev
  //     },0)

  //   return totalMessages;},
  //   getPreviousPageParam: (firstPage, allPages) => undefined,
  // });

  const [isFetchingNextPage, setIsFetching] = useState(false);

  messagesQuery.fetchNextPage = useCallback(
    async (offset) => {
      setIsFetching(true);
      const messages = await getMessages({ roomId, offset });

      setHasMore(Object.keys(messages).length !== 0);
      queryClient.setQueryData([roomId, "messages"], (old) => ({
        ...messages,
        ...old,
      }));
      setIsFetching(false);
      return messages;
    },
    [queryClient, roomId]
  );

  messagesQuery.hasMore = hasMore;
  messagesQuery.isFetchingNextPage = isFetchingNextPage;

  return { messagesQuery };
};
