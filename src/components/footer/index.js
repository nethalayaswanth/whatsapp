import { cloneElement, useCallback, useMemo } from "react";

import { useFooter } from "../../contexts/footerContext";
import EmojiPicker from "../PropPickers/emojiPicker";
import GifPicker from "../PropPickers/gifPicker";

import { useChat } from "../../contexts/chatContext";
import useCollapse from "../../hooks/useCollapse";
import { useUser } from "../../requests.js/useRequests";

import useMedia from "../../hooks/useMedia";
import useTransition from "../../hooks/useTransition";
import AccordionMenu from "./accordionMenu";
import Attachment from "./attachment";
import GifMessage from "./gifMessage";
import TextInput from "./input";
import ReplyDialog from "./replyDialog";

export const Button = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="mr-[8px] last:mr-0 p-0 outline-none border-0 cursor-pointer h-full absolute top-0 left-0 transition-all duration-300"
    >
      {children}
    </button>
  );
};

const Footer = ({ onSubmit, onKeyDown }) => {
  const [footer, setFooterState] = useFooter();

  const [chatState, chatDispatch] = useChat();

  const { Toggle, getCollapseProps } = useCollapse({
    isExpanded: !!chatState.reply,
  });

  const { data: {user} } = useUser();

  const handleGifSelect = useCallback(
    (gif) => {
      setFooterState({
        type: "set state",
        payload: { gifSelected: gif, gifDialogOpened: true },
      });
    },
    [setFooterState]
  );

  const handleEmojiSelect = useCallback(
    (value, emojiObject) => {
      const emoji = value.native;
      const input = footer.inputRef;

      const start = input?.selectionStart;
      const end = input?.selectionEnd;

      const splitted = footer.text.split("");
      splitted.splice(start, end - start, emoji);

      setFooterState({
        type: "set text",
        text: splitted.join(""),
      });
    },
    [footer, setFooterState]
  );

  const tabs = useMemo(() => {
    return {
      emoji: { component: <EmojiPicker />, handler: handleEmojiSelect },
      gif: { component: <GifPicker />, handler: handleGifSelect },
      sticker: {
        component: <GifPicker sticker={true} />,
        handler: handleGifSelect,
      },
      attachment: { component: <Attachment />, handler: handleEmojiSelect },
    };
  }, [handleEmojiSelect, handleGifSelect]);

  const isSenderUser = chatState?.reply?.from === user.id;

  const activeTab = tabs[footer.activeTab];
  const bottomSheetOpened = footer.bottomSheetOpened;

  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: bottomSheetOpened,
    direction: "bottom",
  });

  const device = useMedia({
    breakPoints: [740, 540, 420],
    breakPointValues: ["xl", "l", "sm"],
    defaultValue: "xs",
  });
  const mobile = device === "xs";

 
  return (
    <>
      <div className="relative flex-none w-full min-h-[62px] z-[20] cursor-pointer bg-panel-header order-3 ">
        <div className="pr-[17px] pl-[10px] pt-[3px] border-l border-solid border-border-header">
          <span>
            <div className="flex  min-h-0 flex-1 text-input-placeHolder">
              {
                <div
                  // style={{ ...(mobile && { position: "absolute" }) }}
                  className="px-[5px] py-[10px]  mr-[-10px] flex items-center justify-center min-h-[52px] text-panel-header-icon"
                >
                  <AccordionMenu />
                </div>
              }
              {mobile ? (
                !bottomSheetOpened ? (
                  <TextInput />
                ) : null
              ) : (
                <TextInput />
              )}
            </div>
          </span>
        </div>
        <div className="absolute top-0 bg-panel-header  left-0 w-full">
          {
            <div id="bottomSheet" className="absolute  left-0 bottom-0 w-full">
              {mount && (
                <div
                  {...getParentProps({
                    style: {
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    },
                  })}
                >
                  {" "}
                  <div {...getDisclosureProps()} className="bg-panel-header">
                    {mobile && bottomSheetOpened && <TextInput />}
                    {activeTab &&
                      cloneElement(activeTab.component, {
                        onSelect: activeTab.handler,
                      })}
                  </div>
                </div>
              )}
              <div
                {...getCollapseProps({
                  style: { width: "100%", height: "100%", overflow: "hidden" },
                })}
              >
                <ReplyDialog />
              </div>
            </div>
          }
        </div>
      </div>

      <GifMessage />
    </>
  );
};

export default Footer;
