import { FormatEmoji } from "../../shared";

export default function Text({ text, children }){
  return (
    <>
      <div className={`pt-[6px] pr-[7px] pb-[8px] pl-[9px] select-text `}>
        <div className="relative break-words whitespace-pre-wrap ">
          {children ? (
            children
          ) : (
            <span className="visibile select-text">
              <span className="">
                <FormatEmoji text={text} />
              </span>
            </span>
          )}
          <span className="inline-block align-middle w-[75px]"></span>
        </div>
      </div>
    </>
  );
};
