import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { useMessageMutation } from "../../contexts/mutationContext";
import useSocket from "../../contexts/socketContext";

import { useChatRoom } from "../../contexts/roomContext";

import { useMemo } from "react";
import { useReplyState } from "../../contexts/replyContext";
import { useLatest } from "../../hooks/useLatest";
import { useUser } from "../../queries.js/user";
import { ulid } from "../../utils";
import { useRefs } from "./refProvider";
import { useScrollToBottomDispatch } from "./scrollToBottom";

const Context = createContext();

const MessageHandlerProvider = ({ children }) => {
  const { data: user } = useUser();

  const currentRoom = useChatRoom();
  const { newRoom, ...room } = currentRoom;
  const [socket, socketConnected] = useSocket();
  const replyState = useReplyState();


  const roomId = room?.roomId;
  const targetUserId = room.id;

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
      if (replyState.from) {
        const { from, isSenderUser, opened, ...rest } = replyState;

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
      sendMessage({ ...message, collection: message.roomId });
     
    },
    [
      socket,
      sendMessage,
      targetUserId,
      roomId,
      user.id,
      replyState
    ]
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
