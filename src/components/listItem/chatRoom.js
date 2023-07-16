import {
  Suspense,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { ReactComponent as DocIcon } from "../../assets/docIcon.svg";
import { ReactComponent as Photo } from "../../assets/photo.svg";
import { ReactComponent as Video } from "../../assets/video.svg";
import { useAppDispatch } from "../../contexts/appStore";
import { useLastMessage } from "../../queries.js/messages";
import {
  usePin,
  useRoom,
  useRoomNotification,
} from "../../queries.js/rooms";
import {useUser } from "../../queries.js/user";

import { useUserDetails } from "../../queries.js/users";
import { FormatEmoji } from "../../shared";
import { formatDat } from "../../utils";
import { Avatar } from "../Avatar";
import Card from "../card";
import CardView from "../card/cardView";

const formatmessage = ({ text, type }) => {
  switch (type) {
    case "image": {
      return {
        Icon: Photo,
        text: "Photo",
      };
    }
    case "gif": {
      return {
        Icon: Photo,
        text: "Photo",
      };
    }
    case "doc": {
      return {
        Icon: DocIcon,

        text: "Document",
      };
    }

    case "video": {
      return {
        Icon: Video,
        text: "video",
      };
    }
    case "text": {
      return {
        Icon: null,
        text: <FormatEmoji text={text} />,
      };
    }
    default: {
      return {
        Icon: null,
        text: "",
      };
    }
  }
};

export const Typing = ({
  roomType,
  userId,
  className = "italic text-unread-timestamp",
}) => {
  const { data: user } = useUserDetails({ userId });

  if (!user) return null;
  const message =
    roomType === "group" ? `${user.name} is typing...` : `typing...`;

  return <span className={`${className ? className : ""}`}>{message}</span>;
};

const Details = ({ roomId, roomType, type, text }) => {
  const { data: notification } = useRoomNotification({ roomId });

  const lastMessage = useMemo(() => {
    const lastMessageType = ["image", "gif", "video", "doc", "text"].filter(
      (messageType) => {
        if (!type) {
          return false;
        }
        return messageType.includes(type);
      }
    )[0];
    return formatmessage({ text, type: lastMessageType });
  }, [type, text]);

  return (
    <>
      {notification && notification.typing ? (
        <Typing userId={notification.typingBy} roomType={roomType} />
      ) : (
        <>
          {lastMessage && lastMessage.Icon ? (
            <div className="inline-block align-middle flex-none text-bubble-icon">
              <span>
                <lastMessage.Icon />
              </span>
            </div>
          ) : null}
          <span> {lastMessage && lastMessage.text}</span>
        </>
      )}
    </>
  );
};

const ChatItem = forwardRef(({ roomId }, ref) => {
  const room = useRoom({ roomId });
  const { data: user } = useUser();
  const pin = usePin();
  const dispatch = useAppDispatch();
  const { data: lastMessage } = useLastMessage({ roomId });

  const userId = user.id;
  const sender = lastMessage?.from;
  const isSenderUser = sender === userId;

  const roomType = room?.type;
  const title = room?.name;
  const unread = room?.unread;
  const pinned = room?.pinned;
  const dp = room?.dp?.previewUrl;

  const message = lastMessage?.message;
  const type = message?.type;
  const text = message?.text;

  const time = isSenderUser
    ? formatDat(lastMessage?.sendTime)?.date
    : formatDat(lastMessage?.deliveredTime)?.date;

  const handleRoom = useCallback(() => {
    dispatch({
      type: "set current room",
      payload: {
        roomId,
        privateMember: null,
      },
    });
  }, [dispatch, roomId]);

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
        //console.log(e);
      }
    },
    [pin, roomId]
  );

  useEffect(() => {});
  // if (room?.members) {
  //   room.members.forEach((userId) => {
  //     queryClient.prefetchQuery(["user", userId], () => getUserById(userId));

  const actions = useMemo(
    () => [pinned ? "unpin" : "pin", "clear chat", "delete chat"],
    [pinned]
  );
  return (
    <CardView
      onClick={handleRoom}
      avatar={<Avatar src={dp} />}
      title={title}
      top={<Card.Time unread={unread}>{time}</Card.Time>}
      main={
        <Card.Main>
          <Details
            type={type}
            text={text}
            roomId={roomId}
            roomType={roomType}
          />
        </Card.Main>
      }
      bottom={[
        pinned ? <Card.Pin /> : null,
        unread !== 0 && unread ? <Card.Unread>{unread}</Card.Unread> : null,
        <Card.ToolTip actions={actions} onClick={handleActions} />,
      ]}
    />
  );
});

const ChatRoom = (props) => {
  return (
    <Suspense fallback="">
      <ChatItem {...props} />
    </Suspense>
  );
};
export default memo(ChatRoom);
