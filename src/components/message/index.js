import { ReactComponent as Timer } from "../../assets/clock.svg";
import { ReactComponent as Down } from "../../assets/down.svg";

import { ReactComponent as TailIn } from "../../assets/tail.svg";
import { ReactComponent as TailOut } from "../../assets/tailOut.svg";
import { ReactComponent as Tick } from "../../assets/tick.svg";


import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useMemo, useState, useRef } from "react";
import { useChat } from "../../contexts/chatContext";
import useSocket from "../../contexts/socketContext";
import useCollapse from "../../hooks/useCollapse";
import useHover from "../../hooks/useHover";
import useMediaFetch from "../../hooks/useMediaFetch";
import { useObjectUrl } from "../../hooks/useObjectUrl";
import usePressAndHold from "../../hooks/usePressAndHold";

import { callAll, formatDate ,formatDat, mergeRefs} from "../../utils";
import { MenuContainer } from "../Menu";
import { Modal } from "../modal";

import HoverToolTip from "../tooltip/hoverToolTip";
import Doc from "./document";
import Media from "./media";
import Reply from "./reply";
import Text from "./text";
import DeleteDialog from "./deleteDialog";
import Deleted from "./deleted";
import { useMessage } from "../../queries.js/messages";
import { useEffect } from "react";
import { useUserDetails, useUserName } from "../../queries.js/user";
import Failed from "./error";

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

const messageActions = [
  "Message info",
  "Reply",
  "React to message",
  "Forward message",
  "Delete message",
];

const Options=({isHovering,reply,handleMessgeAction})=>{
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
}

const Footer = ({ time, text, incoming, seen, sending, conatainMedia }) => {
  return (
    <div className="absolute bottom-[3px] right-[5px] mt-[-12px] mr-0 ml-[4px]  z-[10] ">
      <div
        className={`cursor-pointer whitespace-nowrap text-[0.6875rem] h-[15px] leading-[15px]  ${
          conatainMedia && !text
            ? "text-white text-opacity-[0.9]"
            : "text-message-timestamp-read"
        }`}
      >
        <span className="inline-block text-center align-top">
{time}
        </span>
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
const MessageWrapper=({ children, className, user, roomId,metaData })=>{

   const container = useRef();

   const [showModal, setShowModal] = useState();

  
   const { sender:senderId, id, receiver, isSenderUser, tail, isReceiverUser } =
     metaData;

   const { data } = useMessage({
     roomId,
     messageId: id,
   });
     const { data:sender} = useUserDetails({ userId: senderId });

   
  const status = data?.status;
  const sending = status?.sending;

  
  useLayoutEffect(() => {
    if (sending) {
      container.current.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
    }
  }, [sending]);



  return (
   <div
      ref={container}
      id={id}
      className={`message  px-[6.5%] mb-[12px]  flex relative flex-col select-text`}
    >{data && <Message roomId={roomId} data={{...metaData,sender,senderId,...data}}/>}
  
    </div>
    
  );
}
const Message = ({ children, className, user, roomId,data }) => {
  const [ref, isHovering] = useHover();

  const [showModal, setShowModal] = useState();

  // const bind=usePressAndHold((enable)=>{if(enable){console.log(enable)}},1000)

  const {
    sender,
    id: messageId,
    receiver,
    senderId,
    isSenderUser,
    tail,
    isReceiverUser,
  } = data;

  console.log({
    sender,
    id: messageId,
    receiver,
    senderId,
    isSenderUser,
    tail,
    isReceiverUser,
  });

  console.log(`%cmessages rendering`,'color:red')

  const status = data?.status;
  const sending = status?.sending;
  const error = status?.error;
  
  const senderName = sender?.name || senderId; ;
  const receiverName = receiver?.name;
 
  const incoming = !isSenderUser;

  const timeStamp = incoming ? data?.deliveredTime : data?.sendTime;
  const time = formatDat(timeStamp).time;
  
  const message = data?.message;

  const type = message?.type;
  const deleted = type?.includes("deleted");
  const image = type?.includes("image");
  const gif = type?.includes("gif"); 
  const video = type?.includes("video");
  const doc = type?.includes("doc");
  const createdGroup = type?.includes("createdGroup");
  const addedToGroup = type?.includes("addedToGroup");


  const reply = !deleted && data?.reply ;
  const replyMessageId = reply?.messageId;

  const text = message?.text;
  const replyText = reply?.text;

  const seen = !!(data?.unSeen === 0);

  const containMedia = image || video || gif;
 
  const original=message?.original
  const preview=message?.preview
  const dimensions=message?.dimensions

  const fileName = message?.fileName; 
  const fileSize = message?.fileSize;
  const fileType = message?.fileType;
  const fileDuration=message?.fileDuration
  
  const replyMediaUrl = reply?.previewurl;


  const props={ 
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
    dimensions}

  const [socket, socketConnected] = useSocket();

  // const [chatState, chatDispatch] = useChat();



  const handleDeleteAction = useCallback(
    async (action) => {
      switch (action) {
        case "Delete for everyone": {
          socket.emit(
            "deleteMessage",
            {
              roomId,
              messageId,
              everyone: true,
            },
            (res) => {}
          );

          setShowModal(false);
          break;
        }
        case "Delete for me": {
          socket.emit("deleteMessage", {
            roomId,
            messageId,
            everyone: false,
          });

          setShowModal(false);

          break;
        }
        case "Cancel": {
          setShowModal(false);

          break;
        }

        default: {
        }
      }
    },
    [messageId, roomId, socket]
  );

  const handleMessgeAction = useCallback(
    (action) => {
      switch (action) {
        case "Reply": {
          // chatDispatch({
          //   type: "reply",
          //   payload: {
          //     reply: {
          //       text,
          //       name: senderName,
          //       from: sender,
          //       messageId,
          //       type,
          //       preview,
          //     },
          //   },
          // });
          break;
        }
        case "Delete message": {
          setShowModal(true);
          break;
        }

        default: {
        }
      }
    },
    [messageId, preview, sender, senderName, text, type]
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
        {`${isSenderUser ? "you" : senderName} added ${receiverName}`}
      </Notification>
    );
  }

  return (
    <>
      <div
        // {...bind()}
        id="msg-container"
        ref={ref}
        className={`${incoming ? "incoming" : ""} ${
          containMedia ? "image" : ""
        } mb-0  max-w-[85%] ${reply ? "min-w-[180px]" : ""}   ${
          doc ? "w-[336px]" : ""
        }  relative flex-none text-[14.2px] leading-[19px] text-message-primary `}
      >
        {tail && <Tail incoming={incoming} />}

        <div
          className={`rounded-[7.5px] ${
            incoming ? "rounded-tl-[0]" : "rounded-tr-[0]"
          } relative z-[200] bg-[color:var(--bg)] shadow-md`}
        >
          <div className={`p-[3px] flex-col justify-center relative `}>
            {!isSenderUser && (
              <div className={`pl-[9px] pb-[5px] pt-[3px]`}>
                <div
                  className={`inline-flex max-w-full text-[12.8px] font-[500] leading-[22px] `}
                >
                  <span
                    style={
                      {
                        // ...(color && { color: color }),
                      }
                    }
                    className={`pl-[2px] ml-[-2px] flex-grow-0 flex-shrink-1 basis-auto overflow-hidden text-ellipses cursor-pointer whitespace-nowrap `}
                  >
                    {senderName}
                  </span>
                </div>
              </div>
            )}
            {reply && (
              <Reply
                text={replyText}
                replyMessageId={replyMessageId}
                name={reply?.name}
                color={reply?.color}
                url={replyMediaUrl}
              />
            )}
            {doc && <Doc {...props} />}
            {containMedia && <Media {...props}></Media>}
            {text && <Text text={text} />}
            {deleted && <Deleted isSenderUser={isSenderUser} />}
          </div>
          <Footer {...{ time, text, incoming, seen, sending, containMedia }} />
        </div>
        {error && <Failed />}
        <Options {...{ isHovering, reply, handleMessgeAction }} />
        <div className="absolute flex min-h-0 min-w-0 items-center  w-[101]px t-[calc(50%-10px)] mt-[-13px] justify-end">
          <div className="px-[3px] h-[25px] pb-0 min-h-0 min-w-0 flex-shrink flex-grow-0 pt-0 ">
            <div></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageWrapper;
