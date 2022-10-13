import { ReactComponent as Tick } from "../../assets/tick.svg";
import { ReactComponent as Down } from "../../assets/down.svg";
import { ReactComponent as TailIn } from "../../assets/tail.svg";
import { ReactComponent as TailOut } from "../../assets/tailOut.svg";
import { ReactComponent as Timer } from "../../assets/clock.svg";

import useHover from "../../hooks/useHover";
import Disclosure from "../Disclosure";
import ToolTip from "../tooltip";
import { MenuContainer } from "../Menu";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import useCollapse from "../../hooks/useCollapse";
import { useChat } from "../../contexts/chatContext";
import { useUser } from "../../requests.js/useRequests";
import { formatDate, callAll } from "../../utils";
import { FormatEmoji } from "../../shared";
import { useQueryClient } from "@tanstack/react-query";
import Reply from "./reply";
import Media from "./media";
import Doc from "./document";
import { useObjectUrl } from "../../hooks/useObjectUrl";
import { set } from "react-hook-form";
import useMediaFetch from "../../hooks/useMediaFetch";
import usePressAndHold from "../../hooks/usePressAndHold";

export const Text = ({ text, time, incoming, sending }) => {
  return (
    <>
      <div className={`pt-[6px] pr-[7px] pb-[8px] pl-[9px] select-text `}>
        <div className="relative break-words whitespace-pre-wrap ">
          <span className="visibile select-text">
            <span>
              <FormatEmoji text={text} />
            </span>
          </span>
          <span className="inline-block align-middle w-[75px]"></span>
        </div>
      </div>
    </>
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
const Options = () => {
  return (
    <div
      className={`right-[5px] top-[5px] cursor-pointer absolute w-[18px] h-[18px] pointer-events-auto text-white`}
    >
      <span>
        <Down />
      </span>
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

const Message = ({ children, className, message: data, tail }) => {
  const [ref, value] = useHover();

  const [mountChildren, setMountChildren] = useState(true);

  const { Toggle, getCollapseProps } = useCollapse({
    collapseWidth: true,
    onExpandStart() {
      setMountChildren(true);
    },
    onCollapseEnd() {
      setMountChildren(false);
    },
  });

  const bind=usePressAndHold((enable)=>{if(enable){console.log(enable);Toggle(enable);}},1000)

  useLayoutEffect(() => {
    Toggle(value);
  }, [Toggle, value]);

  const [chatState, chatDispatch] = useChat();

  const { data: {user} } = useUser();

  const queryClient = useQueryClient();

  const isSenderUser = data?.from === user?.id;
  const otherUser = queryClient.getQueryData(["user", data?.from]);

  const sender = isSenderUser ? user : otherUser;

  const incoming = data?.from !== user?.id;
  const sending = data?.loading;
  const time = incoming ? data?.deliveredTime : data?.sendTime;
  const timestamp = time ? formatDate(time) : null;
  const reply = data?.reply;
  const type = data?.message?.type;
  const image = type?.includes("image");
  const gif = type?.includes("image/gif");
  const video = type?.includes("video");
  const doc = type?.includes("doc");
  const text = data?.message?.text;
  const message = data?.message;
  const id = data?.id;
  const conatainMedia = image || video;
  const hasFiles = message?.files;
  const files = hasFiles ? message?.files : false;
  const mediaDimensions = message?.dimensions;
  const url = conatainMedia || doc ? message?.url : null;
  const previewUrl = conatainMedia || doc ? message?.previewUrl : null;
  const fileName = message?.fileName;
  const fileSize = message?.fileSize;
  const fileType = message?.fileType;

  const replyText = reply?.text;

  const replyMessageId = reply?.messageId;

  const replyMediaUrl = reply?.previewurl;

  const fileUrls = useObjectUrl({ files: files });

  const src = useMemo(
    () => ({
      url: url || fileUrls?.[0],
      previewUrl: previewUrl || fileUrls?.[1],
      type,
    }),
    [fileUrls, previewUrl, type, url]
  );

  const [original, preview, loading] = useMediaFetch({ src });

  const blobUrl = video ? preview : original || preview;



  const handleMessgeAction = useCallback(
    ({ name }) => {
      switch (name) {
        case "Reply": {
          chatDispatch({
            type: "reply",
            payload: {
              reply: {
                text: message.text,
                name: sender?.name,
                from: sender?.id,
                messageId: id,
                type: message?.type,
                previewurl: message?.previewUrl,
                url: message?.url,
                blobUrl: blobUrl,
              },
            },
          });

          break;
        }

        default: {
        }
      }
    },
    [
      blobUrl,
      chatDispatch,
      id,
      message?.previewUrl,
      message.text,
      message?.type,
      message?.url,
      sender?.id,
      sender?.name,
    ]
  );

  return (
    <div
      id={data?.id}
      className={`message ${incoming ? "incoming" : ""} ${
        conatainMedia ? "image" : ""
      } px-[6.5%] mb-[12px]  flex relative flex-col select-text`}
    >
      <div
        {...bind()}
        id="msg-container"
        ref={ref}
        className={`mb-0  max-w-[85%] ${reply ? "min-w-[180px]" : ""}   ${
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
            {reply && (
              <Reply
                text={replyText}
                replyMessageId={replyMessageId}
                name={reply?.name}
                url={replyMediaUrl}
              />
            )}
            {doc && (
              <Doc
                url={blobUrl}
                name={fileName}
                size={fileSize}
                type={fileType}
              />
            )}
            {conatainMedia && (
              <Media
                src={src}
                sending={sending}
                loading={loading}
                id={data.id}
                url={blobUrl}
                dimensions={mediaDimensions}
              >
                {!text && (
                  <div
                    id="image overlay shadow"
                    className="absolute bottom-0 w-full z-[100] h-[28px] image-b-gradient text-white"
                  ></div>
                )}
              </Media>
            )}

            {text && (
              <Text
                text={text}
                time={timestamp?.time}
                incoming={incoming}
                sending={sending}
                reply={reply}
              />
            )}

            <div className="absolute bottom-[3px] right-[5px] mt-[-12px] mr-0 ml-[4px]  z-[10] ">
              <div
                className={`cursor-pointer whitespace-nowrap text-[0.6875rem] h-[15px] leading-[15px]  ${
                  conatainMedia && !text
                    ? "text-white text-opacity-[0.9]"
                    : "text-message-timestamp-read"
                }`}
              >
                <span className="inline-block text-center align-top">
                  {timestamp?.time}
                </span>
                {!incoming && (
                  <div className="ml-[3px] inline-block text-message-icon">
                    <span className={` ${sending ? " " : "text-bubble-read"}`}>
                      {sending ? <Timer /> : <Tick />}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <span>
            <div
              className={`absolute z-[800] right-[3px] pointer top-[3px] w-[42px] max-w-[90%] h-[27px] overflow-hidden pointer-events-none text-bubble-icon ${
                value && !reply && "down"
              }  `}
            >
              <div className="right-[5px] top-[5px]  cursor-pointer absolute  h-[18px] pointer-events-auto ">
                <ToolTip
                  Button={
                    <div
                      {...getCollapseProps({
                        style: {
                          width: "100%",
                          height: "100%",

                          overflow: "hidden",
                          position: "relative",
                          right: 0,
                        },
                      })}
                    >
                      <Down />
                    </div>
                  }
                >
                  {({ closeToolTip }) => (
                    <MenuContainer
                      items={messageActions}
                      onClick={callAll(handleMessgeAction, closeToolTip)}
                    />
                  )}
                </ToolTip>
              </div>
            </div>
          </span>
        </div>
        <div className="absolute flex min-h-0 min-w-0 items-center  w-[101]px t-[calc(50%-10px)] mt-[-13px] justify-end">
          <div className="px-[3px] h-[25px] pb-0 min-h-0 min-w-0 flex-shrink flex-grow-0 pt-0 ">
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
