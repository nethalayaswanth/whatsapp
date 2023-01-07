import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import throttle from "lodash/throttle";
import moment from "moment";
import { useEffect } from "react";
import chatbg from "../../assets/chatbg.png";
import { useAppState } from "../../contexts/appStateContext";
import { ChatProvider, useChat } from "../../contexts/chatContext";
import { FooterProvider, useFooter } from "../../contexts/footerContext";
import { useMessageMutation } from "../../contexts/mutationContext";
import { useSidebar } from "../../contexts/sidebarContext";
import useSocket from "../../contexts/socketContext";

import { ulid } from "../../utils";
import Conversation from "./conversation";
import { Details, DetailsPortal } from "../details";
import Disclosure from "../Disclosure";
import Footer from "../footer";
import ChatHeader from "./Header";
import ImageModal from "../mediaModal/mediaModal";

import Stack from "./stack";
import {
  RoomProvider,
  useChatRoom,
} from "../../contexts/roomContext";

import { useUser } from "../../queries.js/useRequests";
import { ModalProvider } from "../../contexts/modalContext";



const ChatWrapper = ({ children,scroller }) => {
  


   const { data: user } = useUser();

   const { newRoom, ...room } = useChatRoom();

  const [socket, socketConnected] = useSocket();
  const queryClient = useQueryClient();

  const roomId = room?.roomId;
  const roomType = room?.type;
  const targetUserId = room.id;

  useEffect(() => {
    if (roomId && room?.unread !== 0 && !newRoom && socket) {
      socket.emit("clearUnread", { roomId });
    }
  }, [newRoom, room?.unread, roomId, socket]);

  const typingTimeOut = useRef();

  const handleTyping = useCallback(() => {
    if (!socket) {
      console.error("Couldn't send message");
      return;
    }

    if (typingTimeOut.current) {
      clearTimeout(typingTimeOut.current);
    }

    console.log("emitting typing status");
    socket.emit("typing", {
      roomId: roomId,
      typingBy: user.id,
      message: roomType === "group" ? `${user.name} is typing...` : "typing...",
    });

    typingTimeOut.current = setTimeout(() => {
      socket.emit("typing", {
        roomId: roomId,
        typing: false,
        typingBy: user.id,
        message: null,
      });
    }, 400);
  }, [roomId, roomType, socket, user.id, user.name]);

 
  const messageMutate = useMessageMutation();

  const onSubmit = useCallback(
    (payload) => {
      if (!socket) {
        console.error("Couldn't send message");
      }
      let reply;
      // if (chatState?.reply) {
      //   const { blobUrl, ...rest } = chatState?.reply;
      //   reply = rest;
      // }
      const id = `${ulid()}`;
      const metaData = {
        roomId: roomId,
        id,
        message: {},
        from: user.id,
        to: targetUserId,
        sendTime:Date.now(),
        ...(reply && { reply }),
      };



      const message = { ...metaData, message: { ...payload } };

      console.log({ ...metaData, message: { ...payload } });

      messageMutate.sendMessage({ ...message, collection: message.roomId });


    },
    [socket, roomId, user.id, targetUserId, messageMutate]
  );


  return (
    <FooterProvider onSubmit={onSubmit} onKeyPress={handleTyping}>
      {children}
    
    </FooterProvider>
  );
};

const ChatDisclosure =({children})=>{

  const [state, dispatch] = useAppState();

  const preview = state.preview;

  return (
    <Disclosure
          isExpanded={preview}
          direction="right"
          duration={500}
          style={{ height: "100%", width: "100%" }}
        >
              {children}
        </Disclosure>
  )

}


const Preview = () => {

  const scroller = useRef();

  const footer = useRef();

  return (
    <RoomProvider>
      <ChatProvider>
        <ModalProvider>
          <ChatDisclosure>
            <div
              className="h-full w-full bg-app-conversation pointer-events-auto   "
              style={{ position: "relative" }}
            >
              <div
                style={{ backgroundImage: `url(${chatbg})` }}
                className={`absolute z-[0] h-full w-full top-0 bg-repeat left-0 opacity-[0.5] `}
              />
              <div className="flex flex-col z-[1] h-full ">
                <ChatHeader />
                <ChatWrapper {...{ scroller, footer }}>
                  <Stack {...{ scroller, footer }}>
                    <Conversation {...{ scroller, footer }} />
                    <Footer {...{ scroller, footer }} />
                  </Stack>
                </ChatWrapper>
              </div>
            </div>
          </ChatDisclosure>
          <DetailsPortal>
            <Details />
          </DetailsPortal>
          <ImageModal />
        </ModalProvider>
      </ChatProvider>
    </RoomProvider>
  );
};
export default Preview;
