
import {
  useCallback,
  useLayoutEffect,
  forwardRef,
  memo,
  useRef,
  useState,
} from "react";

import useHover from "../../hooks/useHover";

import { useChatDispatch } from "../../contexts/chatContext";
import { useMessage } from "../../queries.js/messages";
import { useSenderDetails } from "../../queries.js/user";

import { MenuContainer } from "../Menu";
import { Avatar } from "../Avatar";
import HoverToolTip from "../tooltip/hoverToolTip";
import Deleted from "./deleted";
import Delete from "./deleteDialog";
import Doc from "./document";
import Failed from "./error";
import Media from "./media";
import Reply from "./reply";
import Text from "./text";

import { callAll, formatDat } from "../../utils";

import { ReactComponent as Timer } from "../../assets/clock.svg";
import { ReactComponent as TailIn } from "../../assets/tail.svg";
import { ReactComponent as TailOut } from "../../assets/tailOut.svg";
import { ReactComponent as Tick } from "../../assets/tick.svg";
import { compareProps } from "./utils";

const Notification = ({ children }) => {
  return (
    <div className="px-[6.5%] mb-[12px] first:mt-[8px] flex justify-center relative flex-row select-text">
      <div className=" pt-[5px] pb-[6px] px-[12px] text-center  bg-white text-primary-default rounded-[7.5px] inline-block text-[12.5px] leading-[21px] shadow-sm  flex-none ">
        {children}
      </div>
    </div>
  );
};

const Tail = ({ incoming }) => {
  return (
    <span
      className={`w-[8px]   absolute top-0 z-[100] block h-[13px] ${
        !incoming
          ? "text-message-outgoing right-[-8px]"
          : "text-message-incoming left-[-8px]"
      }`}
    >
      {incoming ? <TailIn /> : <TailOut />}
    </span>
  );
};

const Name = ({ name, color }) => {
  return (
    <div className={`pl-[9px] pb-[5px] pt-[3px]`}>
      <div
        className={`inline-flex max-w-full text-[12.8px] font-[500] leading-[22px] `}
      >
        <span
          style={{
            ...(color && { color: color }),
          }}
          className={`pl-[2px] ml-[-2px] flex-grow-0 flex-shrink-1 basis-auto overflow-hidden text-ellipses cursor-pointer whitespace-nowrap `}
        >
          {name}
        </span>
      </div>
    </div>
  );
};
const messageActions = [
  "Message info",
  "Reply",
  "React to message",
  "Forward message",
  "Delete message",
];

const Options = ({ reply, getNode, handleMessgeAction }) => {
  const [_, isHovering] = useHover(getNode);

  return (
    <span>
      <div
        className={`absolute z-[800] right-[3px] pointer top-[3px] w-[42px] max-w-[90%] h-[27px] overflow-hidden pointer-events-none text-bubble-icon ${
          isHovering && !reply && "down"
        }  `}
      >
        <div className="right-[5px] top-[5px]  cursor-pointer absolute  h-[18px] pointer-events-auto ">
          <HoverToolTip
            value={isHovering}
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
              right: 0,
            }}
          >
            {({ closeToolTip }) => (
              <MenuContainer
                items={messageActions}
                onClick={callAll(handleMessgeAction, closeToolTip)}
              />
            )}
          </HoverToolTip>
        </div>
      </div>
    </span>
  );
};

const Footer = ({ time, text, incoming, seen, sending, containMedia }) => {
  return (
    <div className="absolute bottom-[3px] right-[5px] mt-[-12px] mr-0 ml-[4px]  z-[10] ">
      <div
        className={`cursor-pointer whitespace-nowrap text-[0.6875rem] h-[15px] leading-[15px]  ${
          containMedia && !text
            ? "text-white text-opacity-[0.9]"
            : "text-message-timestamp-read"
        }`}
      >
        <span className="inline-block text-center align-top">{time}</span>
        {!incoming && (
          <div className="ml-[3px] inline-block text-message-icon">
            <span
              className={` ${
                !seen ? " text-message-timestamp-read" : "text-bubble-read"
              }`}
            >
              {sending ? <Timer /> : <Tick />}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
const MessageWrapper = ({ roomId, metaData }) => {
  const container = useRef();
  const { sender: senderId, id } = metaData;

  const { data } = useMessage({
    roomId,
    messageId: id,
  });
  const sender = useSenderDetails({ userId: senderId, roomId });

  const status = data?.status;
  const sending = status?.sending;
  const color = useRef("red");

  console.log(`%crendering`, `color:${color.current}`, data);

  // useLayoutEffect(() => {
  // if (last){
  //   console.timeEnd("time",index)
  // }else {console.timeLog("time", index)}
  //   color.current = "yellow";

  //   if (sending) {
  //     const scroller = container.current.offsetParent;
  //     console.log(scroller, scroller.scrollHeight);
  //     scroller.scroll({
  //       behaviour: "smooth",
  //       left: 0,
  //       top: scroller.scrollHeight,
  //     });
  //   }
  // }, [index, last, sending, status]);

  return (
    <>
      {data && (
        <Message
          roomId={roomId}
          data={{ ...metaData, sender, senderId, ...data }}
          ref={container}
        />
      )}
    </>
  );
};

const AddedToGroup = ({
  receiverId,
  isSenderUser,
  roomId,
  isReceiverUser,
  sender,
}) => {
  const receiver = useSenderDetails({ userId: receiverId, roomId });
  const senderName = sender?.name || sender.id;
  const receiverName = receiver?.name || receiver.id;
  const senderDp = sender?.dp?.previewUrl;
  return `${isSenderUser ? "you" : senderName} added ${
    isReceiverUser ? "you" : receiverName
  }`;
};
const Message = forwardRef(({ roomId, data }, container) => {
  const {
    sender,
    id: messageId,
    receiver,
    senderId,
    isSenderUser,
    tail,
    sameSender,
    isReceiverUser,
  } = data;

  const status = data?.status;
  const sending = status?.sending;
  const error = status?.error;

  const senderName = sender?.name || senderId;
  const senderDp = sender?.dp?.previewUrl;
  const senderColor = sender?.color;
  const receiverName = receiver?.name;

  const incoming = !isSenderUser;


  const timeStamp = incoming ? data?.deliveredTime : data?.sendTime;
  const time = formatDat(timeStamp)?.time;

  const message = data?.message;

  const type = message?.type;
  const deleted = type?.includes("deleted");
  const image = type?.includes("image");
  const gif = type?.includes("gif");
  const video = type?.includes("video");
  const doc = type?.includes("doc");
  const createdGroup = type?.includes("createdGroup");
  const addedToGroup = type?.includes("addedToGroup");

  const text = message?.text;

  const seen = !!(data?.unSeen === 0);

  const containMedia = image || video || gif;

  const original = message?.original;
  const preview = message?.preview;
  const dimensions = message?.dimensions;
  const fileName = message?.fileName;
  const fileSize = message?.fileSize;
  const fileType = message?.fileType;
  const fileDuration = message?.fileDuration;

  const reply = !deleted && data?.reply;

  const props = {
    messageId,
    sending,
    error,
    original,
    preview,
    fileDuration,
    fileSize,
    fileName,
    text,
    type,
    roomId,
    dimensions,
  };

  const ref = useRef();
  const getNode = useCallback(() => {
    return ref.current;
  }, []);

  const [showDeleteModal, setDeleteModal] = useState();
  const dispatch = useChatDispatch();

  const handleMessgeAction = useCallback(
    (action) => {
      switch (action) {
        case "Reply": {
          dispatch({
            type: "reply",
            payload: {
              reply: {
                from: sender,
                message: {
                  text,
                  type,
                  preview,
                },
                id: messageId,
                isSenderUser,
              },
            },
          });
          break;
        }
        case "Delete message": {
          setDeleteModal(true);
          break;
        }

        default: {
        }
      }
    },
    [dispatch, isSenderUser, messageId, preview, sender, text, type]
  );

  if (createdGroup) {
    return (
      <Notification>
        {`${isSenderUser ? "you" : senderName} created this group`}
      </Notification>
    );
  }

  if (addedToGroup) {
    return (
      <Notification>
        <AddedToGroup
          isSenderUser={isSenderUser}
          receiverId={receiver}
          roomId={roomId}
          sender={sender}
          isReceiverUser={isReceiverUser}
        />
      </Notification>
    );
  }

  return (
    <div
      ref={container}
      id={messageId}
      className={`message  pl-[71px] pr-[57px]  ${
        sameSender || tail ? `mb-[2px] ` : "mb-[12px]"
      } ${tail ? `mt-[10px] ` : ""}   flex relative flex-col select-text`}
    >
      <div
        id="msg-container"
        ref={ref}
        className={`${incoming ? "incoming" : ""}  mb-0  max-w-[85%] ${
          reply ? "min-w-[180px]" : ""
        }   ${
          doc ? "w-[336px]" : ""
        }  relative flex-none text-[14.2px] leading-[19px] text-message-primary message ${
          containMedia ? "image" : ""
        } ${text ? "text" : ""}`}
      >
        {tail && <Tail incoming={incoming} />}

        {incoming && (
          <div>
            <div className="absolute w-[28px] h-[28px] rounded-full cursor-pointer left-[-38px]">
              <Avatar src={senderDp} />
            </div>
          </div>
        )}

        <div
          className={`rounded-[7.5px] ${
            incoming ? "rounded-tl-[0]" : "rounded-tr-[0]"
          } relative z-[200] bg-[color:var(--bg)] shadow-md`}
        >
          <div className={`p-[3px] flex-col justify-center relative `}>
            {!isSenderUser && <Name name={senderName} color={senderColor} />}
            {reply && <Reply reply={reply} roomId={roomId} />}
            {doc && <Doc {...props} />}
            {containMedia && <Media {...props}></Media>}
            {text && <Text text={text} />}
            {deleted && <Deleted isSenderUser={isSenderUser} />}
          </div>
          <Footer {...{ time, text, incoming, seen, sending, containMedia }} />
        </div>

        <Options {...{ getNode, reply, handleMessgeAction }} />
        <Delete
          show={showDeleteModal}
          setShow={setDeleteModal}
          isSenderUser={isSenderUser}
          deleted={deleted}
          roomId={roomId}
          messageId={messageId}
        />
        {error && <Failed />}
        <div className="absolute flex min-h-0 min-w-0 items-center  w-[101]px t-[calc(50%-10px)] mt-[-13px] justify-end">
          <div className="px-[3px] h-[25px] pb-0 min-h-0 min-w-0 flex-shrink flex-grow-0 pt-0 ">
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default memo(MessageWrapper,compareProps);
