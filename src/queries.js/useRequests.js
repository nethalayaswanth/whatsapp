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
  logout,
  nameUpdate,
  pinRoom,
  search,
  signUp,
} from "./api";



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

export const useLogout = ({ mutationOptions } = {}) => {
  const queryClient = useQueryClient();

  return useMutation(() => logout(), {
    ...(mutationOptions && mutationOptions),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], (old) => ({
        ...data,
      }));
      mutationOptions?.onSuccess?.(data);
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
      //console.log('%cred','color:red')
      //console.log(data)
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



