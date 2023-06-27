import { createContext, useCallback, useContext, useRef } from "react";

import { useChatState } from "../../contexts/chatContext";
import { useMessageMutation } from "../../contexts/mutationContext";
import useSocket from "../../contexts/socketContext";

import { useChatRoom } from "../../contexts/roomContext";

import { useMemo } from "react";
import { useLatest } from "../../hooks/useLatest";
import { useUser } from "../../queries.js/useRequests";
import { ulid } from "../../utils";

const Context = createContext();

const MessageHandlerProvider = ({ children }) => {
  const { data: user } = useUser();
  const { newRoom, ...room } = useChatRoom();
  const [socket, socketConnected] = useSocket();
  const chatState = useChatState();

  const roomId = room?.roomId;
  const roomType = room?.type;
  const targetUserId = room.id;

  // useEffect(() => {
  //   if (roomId && room?.unread !== 0 && !newRoom && socket) {
  //     socket.emit("clearUnread", { roomId });
  //   }
  // }, [newRoom, room?.unread, roomId, socket]);

  const typingTimeOut = useRef();
  const isTyping = useRef(false);

  const typingHandler = useCallback(() => {
    if (!socket) {
      console.error("Couldn't send message");
      return;
    }

    if (typingTimeOut.current) {
      clearTimeout(typingTimeOut.current);
    }

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing", {
        roomId: roomId,
        typingBy: user.id,
        typing: true,
        message: null,
      });
    }

    typingTimeOut.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit("typing", {
        roomId: roomId,
        typing: false,
        typingBy: user.id,
        message: null,
      });
    }, 600);
  }, [roomId, socket, user.id]);

  const { sendMessage } = useMessageMutation();

  const submitHandler = useCallback(
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

      sendMessage({ ...message, collection: message.roomId });
    },
    [socket, sendMessage, chatState?.reply, targetUserId, roomId, user.id]
  );

  const submitHandlerLatest = useLatest(submitHandler);
  const typingHandlerLatest = useLatest(typingHandler);

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          onSubmit: (e) => {
            submitHandlerLatest.current?.(e);
          },
          handleTyping: (e) => {
            typingHandlerLatest.current?.(e);
          },
        }),
        [submitHandlerLatest, typingHandlerLatest]
      )}
    >
      {children}
    </Context.Provider>
  );
};

function useMessageHandler() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error(
      "useMessageHandler must be used within MessageHandlerProvider"
    );
  }
  return context;
}

export { MessageHandlerProvider, useMessageHandler };
