import { createContext, useRef, useCallback, useMemo, useState } from "react";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { ChatTitle } from "../ChatItem";
import { HeaderItem } from "../header/Header";
import { ReactComponent as MenuIcon } from "../../assets/menu.svg";
import Footer from "../footer";
import Conversation from "../conversation/conversation";
import { FooterProvider, useFooter } from "../../contexts/footerContext";
import { useAppState } from "../../contexts/appStateContext";
import ChatHeader from "../header/chat";
import moment from "moment";
import { useUser, useMessagesOfRoom, useClearUnread } from "../../requests.js/useRequests";
import useSocket from "../../contexts/socketContext";
import throttle from "lodash/throttle";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRooms } from "../../requests.js/useRequests";
import { ChatProvider } from "../../contexts/chatContext";
import chatbg from "../../assets/chatbg.png";
import { useChat } from "../../contexts/chatContext";
import { nanoid } from "../../utils";
import ImageModal from "../mediaModal/galleryModal";
import { useSidebar } from "../../contexts/sidebarContext";
import useTransition from "../../hooks/useTransition";
import { createPortal } from "react-dom";
import { Details } from "../details";


const Chat = () => {
  const [state, dispatch] = useAppState();

  const [socket, socketConnected] = useSocket();
  const queryClient = useQueryClient();
  const { data: {user} } = useUser();
  const { data: rooms } = useRooms({
    enabled: !!(socket && socketConnected),
  });
  const room =
    (rooms && state.currentRoom && rooms[state.currentRoom.id]) ||
    state.currentRoom;

  const roomId = room?.roomId;
  const targetUserId = state?.currentRoom?.targetUserId;
  const typing = room?.typing;

  const clearUnread=useClearUnread()
  useEffect(() => {
    if (room?.unread) {
     clearUnread.mutate(roomId);
    }
  }, [clearUnread, room?.unread, roomId]);

  useEffect(() => {
    if (!roomId) return;
    let timeout;
    timeout = setTimeout(() => {
      queryClient.setQueryData(["rooms"], (old) => {
        return {
          ...old,
          [roomId]: {
            ...old[roomId],
            typing: null,
          },
        };
      });
    }, 1000);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [queryClient, typing, roomId, room]);

  const handleKeyDown = useCallback(() => {
    if (!socket) {
      console.error("Couldn't send message");
      return;
    }

    socket.emit("typing", {
      roomId: roomId,
      typing: user.id,
      to: targetUserId,
    });
  }, [roomId, socket, targetUserId, user.id]);

  const handleTyping = useMemo(
    () => throttle(handleKeyDown, 1000),
    [handleKeyDown]
  );

  const [chatState, chatDispatch] = useChat();
  const { messagesQuery, postMessage } = useMessagesOfRoom([roomId], {
    queryOptions: { enabled: !!roomId },
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    isLoading,
  } = messagesQuery;

  
  // const messages = useMemo(() => {
  //   if (data) {
  //     var list = [];

  //     data.pages.forEach((page, i) => {
  //       const { data } = page[Object.keys(page)[0]];
  //       list = [...list, ...data];
  //     });
  //     return list;
  //   }
  //   return [];
  // }, [data]);

  const onSubmit = useCallback(
    (payload) => {
      if (!socket) {
        console.error("Couldn't send message");
      }

      let reply;
      if (chatState?.reply) {
        const { blobUrl, ...rest } = chatState?.reply;
        reply = rest;
      }

      const id = `${roomId}-${nanoid()}`;

      const metaData = {
        roomId: roomId,
        id,
        message: {},
        from: user.id,
        to: targetUserId,
        sendTime: moment(new Date()).unix(),
        ...(reply && { reply }),
      };

      const message = { ...metaData, message: { ...payload } };

      postMessage.mutate({ ...message, collection: message.roomId });
    },
    [socket, chatState?.reply, roomId, user.id, targetUserId, postMessage]
  );

  const [sideBar, sidebarDispatch] = useSidebar();

  const handleHeaderClick = () => {
    sidebarDispatch({ type: "set state", payload: { detailsOpened: true } });
  };

  const detailsOpened = sideBar.detailsOpened;

  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: detailsOpened,
    direction: "right",
  });

  const drawerRoot = document.getElementById("drawer-right");

  return (
    <FooterProvider onSubmit={onSubmit}>
      <>
        <div
          style={{ backgroundImage: `url(${chatbg})` }}
          className={`absolute h-full w-full top-0 bg-repeat left-0 opacity-[0.5] `}
        />
        <div className="flex flex-col h-full ">
          <ChatHeader
            onClick={handleHeaderClick}
            title={room?.name}
            typing={typing ? "typing..." : ""}
          />
          <Conversation messages={messagesQuery.data} room={room} />
          <Footer onSubmit={onSubmit} onKeyDown={handleTyping} />
          <ImageModal roomId={roomId} messages={messagesQuery.data} />
          {mount &&
            createPortal(
              <div className="absolute z-[1002]  left-0 top-0 w-full h-full">
                <div
                  {...getParentProps({
                    style: {
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    },
                  })}
                >
                  <div
                    {...getDisclosureProps()}
                    className="bg-panel-header h-full w-full"
                  >
                    <Details roomId={roomId} />
                  </div>
                </div>
              </div>,
              drawerRoot
            )}
        </div>
      </>
    </FooterProvider>
  );
};

const Index = () => {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};
export default Index;
