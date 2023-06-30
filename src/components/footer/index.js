import { cloneElement, useCallback, useRef } from "react";

import {
  useFooterDispatch,
  useFooterState,
} from "../../contexts/footerContext";
import EmojiPicker from "../PropPickers/emojiPicker";

import { forwardRef } from "react";
import useResizeObserver from "use-resize-observer";
import useDisclosure from "../../hooks/useDisclosure";
import useMedia from "../../hooks/useMedia";
import GifPicker from "../PropPickers/gifPicker";
import { useMessageHandler } from "../chat/messageHandlerProvider";
import Attachment from "./attachment";
import { TextInput } from "./input";
import Preview from "./preview";
import ReplyDialog from "./replyDialog";
import ToolBar from "./toolbar";
import { useReplyDispatch } from "../../contexts/replyContext";

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

export const AttachmentDialog = ({ isExpanded }) => {
  const setFooterState = useFooterDispatch();
  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: isExpanded,
    direction: "bottom",

    onCollapseEnd: () => {
      setFooterState({ type: "reset attachment" });
    },
  });
  return (
    <>
      {mount && (
        <div className="absolute z-index-[5]  left-0 bottom-0 w-full">
          <div {...getParentProps()} className="h-full w-full overflow-hidden">
            <div {...getDisclosureProps()}>
              <Attachment />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Footer = forwardRef(({ footer }, ref) => {
  const footerState = useFooterState();
  const setFooterState = useFooterDispatch();
  const replyDispatch=useReplyDispatch()
  const inputRef = useRef();

  const {
    activeTab,
    bottomSheetOpened,
    bottomSheetMounted,
    attachmentDialogOpened,
  } = footerState;

  const { onSubmit, handleTyping } = useMessageHandler();
  console.log("%cfooter", "color:blue");

  const handleSubmit = useCallback(
    ({ text }) => {
      onSubmit({ text, type: "text" });

      setFooterState({
        type: "set state",
        payload: { text: "" },
      });
      replyDispatch({type:'reset'})
    },
    [onSubmit,replyDispatch, setFooterState]
  );

  const handleInputChange = useCallback(
    (value) => {
      setFooterState({
        type: "set state",
        payload: { text: value},
      });
    },
    [setFooterState]
  );

  const handleGifSelect = useCallback(
    (gif) => {
      setFooterState({
        type: "set state",
        payload: { file: gif, fileType: "gif", previewDialogOpened: true },
      });
    },
    [setFooterState]
  );

  const handleEmojiSelect = useCallback((value) => {
    const emoji = value.native;
    const input = inputRef.current;
    if (!input) return;
    const start = input?.selectionStart;
    const end = input?.selectionEnd;
    input.setSelectionRange(start, start);
    const splitted = input.value.split("");
    splitted.splice(start, end - start, emoji);

    input.value = splitted.join("");
    input.focus();
    input.setSelectionRange(start + emoji.length, start + emoji.length);
  }, []);

  const { ref: resizeRef, width, height } = useResizeObserver();

  const device = useMedia({
    breakPoints: [740, 540, 420],
    breakPointValues: ["xl", "l", "sm"],
    defaultValue: "xs",
    width,
  });

  const tabs = {
    emoji: {
      component: EmojiPicker,
      props: { onSelect: handleEmojiSelect, width },
    },
    gif: {
      component: GifPicker,
      props: { onSelect: handleGifSelect, width },
    },
    sticker: {
      component: GifPicker,
      props: {
        onSelect: handleGifSelect,
        width,
        key: "sticker",
        sticker: true,
      },
    },
  };

  const currentTab = tabs[activeTab];
  const mobile = device === "xs";

  return (
    <>
      <div
        ref={resizeRef}
        className=" w-full min-h-[62px]  cursor-pointer bg-panel-header  "
      >
        <div className="pr-[17px] pl-[10px] pt-[3px] border-l border-solid border-border-header">
          <span>
            <div className="flex  min-h-0 flex-1 text-input-placeHolder">
              {<ToolBar mobile={mobile} />}
              {mobile ? (
                !bottomSheetOpened ? (
                  <TextInput
                    ref={inputRef}
                    onSubmit={handleSubmit}
                    onChange={handleInputChange}
                    onKeyDown={handleTyping}
                  />
                ) : null
              ) : (
                <TextInput
                  ref={inputRef}
                  onSubmit={handleSubmit}
                  onChange={handleInputChange}
                  onKeyDown={handleTyping}
                />
              )}
            </div>
          </span>
        </div>
      </div>
      <div className="absolute top-0 bg-panel-header  left-0 w-full">
        <div className="absolute   left-0 bottom-0 w-full">
          <div
            style={{
              height: "100%",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <div
              ref={footer}
              id="footer-bottomSheet"
              className={` bg-panel-header`}
            >
              {bottomSheetMounted && (
                <>
                  {mobile && bottomSheetOpened && (
                    <TextInput
                      ref={inputRef}
                      onSubmit={handleSubmit}
                      onChange={handleInputChange}
                      onKeyDown={handleTyping}
                    />
                  )}
                  {cloneElement(<currentTab.component />, {
                    ...currentTab.props,
                  })}
                </>
              )}
            </div>
          </div>
          <ReplyDialog />
        </div>
        <AttachmentDialog isExpanded={attachmentDialogOpened} />
      </div>
      <Preview />
    </>
  );
});

export default Footer;
