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
  getObjectUrls,
} from "./api";

import useSocket from "../contexts/socketContext";

export const useUser = (queryOptions) => {
  return useQuery(["user"], getUser, {
    suspense: true,
    useErrorBoundary: true,
    refetchOnMount: false,
    retry: false,
    ...(queryOptions && queryOptions),
  });
};




export const useUpdateProfile = () => {
  const [socket] = useSocket();

  const queryClient = useQueryClient();

  const updateProfile = async (_payload) => {
    try {
      let payload = _payload;
      const { original, preview } = _payload;

      if (original) {
        const [url, previewUrl] = await getObjectUrls({
          original,
          preview,
          collection: "dp",
        });

        payload = {
          dp: { url, previewUrl },
        };
      }
      socket.emit("profileUpdate", payload, () => {
        queryClient.setQueryData(["user"], (old) => {
          const { original, preview, ...rest } = old;
          return { ...rest, ...payload };
        });
      });
    } catch (e) {}
  };
  return updateProfile;
};

