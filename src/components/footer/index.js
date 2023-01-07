import { cloneElement, useCallback, useMemo } from "react";

import { useFooter } from "../../contexts/footerContext";
import EmojiPicker from "../PropPickers/emojiPicker";
import GifPicker from "../PropPickers/gifPicker";

import { useChat } from "../../contexts/chatContext";
import useCollapse from "../../hooks/useCollapse";
import { useUser } from "../../queries.js/useRequests";

import { forwardRef } from "react";
import useResizeObserver from "use-resize-observer";
import useDisclosure from "../../hooks/useDisclosure";
import useMedia from "../../hooks/useMedia";
import AccordionMenu from "./accordionMenu";
import Attachment from "./attachment";
import TextInput from "./input";
import PreviewModal from "./previewModal";
import ReplyDialog from "./replyDialog";
import { createPortal } from "react-dom";

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
  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: isExpanded,
    direction: "bottom",

    onCollapseEnd: () => {
      // setFooterState({ type: "reset" });
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

const Footer = forwardRef(({footer, onSubmit, onKeyDown }, ref) => {
  const [footerState, setFooterState] = useFooter();

  const [chatState, chatDispatch] = useChat();


    console.log("%cfooter", "color:blue");


  const { Toggle, getCollapseProps } = useCollapse({
    isExpanded: !!chatState.reply,
  });

  const { data: user } = useUser();

  const handleGifSelect = useCallback(
    (gif) => {
      setFooterState({
        type: "set state",
        payload: { file: gif, fileType: "gif", previewDialogOpened: true },
      });
    },
    [setFooterState]
  );

  const handleEmojiSelect = useCallback(
    (value, emojiObject) => {
      const emoji = value.native;
      const input = footerState.inputRef;
      const start = input?.selectionStart;
      const end = input?.selectionEnd;
      input.setSelectionRange(start, start);

      const splitted = input.value.split("");

      splitted.splice(start, end - start, emoji);

      input.value = splitted.join("");
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    },
    [footerState.inputRef]
  );


  const bottomSheetOpened = footerState.bottomSheetOpened;
  const attachmentDialogOpened = footerState.attachmentDialogOpened;


  const { ref: resizeRef, width, height } = useResizeObserver();

  const device = useMedia({
    breakPoints: [740, 540, 420],
    breakPointValues: ["xl", "l", "sm"],
    defaultValue: "xs",
    width,
  });

   
  const tabs = useMemo(() => {
    return {
      emoji: <EmojiPicker onSelect={handleEmojiSelect} width={width} />,

      gif:  <GifPicker onSelect={handleGifSelect} width={width} />,
    
      sticker: 
          <GifPicker
            key={"sticker"}
            sticker={true}
            onSelect={handleGifSelect}
            width={width}
          />
      }
  }, [handleEmojiSelect, handleGifSelect, width]);

  
  const activeTab = tabs[footerState.activeTab];
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
              {<AccordionMenu mobile={mobile} />}
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
            <div ref={footer} id="bottomSheet" className={` bg-panel-header`}>
              {footerState.bottomSheetMounted && (
                <>
                  {mobile && bottomSheetOpened && <TextInput />}
                  {activeTab}
                </>
              )}
            </div>
          </div>
          <div
            {...getCollapseProps({
              style: {
                width: "100%",
                height: "100%",
                overflow: "hidden",
              },
            })}
          >
            <ReplyDialog />
          </div>
        </div>
        <AttachmentDialog isExpanded={attachmentDialogOpened} />
      </div>
      <PreviewModal />
    </>
  );
});

export default Footer;
