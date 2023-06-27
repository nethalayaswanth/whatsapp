
import { ReactComponent as Send } from "../../../assets/send.svg";

export function SubmitButton({handleSubmit}={}) {
  return (
    <div className="py-[5px] px-[10px] w-[37px] flex items-center justify-center min-h-[52px]">
      <button
        onClick={handleSubmit}
        className="flex-shrink-0 basis-auto flex-grow-0 text text-panel-header-icon"
      >
        <Send />
      </button>
    </div>
  );
}
