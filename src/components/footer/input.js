import { forwardRef, useCallback, useRef, useState } from "react";
import Textarea from "react-textarea-autosize";
import { ReactComponent as Send } from "../../assets/send.svg";
import { useFooter } from "../../contexts/footerContext";

export const TextInputView = forwardRef(
  ({ handleSubmit, value, onChange }, ref) => {
    return (
      <div className="flex flex-1 ">
        <Textarea
          className="flex-1 min-h-[20px] min-w-0 text-[15px] font-normal outline-none leading-[20px] will-change-[width] rounded-[8px] my-[5px] mx-[10px] px-[12px] pt-[9px] pb-[11px]  w-[inherit]"
          placeholder="Type a Message"
          id="message"
          name="message"
          maxRows={3}
          ref={ref}
          value={value}
          onChange={onChange}
          style={{
            resize: "none",
            border: 0,
            boxSizing: "border-box",
          }}
        />
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

const TextInput = ({}, ref) => {
  const [footer, setFooterState, onSubmit] = useFooter();

  const handleChange = (event) => {
    setFooterState({ type: "set text", text: event.target.value });
  };

  const handleSubmit = () => {
    if (footer.text.trim().length === 0) {
      return;
    }
    onSubmit?.({
      text: footer.text,
      type: "text",
    });

    setFooterState({
      type: "set state",
      payload: {
        bottomSheetOpened: false,
        gifDialogOpened: false,
        propInputRef: null,
        text: "",
      },
    });
  };
  const setInputRef = useCallback(
    (node) => {
      setFooterState({ type: "set state", payload: { inputRef: node } });
    },
    [setFooterState]
  );

  return (
    <>
      <TextInputView
        ref={setInputRef}
        value={footer.text}
        onChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </>
  );
};

export default forwardRef(TextInput);
