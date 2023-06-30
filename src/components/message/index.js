
import { forwardRef, memo, useCallback, useRef, useState } from "react";

import { useChatDispatch } from "../../contexts/chatContext";
import { useMessage } from "../../queries.js/messages";
import { useSenderDetails } from "../../queries.js/user";

import { Avatar } from "../Avatar";
import Deleted from "./deleted";
import Doc from "./document";
import Failed from "./error";
import Media from "./media";
import Notification from "./notification";
import Reply from "./reply";
import Text from "./text";

import { formatDat } from "../../utils";

import { MessageProvider } from "../../contexts/messageContext";
import { useDeleteDispatch } from "../modal/deleteModal";
import Actions from "./actions";
import AddedToGroup from "./addedToGroup";
import Container from "./container";
import Footer from "./footer";
import Name from "./name";
import Tail from "./tail";
import { compareProps, getMediaData, getMessageType } from "./utils";
import { useReplyDispatch } from "../../contexts/replyContext";

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
        <MessageProvider>
          <Message
            roomId={roomId}
            data={{ ...metaData, sender, senderId, ...data }}
            ref={container}
          />
        </MessageProvider>
      )}
    </>
  );
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
  const { deleted, image, gif, video, doc, createdGroup, addedToGroup } =
    getMessageType(type);

  const text = message?.text;

  const seen = !!(data?.unSeen === 0);

  const containMedia = image || video || gif;
  const {
    original,
    preview,
    dimensions,
    fileDuration,
    fileName,
    fileSize,
    fileType,
  } = getMediaData(message);

  const reply = !deleted && data?.reply;

  const dispatch = useChatDispatch();
  const replyDispatch=useReplyDispatch()
  const deleteDispatch = useDeleteDispatch();


  const handleMessgeAction = useCallback(
    (action) => {
      switch (action) {
        case "Reply": {
          replyDispatch({
            type: "open",
            payload: {
                from: sender,
                message: {
                  text,
                  type,
                  preview,
                },
                id: messageId,
                isSenderUser,
            
            },
          });
          break;
        }
        case "Delete message": {
          deleteDispatch({
            type: "set state",
            payload: {
              show:true,
              isSenderUser,
              deleted,
              roomId,
              messageId,
            },
          });
          break;
        }

        default: {
        }
      }
    },
    [deleteDispatch, deleted, dispatch, isSenderUser, messageId, preview, roomId, sender, text, type]
  );

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
          {...{ isSenderUser, receiver, roomId, sender, isReceiverUser }}
        />
      </Notification>
    );
  }

  return (
    <Container
      {...{
        messageId,
        sameSender,
        tail,
        doc,
        containMedia,
        incoming,
        reply,
        text,
      }}
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

      <Actions {...{ reply, handleMessgeAction }} />

      {error && <Failed />}
      <div className="absolute flex min-h-0 min-w-0 items-center  w-[101]px t-[calc(50%-10px)] mt-[-13px] justify-end">
        <div className="px-[3px] h-[25px] pb-0 min-h-0 min-w-0 flex-shrink flex-grow-0 pt-0 ">
          <div></div>
        </div>
      </div>
    </Container>
  );
});

export default memo(MessageWrapper,compareProps);
