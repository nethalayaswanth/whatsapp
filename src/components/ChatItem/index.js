import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import moment from "moment";
import Disclosure from "../Disclosure";
import { ReactComponent as Down } from "../../assets/down.svg";
import useHover from "../../hooks/useHover";
import { formatDate } from "../../utils";
import ToolTip from "../tooltip";
import { MessageActions } from "../Menu";
import useCollapse from "../../hooks/useCollapse";
import { useLayoutEffect, useState } from "react";
import { FormatEmoji } from "../../shared";
import { ReactComponent as Photo } from "../../assets/photo.svg";
import { ReactComponent as Video } from "../../assets/video.svg";
import { ReactComponent as DocIcon } from "../../assets/docIcon.svg";
export const ChatTitle = ({ name, time,style ,className}) => {
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
        {time && time.day}
      </div>
    </div>
  );
};

const ChatItem = ({ data, onClick, last }) => {
  const handleClick = () => {
    onClick?.(data);
  };


  
  
  const details = data?.lastMessage;
  const message = data?.lastMessage?.message
  const lastMessageText = message?.text;
  const time = details?.deliveredTime ? formatDate(details.deliveredTime) : null;

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

  const lastMessage =
    lastMessageType.length !== 0 ? lastMessageTypes[lastMessageType[0]] : null;

  const [ref, value] = useHover();
  const unread = data?.unread;
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

  useLayoutEffect(() => {
    Toggle(value);
  }, [Toggle, value]);

  return (
    <div ref={ref} onClick={handleClick} className="w-full  h-[72px]">
      <div className="h-full cursor-pointer flex relative flex-row pointer-events bg-white">
        <div className="flex">
          <div className="flex items-center pl-[15px] pr-[13px]">
            <div className="h-[49px] w-[49px] rounded-full">
              <DefaultAvatar />
            </div>
          </div>
        </div>
        <div
          className={`pr-[15px] border-t-[1px] ${
            last && "border-b-[1px]"
          }   border-solid border-border-list flex flex-col basis-auto  justify-center min-w-0 flex-grow `}
        >
          <div className="flex items-center leading-normal text-left ">
            <div
              className={`flex leading-normal ${
                !unread ? `font-regular` : `font-medium`
              } text-left text-[17px] text-primary-strongest flex-grow overflow-hidden break-words`}
            >
              <span className="inline-block overflow-hidden text-ellipsis whitespace-nowrap flex-grow relative ">
                {data.name}
              </span>
            </div>
            <div
              className={`ml-[6px] mt-[3px] text-[12px] text-ellipsis whitespace-nowrap overflow-hidden leading-[14px] flex-none ${
                !unread ? `` : `text-unread-timestamp`
              } max-w-full`}
            >
              {time && time.day}
            </div>
          </div>
          <div className="font-normal flex items-center min-h-[20px] text-[13px] leading-[20px] text-secondary-stronger ">
            <div
              className={`${
                !unread ? `font-regular` : `font-medium`
              } overflow-hidden text-[13px] leading-[20px] flex-grow text-ellipsis whitespace-nowrap text-left`}
            >
              {lastMessage && lastMessage.icon && (
                <div className="inline-block align-top flex-none text-bubble-icon">
                  <span>{lastMessage.icon}</span>
                </div>
              )}

              <span> {lastMessage && lastMessage.text}</span>
            </div>
            <div className="flex-none flex justify-center items-center max-w-full text-[12px] text-bubble-icon leading-[20px] ml-[6px]  font-semibold">
              {unread !== 0 && (
                <span>
                  <div className="mr-[0px] inline-block align-top ">
                    <span className="px-[0.4em] pt-[0.3em] inline-block pb-[0.4em] text-[0.75rem] leading-[1] min-h-[1em] min-w-[1.7em] rounded-[1.1em] font-semibold text-center text-white bg-unread-timestamp ">
                      {unread}
                    </span>
                  </div>
                </span>
              )}
              <span>
                <ToolTip
                  align="left"
                  Button={
                    <div
                      {...getCollapseProps({
                        style: {
                          width: "100%",
                          height: "100%",
                          marginRight: "6px",
                          overflow: "hidden",
                        },
                      })}
                    >
                      <Down />
                    </div>
                  }
                >
                  <MessageActions />
                </ToolTip>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
