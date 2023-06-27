import { ReactComponent as Close } from "../../assets/close.svg";
import { useChatDispatch, useChatState } from "../../contexts/chatContext";
import useCollapse from "../../hooks/useCollapse";
import { FormatEmoji } from "../../shared";
import { ErrorBoundary } from "../errorBoundary";

const ReplyDialog = ({}) => {
  const state = useChatState();
  const dispatch = useChatDispatch();
  console.log(state);
  const reply = state?.reply;

  const text = reply?.message?.text;
  const previewUrl = reply?.message?.preview?.url;
  const name = reply?.from?.name;
  const isSenderUser = reply?.isSenderUser;

  const closeReplyModal = () => {
    dispatch({ type: "reply", payload: { reply: null } });
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
                <div className="max-h-[40px] leading-[20px] text-[13.2px] text-ellipsis break-words whitespace-pre-wrap line-clamp-1 text-message-quoted  ">
                  <span> {text && <FormatEmoji text={text} />}</span>
                </div>
              </div>
            </div>
          </div>
          {previewUrl && (
            <div className="flex-grow-0 flex-shrink-0 overflow-hidden">
              <div
                style={{
                  backgroundImage: `url(${previewUrl})`,
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

const ReplyDialogWrapper = () => {
  const state = useChatState();

  const open= state.reply
  const { Toggle, getCollapseProps } = useCollapse({
    isExpanded: !!open,
  });
  return (
    <div
      {...getCollapseProps({
        style: {
          width: "100%",
          height: "100%",
          overflow: "hidden",
        },
      })}
    >
      <ErrorBoundary>
        <ReplyDialog />
      </ErrorBoundary>
    </div>
  );
};

export default ReplyDialogWrapper;
