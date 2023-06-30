import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

import { formatDat } from "../utils";

import { getDocuments, getMedia, getMessage, getMessages } from "./api";

const appLoadedTime = Date.now();

const refetchOnMount = (query) => {
  const { data, dataUpdateCount, dataUpdatedAt } = query.state;

  if (!data && dataUpdateCount === 0) return true;

  if (dataUpdatedAt < appLoadedTime) return true;

  return false;
};

const useMessages = ({ roomId, queryOptions, select }) => {
  const queryClient = useQueryClient();
  return useQuery(
    [roomId, "messages"],
    async () => {
      const response = await getMessages({ roomId });

      const cacheData = queryClient.getQueryData([roomId, "messages"]);

      console.log("%crefetching", "color:red");

      queryClient.prefetchQuery([roomId, "media"], () => getMedia({ roomId }));

      return {
        ...(cacheData && cacheData),
        messages: { ...cacheData?.messages, ...response.messages },
        hasMore: response.hasMore,
        cursor: response.cursor,
      };
    },
    {
      refetchOnMount: false,
      select,
      // staleTime: Infinity,
      refetchOnWindowFocus: false,
      ...(queryOptions && queryOptions),
      suspense: false,
    }
  );
};

export const useRoomMessages = ({ roomId, queryOptions }) => {
  const queryClient = useQueryClient();

  const prevRoomId = useRef(roomId);

  if (roomId !== prevRoomId.current) {
    console.log("resetting");

    prevRoomId.current = roomId;
  }

  const fetchNextPage = useCallback(
    async (currentCursor) => {
      console.log("fetchNextPage");
      // setSize((prev) => {
      //   return prev + 11;
      // });

      const prevData = queryClient.getQueryData([roomId, "messages"]);

      console.log(currentCursor, prevData.cursor);

      // if (currentCursor < prevData.cursor) return;

      // const response = await getMessages({ roomId, after: prevData.cursor });

      // console.log("fetching from server",response);
      // const temp = { ...prevData.messages, ...response?.messages };
      // const sorted = Object.keys(temp).sort();
      // const messages = {};

      // sorted.forEach((id, index) => {
      //   messages[id] = temp[id];
      // });

      // queryClient.setQueryData([roomId, "messages"], (cacheData) => {
      //   return {
      //     messages: messages,
      //     hasMore: response.hasMore,
      //     cursor: response.cursor,
      //   };
      // });
    },
    [queryClient, roomId]
  );

  const select = useCallback(
    (data) => {
      const user = queryClient.getQueryData(["user"]);

      if (!user || !data.messages)
        return { messages: [], hasMore: data.hasMore };

      console.log("%cstarted", "font-size:32px");

      let prevDate;
      let prevSender;
      let currentCursor;
      let media = [];
      let documents = [];

      const slice = Object.keys(data.messages);
      const userId = user.id;

      let messages = slice.map((messageId, index) => {
        const message = data.messages[messageId];

        const sender = message?.from;
        const receiver = message?.to;

        const isSenderUser = sender === userId;
        const isReceiverUser = receiver === userId;

        if (index === 0) {
          currentCursor = isSenderUser
            ? message?.sendTime
            : message?.deliveredTime;
        }

        const time = isSenderUser ? message?.sendTime : message?.deliveredTime;

        const date = formatDat(time, true)?.date;

        const dateChanged = date && prevDate !== date;
        const senderChanged = prevSender !== sender;

        const tail = senderChanged || index === 0 || dateChanged;

        prevSender = sender;
        if (dateChanged) {
          prevDate = date;
        }

        const type = message?.message.type;
        const image = type?.includes("image") ? "image" : null;
        const gif = type?.includes("gif") ? "gif" : null;
        const video = type?.includes("video") ? "video" : null;
        const doc = type?.includes("doc") ? "doc" : null;
        const reply = message?.reply ? "reply" : null;
        const text = message?.message?.text ? "text" : null;

        const types = [image, gif, video, doc, reply, text].filter((x) => !!x);

        if (!!image || !!video) {
          media.push(messageId);
        }

        if (!!doc) {
          documents.push(messageId);
        }

        return {
          id: messageId,
          isSenderUser,
          isReceiverUser,
          tail,
          dateChanged,
          prevDate,
          date,
          time,
          sender,
          receiver,
          types,
          sameSender: !senderChanged,
        };
      });

      queryClient.setQueryData([roomId, "media"], (cacheData) => {
        if (!cacheData || cacheData.length === 0) {
          return [...media];
        }

        return [...new Set([...cacheData, ...media])];
      });

      queryClient.setQueryData([roomId, "documents"], (cacheData) => {
        if (!cacheData || cacheData.length === 0) {
          return [...documents];
        }

        return [...new Set([...cacheData, ...documents])];
      });

      return { messages, hasMore: data.hasMore, currentCursor };
    },
    [queryClient, roomId]
  );

  const { data } = useMessages({
    roomId,
    select,
    queryOptions,
  });

  return { data, fetchNextPage };
};

export const useMessage = ({ roomId, messageId, queryOptions }) => {
  const select = useCallback(
    async(data) => {
      let message = data.messages[messageId];

      if(!message){
        const data=await getMessage({roomId, messageId})
      }
      return message;
    },
    [messageId,roomId]
  );
  return useMessages({ roomId, select, queryOptions });
};

export const selectLastMessage = (data) => {
  if (!data) return null;
  const ids = Object.keys(data.messages);
  const lastMessageId = ids[ids.length - 1];
  return data.messages[lastMessageId];
};
export const useLastMessage = ({ roomId, queryOptions }) => {
  return useMessages({ roomId, select: selectLastMessage, queryOptions });
};

export const useMediaOfRoom = ({ roomId, messageId, queryOptions }) => {
  const queryClient = useQueryClient();

  return useQuery(
    [roomId, "media"],
    async () => {
      const prevData = queryClient.getQueryData([roomId, "media"]);
      const response = await getMedia(roomId);

      return [...response, ...prevData.media];
    },
    {
      ...(queryOptions && queryOptions),
    }
  );
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
