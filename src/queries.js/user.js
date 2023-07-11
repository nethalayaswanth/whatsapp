import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import useSocket from "../contexts/socketContext";

import { getObjectUrls, getOnlineUsers, getUserById, search } from "./api";

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

export const useUserQuery = ({ userId, select, queryOptions } = {}) => {
  return useQuery(
    ["user", userId],
    async () => {
      return await getUserById(userId);
    },
    {
      select,
      ...(queryOptions && queryOptions),
    }
  );
};

export const useUserById = ({ userId, queryOptions } = {}) => {
  const select = useCallback((data) => {
    return data;
  }, []);

  return useUserQuery({ userId, select, queryOptions });
};

export const useUserDetails = ({ userId, queryOptions } = {}) => {
  const select = useCallback((data) => {
    return {
      name: data?.name,
      dp: data?.dp,
      username: data?.username,
      id: data?.id,
    };
  }, []);

  return useUserQuery({ userId, select, queryOptions });
};

export const useSenderDetails = ({ userId, roomId, queryOptions } = {}) => {
  const queryClient = useQueryClient();
  const { data: user } = useUserDetails({ userId, queryOptions });
  const rooms = queryClient.getQueryData(["rooms"]);
  const colors = rooms[roomId]?.colors;
  const color = colors ? colors[userId] : null;
  return { ...(user && user), color };
};

export const useExistingUsers = () => {
  const queryClient = useQueryClient();

  return queryClient.getQueriesData({ queryKey: ["user"] });
};

export const useOnlineUsers = ({ queryOptions } = {}) => {
  const queryClient = useQueryClient();
  return useQuery(
    ["onlineUsers"],
    async () => {
      const data = await getOnlineUsers();

      const users = data.map((user) => {
        const prevData = queryClient.getQueryData(["user", user.id]);
        if (prevData) {
          queryClient.setQueryData(["user", user.id], (old) => ({
            ...(old && old),
            ...user,
          }));
        } else {
          queryClient.prefetchQuery(
            ["user", user.id],
            () => ({
              ...user,
            }),
            { staleTime: Infinity }
          );
        }

        return user.id;
      });
      return users;
    },
    {
      ...(queryOptions && queryOptions),
    }
  );
};

export const useSearch = (queryKey, queryOptions) => {
  const queryClient = useQueryClient();
  return useQuery(
    ["search", queryKey],
    async () => {
      const data = await search(queryKey);

      if (data.length === 0) return [];

      const users = data.map((user) => {
        const prevData = queryClient.getQueryData(["user", user.id]);
        if (prevData) {
          queryClient.setQueryData(["user", user.id], (old) => ({
            ...(old && old),
            ...user,
          }));
        } else {
          queryClient.prefetchQuery(
            ["user", user.id],
            () => ({
              ...user,
            }),
            { staleTime: Infinity }
          );
        }

        return user.id;
      });
      return users;
    },
    {
      ...(queryOptions && queryOptions),
    }
  );
};
