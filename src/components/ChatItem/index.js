import { useQueryClient } from "@tanstack/react-query";
import { forwardRef, useCallback, useEffect } from "react";
import { ReactComponent as DocIcon } from "../../assets/docIcon.svg";
import { ReactComponent as Photo } from "../../assets/photo.svg";
import { ReactComponent as Video } from "../../assets/video.svg";
import useHover from "../../hooks/useHover";
import { getUserById } from "../../queries.js/api";
import { useLastMessage } from "../../queries.js/messages";
import { useRoom } from "../../queries.js/rooms";
import { usePin, useUser } from "../../queries.js/useRequests";
import { FormatEmoji } from "../../shared";
import { formatDat, mergeRefs } from "../../utils";
import ChatView from "./view";

export const ChatTitle = ({ name, time, style, className }) => {
  return (
    <div
      style={{ ...style }}
      className={`flex items-center text-inherit leading-normal text-left ${
        className && className
      } `}
    >
      <div className="flex leading-[inherit] font-medium text-left text-[17px] text-[var(--text)] flex-grow overflow-hidden break-words ">
        <span className="inline-block overflow-hidden text-ellipsis text-inherit whitespace-nowrap flex-grow relative ">
          {name}
        </span>
      </div>
      <div className="ml-[6px] mt-[3px] text-[12px] text-ellipsis whitespace-nowrap overflow-hidden leading-[14px] flex-none max-w-full">
        {time && time}
      </div>
    </div>
  );
};

const chatItemPlaceHolder = () => {
  return <></>;
};

const ChatItem = forwardRef(({ roomId, onClick, last }, ref) => {

  const room = useRoom({ roomMeta:{roomId} });

  

  const { data: user } = useUser();

  const { data: lastMessage } = useLastMessage({ roomId });

  const userId = user.id;
  const sender = lastMessage?.from;

  const isSenderUser = sender === userId;

  const message = lastMessage?.message;
  const typing = room?.notification?.action === "TYPING";
  const typingMessage = room?.notification?.message;
  const pinned = room?.pinned;
  const lastMessageText = message?.text;
  const dp = room?.dp?.previewUrl;
  const time = isSenderUser
    ? formatDat(lastMessage?.sendTime)?.date
    : formatDat(lastMessage?.deliveredTime)?.date;

  const title = room?.name;

  const handleClick = () => {
    onClick?.({ ...room});
  };

  const lastMessageType = ["image", "video", "doc", "text"].filter((type) => {
    if (!message?.type) {
      return false;
    }
    return message?.type.includes(type);
  });

  const lastMessageTypes = {
    image: {
      icon: <Photo />,
      text: "Photo",
    },
    doc: {
      icon: <DocIcon />,
      text: "Document",
    },
    video: {
      icon: <Video />,
      text: "video",
    },
    text: {
      text: <FormatEmoji text={lastMessageText} />,
    },
  };

  const details =
    lastMessageType.length !== 0 ? lastMessageTypes[lastMessageType[0]] : null;

  const unread = room?.unread;

  const queryClient = useQueryClient();

  const pin = usePin();

  const handleActions = useCallback(
    async (action) => {
      try {
        switch (action) {
          case "pin": {
            pin.mutate({ roomId, pin: true });

            break;
          }
          case "unpin": {
            pin.mutate({ roomId, pin: false });

            break;
          }
          case "clear chat": {
            break;
          }
          case "delete chat": {
            break;
          }

          default: {
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    [pin, roomId]
  );

  const [hoverRef, showToolTip] = useHover();

  useEffect(() => {
    if (room?.members) {
      room.members.forEach((userId) => {
        queryClient.prefetchQuery(["user", userId], () => getUserById(userId));
      });
    }
  }, [room?.members, queryClient]);

  return (
    <ChatView
      onClick={handleClick}
      handleActions={handleActions}
      dp={dp}
      unread={unread}
      title={title}
      time={time}
      typing={typingMessage}
      pinned={pinned}
      showToolTip={showToolTip}
      ref={mergeRefs(ref, hoverRef)}
      details={
        <>
          {details && details.icon ? (
            <div className="inline-block align-top flex-none text-bubble-icon">
              <span>{details.icon}</span>
            </div>
          ) : null}
          <span> {details && details.text}</span>
        </>
      }
    />
  );
});

export default ChatItem;
