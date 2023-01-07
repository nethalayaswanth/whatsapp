

import { ReactComponent as Recalled } from "../../assets/recalled.svg";

export default function Deleted({ isSenderUser }) {
  return (
    <div className={`pt-[6px] pr-[7px] pb-[px] pl-[9px] select-text `}>
      <div className="relative break-words whitespace-pre-wrap ">
        <span className="inline-flex items-center justify-center text-secondary-lighter min-h-0 min-w-0">
          <div className="inline-block min-w-[24px]  text-opacity-[0.35]  flex-grow-0 basis-auto mr-[7px]">
            <span>
              <Recalled />
            </span>
          </div>
          <span className="italic text-secondary-lighter">
            {isSenderUser
              ? "You deleted this message"
              : "This message was deleted"}
          </span>
        </span>
        <span className="inline-block align-middle w-[75px]"></span>
      </div>
    </div>
  );
};
    