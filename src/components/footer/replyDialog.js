import { FormatEmoji } from "../../shared";
import { useChat } from "../../contexts/chatContext";
import { ReactComponent as Close } from "../../assets/close.svg";

const ReplyDialog = ({}) => {
  const [chatState, chatDispatch] = useChat();
  const blobUrl = chatState?.reply?.blobUrl;

  const text = chatState?.reply?.text;
  const name = chatState?.reply?.name;
  const isSenderUser = chatState?.reply?.isSenderUser;

  const closeReplyModal = () => {
    chatDispatch({ type: "reply", payload: { reply: null } });
  };
  return (
    <div className="bg-panel-header  pt-[5px] flex items-center w-full">
      <div className="overflow-hidden ml-[66px] flex flex-grow bg-panel-deeper ">
        <div className="relative flex flex-grow ">
          <span className="w-[4px] min-w-[4px] bg-message-label-green"></span>
          <div className=" flex flex-grow items-center overflow-hidden  ">
            <div className=" pt-[7px] pr-[12px] pb-[10px] pl-[11px] max-h-[66px] flex flex-grow min-h-[42px] overflow-hidden  ">
              <div className="max-w-500px flex-grow overflow-hidden">
                <div className="inline-flex max-w-[100%] text-[12.8px] font-normal leading-[22px] text-message-label-green">
                  <div className="pl-[2px] ml-[-2px] flex-grow-0 flex-shrink basis-auto text-ellipsis break-words whitespace-pre-wrap">
                    <span> {isSenderUser ? "You" : name}</span>
                  </div>
                </div>
                <div className="max-h-[40px] leading-[20px] text-[13.2px] text-ellipsis break-words whitespace-pre-wrap line-clamp-3 text-message-quoted  ">
                  <span> {text && <FormatEmoji text={text} />}</span>
                </div>
              </div>
            </div>
          </div>
          {blobUrl && (
            <div className="flex-grow-0 flex-shrink-0 overflow-hidden">
              <div
                style={{
                  backgroundImage: `url(${blobUrl})`,
                }}
                className="w-[83px] aspect-[1] bg-cover bg-center relative   "
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className="w-[64px] min-w-[64px] items-center justify-center flex text-panel-header-icon basis-auto ">
        <button
          onClick={closeReplyModal}
          className="flex-grow-0 flex-shrink-0 basis-auto"
        >
          <Close />
        </button>
      </div>
    </div>
  );
};

export default ReplyDialog;
