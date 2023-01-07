import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { formatDate, formatDat } from "../utils";

import { getMessages, getDocuments, getMedia } from "./api";

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

      queryClient.prefetchQuery([roomId, "media"], () => getMedia({ roomId}));
     

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
    }
  );
};

export const useRoomMessages = ({ roomId,unread,lastSeenAt, userId, queryOptions }) => {
  const queryClient = useQueryClient();

  const [size, setSize] = useState(15);

  const fetchNextPage = useCallback(
    async (currentCursor) => {
      console.log("fetchNextPage");
 setSize((prev) => {
   return prev + 15;
 });
     
      const prevData = queryClient.getQueryData([roomId, "messages"]);

      if (currentCursor < prevData.cursor) return;

      const response = await getMessages({ roomId, after: prevData.cursor });

      const temp = { ...prevData.messages, ...response?.messages };
      const sorted = Object.keys(temp).sort();
      const messages = {};

      sorted.forEach((id, index) => {
        messages[id] = temp[id];
      });

      queryClient.setQueryData([roomId, "messages"], (cacheData) => {
        return {
          messages: messages,
          hasMore: response.hasMore,
          cursor: response.cursor,
        };
      });
    },
    [queryClient, roomId]
  );

  const select = useCallback(
    (data) => {
      if (!data.messages) return { messages: [], hasMore: data.hasMore };

      let currentDate;
      let prevSender;
      let currentCursor;
      let media=[]
      let documents=[]


      const slice = Object.keys(data.messages).slice(-size);

      const messages = slice.map((messageId, index) => {
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

        const prevDate = currentDate;
        const prevFrom = prevSender;
        const tail = prevFrom !== sender?.id || index === 0;
        prevSender = sender?.id;

        const dateChanged = date && prevDate !== date;
        if (dateChanged) {
          currentDate = date;
        }
        const type = message?.message.type;
        const image = type?.includes("image");
        const gif = type?.includes("gif");
        const video = type?.includes("video");
        const doc = type?.includes("doc");

        console.log(message,type)

        if(image|| video){

          console.log('image found')
          
           media.push(messageId);
        }
         
        
        if (doc) {
          document.push(messageId);
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
        };
      });

   
       queryClient.setQueryData([roomId, "media"], (cacheData) => {
        if(!cacheData || (cacheData.length===0)){
           return  [...media]
        }
    
         return [...new Set([...cacheData, ...media])];

       });

      return { messages, hasMore: data.hasMore, currentCursor };
    },
    [queryClient, roomId, size, userId]
  );

  const { data, isFetching, isLoading, isRefetching, isFetchedAfterMount } =
    useMessages({
      roomId,
      select,
      queryOptions,
    });

  console.log("final", data?.messages?.length, isFetchedAfterMount);

  return { data, fetchNextPage };
};

export const useMessage = ({ roomId, messageId, queryOptions }) => {
  const select = useCallback(
    (data) => {
      // console.log(data.messages[messageId]);
      return data.messages[messageId];
    },
    [messageId]
  );
  return useMessages({ roomId, select, queryOptions });
};

export const useLastMessage = ({ roomId,  queryOptions }) => {
  const select = useCallback((data) => {
    if (!data) return null;
    const ids = Object.keys(data.messages);
    const lastMessageId = ids[ids.length - 1];
    return data.messages[lastMessageId];
  }, []);
  return useMessages({ roomId, select, queryOptions });
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
