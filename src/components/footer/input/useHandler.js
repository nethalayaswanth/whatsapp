import { useCallback, useRef } from "react";
import { useLatest } from "../../../hooks/useLatest";

export default function useHandler({ onSubmit, onChange, onKeyDown }) {
  const inputRef = useRef();
  const onSubmitLatest = useLatest(onSubmit);
  const onChangeLatest = useLatest(onChange);
  const onKeyDownLatest = useLatest(onKeyDown);
  const handleSubmit = useCallback(() => {
    if (!inputRef.current) return;
    const text = inputRef.current.value;
    onSubmitLatest.current?.({ text });
    inputRef.current.value = "";
  }, [onSubmitLatest]);

  const handleChange = useCallback(() => {
    if (!inputRef.current) return;
    const text = inputRef.current.value;
    onChangeLatest.current?.(text);
  }, [onChangeLatest]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Backspace") {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
        return;
      }

      onKeyDownLatest.current?.();
    },
    [handleSubmit, onKeyDownLatest]
  );

  return { handleSubmit, handleChange, inputRef, handleKeyDown };
}
