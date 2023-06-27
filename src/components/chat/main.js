import { useCallback, useRef } from "react";

import chatbg from "../../assets/chatbg.png";
import { useAppState } from "../../contexts/appStore";
import { ChatProvider, useChatState } from "../../contexts/chatContext";
import { useMessageMutation } from "../../contexts/mutationContext";
import useSocket from "../../contexts/socketContext";

import { ulid } from "../../utils";
import { Details, DetailsPortal } from "../details";
import Disclosure from "../Disclosure";
import Footer from "../footer";
import ImageModal from "../mediaModal/mediaModal";
import Conversation from "./conversation";
import ChatHeader from "./Header";

import { RoomProvider, useChatRoom } from "../../contexts/roomContext";
import Stack from "./stack";

import { ModalProvider } from "../../contexts/modalContext";
import { useUser } from "../../queries.js/useRequests";
import MessageHandlerProvider from "./messageHandlerProvider";

const ChatWrapper = ({ children }) => {
  const { data: user } = useUser();
  const { newRoom, ...room } = useChatRoom();
  const [socket, socketConnected] = useSocket();
  const { state: chatState } = useChatState();

  const roomId = room?.roomId;
  const roomType = room?.type;
  const targetUserId = room.id;

  // useEffect(() => {
  //   if (roomId && room?.unread !== 0 && !newRoom && socket) {
  //     socket.emit("clearUnread", { roomId });
  //   }
  // }, [newRoom, room?.unread, roomId, socket]);

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
      typing: true,
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
      if (chatState?.reply) {
        const { from, isSenderUser, ...rest } = chatState.reply;

        reply = { ...rest, from: from.id };
      }
      const id = `${ulid()}`;
      const metaData = {
        roomId: roomId,
        id,
        message: {},
        from: user.id,
        to: targetUserId,
        sendTime: Date.now(),
        ...(reply && { reply }),
      };
      const message = { ...metaData, message: { ...payload } };

      console.log({ ...metaData, message: { ...payload } });

      messageMutate.sendMessage({ ...message, collection: message.roomId });
    },
    [socket, chatState?.reply, roomId, user.id, targetUserId, messageMutate]
  );

  return <>{children}</>;
};


const MainDisclosure = ({ children }) => {
  const {preview} = useAppState();

  console.log(`%cpreview`, "color:blue;font-size:32px");

  return (
    <Disclosure
      isExpanded={preview}
      direction="right"
      duration={500}
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </Disclosure>
  );
};

const Main = () => {
  const scroller = useRef();

  const footer = useRef();

  return (
    <RoomProvider>
      <ChatProvider>
        <MessageHandlerProvider>
          <ModalProvider>
            <MainDisclosure>
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
                  <ChatWrapper>
                    <Stack {...{ scroller, footer }}>
                      <Conversation {...{ scroller, footer }} />
                      <Footer {...{ scroller, footer }} />
                    </Stack>
                  </ChatWrapper>
                </div>
              </div>
            </MainDisclosure>
            <DetailsPortal>
              <Details />
            </DetailsPortal>
            <ImageModal />
          </ModalProvider>
        </MessageHandlerProvider>
      </ChatProvider>
    </RoomProvider>
  );
};
export default Main;
