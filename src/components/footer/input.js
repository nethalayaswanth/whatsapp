import { forwardRef, useCallback, useRef, useState } from "react";
import Textarea from "react-textarea-autosize";
import { ReactComponent as Send } from "../../assets/send.svg";
import { useFooter } from "../../contexts/footerContext";
import useDisclosure from "../../hooks/useDisclosure";


import EmojiPicker from "../PropPickers/emojiPicker";
import useResizeObserver from "use-resize-observer";
import { ReactComponent as Emoji } from "../../assets/emoji.svg";
import { ReactComponent as Close } from "../../assets/close.svg";
import { mergeRefs } from "../../utils";

export const TextInputView = forwardRef(
  ({ handleSubmit,className, onKeyDown, value, onChange,children }, ref) => {

    
    return (
      <div className={`flex flex-1 ${className?className:''} `}>
        <div className="flex-1 flex min-h-[20px] min-w-0 text-[15px] font-normal outline-none leading-[20px] will-change-[width] rounded-[8px] my-[5px] mx-[10px]  w-[inherit]">
          {children}
          <Textarea
            className="w-full min-h-[20px] min-w-0 text-[15px] font-normal outline-none leading-[20px] will-change-[width] rounded-[8px]  px-[12px] pt-[9px] pb-[11px] "
            placeholder="Type a Message"
            id="message"
            name="message"
            maxRows={3}
            ref={ref}
            // onChange={onChange}
            style={{
              resize: "none",
              border: 0,
              boxSizing: "border-box",
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="py-[5px] px-[10px] w-[37px] flex items-center justify-center min-h-[52px]">
          <button
            onClick={handleSubmit}
            className="flex-shrink-0 basis-auto flex-grow-0 text text-panel-header-icon"
          >
            <Send />
          </button>
        </div>
      </div>
    );
  }
);


export const PropTextInput = forwardRef(({ handleSubmit, inputRefCb }, ref) => {
  const inputRef = useRef();
  const [mountEmojiPicker, setEmojiPicker] = useState(false);

  const refCb = useCallback(
    (node) => {

  
      mergeRefs(inputRefCb, inputRef)(node);

      
    },
    [inputRefCb]
  );

  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: mountEmojiPicker,
    direction: "bottom",
    onCollapseEnd: () => {
      // setFooterState({ type: "reset" });
    },
  });

  const handleEmojiSelect = useCallback((value, emojiObject) => {
    const emoji = value.native;
    const input = inputRef.current;
    const start = input?.selectionStart;
    const end = input?.selectionEnd;
    input.setSelectionRange(start, start);

    const splitted = input.value.split("");

    splitted.splice(start, end - start, emoji);

    input.value = splitted.join("");
    input.focus();
    input.setSelectionRange(start + emoji.length, start + emoji.length);
  }, []);

  const {
    ref: resizeRef,
    width: resizeWidth,
    height: resizeHeight,
  } = useResizeObserver();

  return (
    <>
      <div className="absolute top-0 bg-panel-header  left-0 w-full">
        <div ref={resizeRef} className="absolute   left-0 bottom-0 w-full">
          {mount && (
            <div
              {...getParentProps({
                style: {
                  height: "100%",
                  width: "100%",
                  overflow: "hidden",
                },
              })}
            >
              <div
                {...getDisclosureProps()}
                className={`rounded-[8px] rounded-b-none bg-panel-header
                  
                 `}
              >
                <EmojiPicker width={resizeWidth} onSelect={handleEmojiSelect} />
              </div>
            </div>
          )}
        </div>
      </div>

      <TextInputView
        className={`bg-panel-header rounded-[8px] transition-[border-radius ] ${
          mount ? "rounded-tl-none rounded-t-none " : ""
        }`}
        ref={refCb}
        handleSubmit={handleSubmit}
      >
        <button
          onClick={() => {
            setEmojiPicker((x) => !x);
          }}
          setEmojiPicker
          className="mr-[8px] last:mr-0 p-0 outline-none border-0 cursor-pointer h-full  transition-all duration-300"
        >
          {mountEmojiPicker ? <Close /> : <Emoji />}
        </button>
      </TextInputView>
    </>
  );
});

const TextInput = ({}, ref) => {
  const [footer, setFooterState, onSubmit, onKeyDown] = useFooter();

  const handleChange = useCallback((event) => {
    // setFooterState({ type: "set text", text: event.target.value });
  },[]);

  const handleSubmit = useCallback(() => {

    const input = footer.inputRef;
     const text = input.value;
    if (text.trim().length === 0) {
      return;
    }

  
    onSubmit?.({
      text: text,
      type: "text",
    });

    input.value=''

    // setFooterState({
    //   type: "set state",
    //   payload: {
    //     bottomSheetOpened: false,
    //     gifDialogOpened: false,
    //     propInputRef: null,
    //   },
    // });
  },[footer.inputRef, onSubmit]);

  const handleKeyDown=useCallback((e)=>{

    if(e.key==='Backspace'){
      return 
    }

    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit();
      return
    }

    onKeyDown?.()


  },[handleSubmit, onKeyDown])
  
  const setInputRef = useCallback(
    (node) => {
      setFooterState({ type: "set inputRef",  inputRef: node  });
    },
    [setFooterState]
  );

  return (
    <>
      <TextInputView
        ref={setInputRef}
        onChange={handleChange}
        handleSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      />
    </>
  );
};

export default forwardRef(TextInput);
