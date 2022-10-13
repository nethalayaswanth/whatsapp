import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { useState } from "react";
import useSocket from "../contexts/socketContext";
import {
  getUser,
  login,
  getRooms,
  aboutUpdate,
  nameUpdate,
  getOnlineUsers,
  getMessages,
  getMedia,
  getUserById,
  dpUpdate,
  clearUnread,
  getDocuments,
  signUp,
} from "./api";

export const useUser = () => {
  return useQuery(["user"], getUser, { suspense: true });
};

export const useLoginUser = ({ onSuccess = () => {} } = {}) => {
  const queryClient = useQueryClient();

  return useMutation((data) => login(data), {
    // onSuccess: (data, variables) => {
    //   queryClient.setQueryData(["user"], { ...data });
    //   onSuccess?.(data);
    // },
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

export const useOnlineUsers = ({ onSuccess = () => {} } = {}) => {
  return useQuery(["onlineUsers"], getOnlineUsers, {
    onSuccess: (data, variables) => {
      onSuccess?.(data);
    },
  });
};

export const useRooms = ({ onSuccess = () => {}, ...options } = {}) => {
  return useQuery(["rooms"], getRooms, {
    ...options,
    refetchOnMount: false,
    onSuccess: (data, variables) => {
      onSuccess?.(data);
    },
  });
};

export const useSignUpUser = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  return useMutation((data) => signUp(data), {
    // onSuccess: (data, variables) => {
    //   queryClient.setQueryData(["user"], { ...data });
    //   onSuccess?.();
    // },
  });
};

export const useUserById = ({ onSuccess, userId, ...options } = {}) => {
  const queryClient = useQueryClient();

  return useQuery(["user", userId], async () => await getUserById(userId), {
    ...options,
    onSuccess: (data, variables) => {
      onSuccess?.(data);
    },
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
export const useMessagesOfRoom = (
  [roomId],
  { queryOptions, mutateOptions } = {}
) => {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery(
    [roomId, "messages"],
    async () => await getMessages(roomId),
    {
      ...(queryOptions && queryOptions),
    }
  );

  const [socket, socketConnected] = useSocket();

  const postMessage = useMutation({
    ...(mutateOptions && mutateOptions),
    mutationKey: ["rooms", "messages"],
    onMutate: async (message) => {
      await queryClient.cancelQueries([roomId, "messages"]);
      const previousData = queryClient.getQueryData([roomId, "messages"]);
      queryClient.setQueryData([roomId, "messages"], {
        ...previousData,
        [message.id]: {
          ...message,
          loading: true,
          error: false,
        },
      });
      return { previousData };
    },

    onError: async (error, variables, context) => {
      console.log(error);
      queryClient.setQueryData([roomId, "messages"], (old) => ({
        ...old,
        [variables.id]: {
          ...old[variables.id],
          loading: false,
          error: true,
        },
      }));
    },
    onSettled: async (data) => {
      if (!socket) {
        console.error("Couldn't send message");
      }
      await queryClient.cancelQueries([roomId, "messages"]);

      if (data) {
        console.log("emiting");
        socket.emit("message", { ...data }, (res) => {
          console.log("success");
          queryClient.setQueryData([roomId, "messages"], (old) => ({
            ...old,
            [data.id]: {
              ...data,
              ...res,
              loading: false,
              error: false,
            },
          }));

          queryClient.setQueryData(["rooms"], (old) => {
            return {
              ...old,
              [roomId]: {
                ...old[roomId],
                lastMessage: { ...data, ...res },
              },
            };
          });
        });
      }
      
    },
    retry: 3,
  });

  return { messagesQuery, postMessage };
};
