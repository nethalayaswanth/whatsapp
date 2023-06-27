import { forwardRef, useCallback, useState } from "react";
import useDisclosure from "../../../hooks/useDisclosure";

import useResizeObserver from "use-resize-observer";
import { mergeRefs } from "../../../utils";
import EmojiPicker from "../../PropPickers/emojiPicker";
import { ReactComponent as Close } from "../../../assets/close.svg";
import { ReactComponent as Emoji } from "../../../assets/emoji.svg";
import InputView from "./input";
import useHandler from "./useHandler";

 const EmojiTextInput = forwardRef(({ onSubmit,onChange,onKeyDown }, ref) => {
  const [mountEmojiPicker, setEmojiPicker] = useState(false);

  const { inputRef, ...handlers } = useHandler({
    onSubmit,
    onChange,
    onKeyDown,
  });

  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: mountEmojiPicker,
    direction: "bottom",
  });

  const handleEmojiSelect = useCallback(
    (value) => {
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
    },
    [inputRef]
  );

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

      <InputView
        className={`bg-panel-header rounded-[8px] transition-[border-radius] ${
          mount ? "rounded-tl-none rounded-t-none " : ""
        }`}
        ref={mergeRefs(ref, inputRef)}
        {...handlers}
      >
        <button
          onClick={() => {
            setEmojiPicker((x) => !x);
          }}
          className="mr-[8px] last:mr-0 p-0 outline-none border-0 cursor-pointer h-full  transition-all duration-300"
        >
          {mountEmojiPicker ? <Close /> : <Emoji />}
        </button>
      </InputView>
    </>
  );
});


export default EmojiTextInput;
