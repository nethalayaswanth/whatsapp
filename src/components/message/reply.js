import { FormatEmoji } from "../../shared";

const Reply = ({ name, text, url, color, replyMessageId }) => {
  const handleClick = () => {
    const replyDom = document.getElementById(replyMessageId);

    if (replyDom) {
      replyDom.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      const prevStyles = replyDom.style;

      replyDom.style.animation = "fadeIn 0.3s cubic-bezier(.1,.82,.25,1) 0.8s";
      replyDom.onanimationend = () => {
        replyDom.style = prevStyles;
      };
    }
  };

  return (
    <div
      onClick={handleClick}
      className="w-full  cursor-pointer mb-[3px]"
      style={{ "--label": color }}
    >
      <div className="bg-[color:var(--deeper)] rounded-[7.5px] relative flex overflow-hidden">
        <span className="w-[4px] rounded-tl-[7.5px] rounded-bl-[7.5px] flex-none  bg-[color:var(--label)]"></span>
        <div className="pt-[4px] pr-[12px] pb-[8px] pl-[8px] flex items-center flex-grow min-h-[42px] max-h-[82px] overflow-hidden">
          <div className="flex-grow-1 overflow-hidden">
            <div className="inline-flex max-w-full text-[12.8px] font-medium leading-[22px] text-[color:var(--label)] ">
              <span className="pl-[2px] ml-[-2px] flex-grow-0 flex-shrink basis-auto ">
                {name}
              </span>
            </div>
            <div className="leading-[20px] overflow-hidden max-h-[60px] text-[13.2px] text-ellipsis break-words whitespace-pre-wrap line-clamp-3 text-message-quoted ">
              <span>
                <FormatEmoji text={text} />
              </span>s
            </div>
          </div>
        </div>
        {url && (
          <div className="flex-grow-0 flex-shrink-0 basis-auto overflow-hidden">
            <div
              style={{
                backgroundImage: `url(${url})`,
              }}
              className="h-[full] aspect-[1] bg-cover bg-center relative w-[58px]  "
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reply;
