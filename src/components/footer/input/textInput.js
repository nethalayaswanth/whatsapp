import { forwardRef } from "react";
import { mergeRefs } from "../../../utils";
import InputView from "./input";
import useHandler from "./useHandler";

const TextInput = forwardRef(({ onSubmit, onChange,onKeyDown }, ref) => {
  const { inputRef, ...handlers } = useHandler({
    onSubmit,
    onChange,
    onKeyDown,
  });
  return (
    <>
      <InputView ref={mergeRefs(ref, inputRef)} {...handlers} />
    </>
  );
});

export default TextInput;
