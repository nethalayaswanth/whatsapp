import { useCallback } from "react";
import { useMessage } from "../../queries.js/messages";
import DocContainer from "../message/document";

const DocWrapper = ({ messageId, user, roomId }) => {
  const { data } = useMessage({ messageId, roomId });


  const status = data?.status;
  const sending = status?.sending;
  const error = status?.error;
  const message = data?.message;
  const original = message?.original;
  const preview = message?.preview;

  const type = message?.type;

  const fileName = message?.fileName;
  const fileSize = message?.fileSize;

  const sender = message?.from;
  const incoming = sender !== user?.id;
  return (
    <div
      id={data?.id}
      className={`message ${
        incoming ? "incoming" : ""
      } px-[6.5%] mb-[12px] w-full flex relative flex-col select-text`}
    >
      <div
        id="msg-container"
        className="mb-0  max-w-full relative flex-none text-[14.2px] leading-[19px] text-message-primary "
      >
        <div
          className={`rounded-[7.5px] ${
            incoming ? "rounded-tl-[0]" : "rounded-tr-[0]"
          } relative z-[200] bg-[color:var(--bg)] shadow-md`}
        >
          <div className={`p-[3px] flex-col justify-center relative `}>
            <DocContainer
              {...{
                fileSize,
                type,
                messageId,
                fileName,
                sending,
                error,
                original,
                preview,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default function Documents({ documents, user, roomId }) {
  const handleClick = useCallback(() => {}, []);

  //console.log(documents, roomId);
  return (
    <div className="w-full  flex flex-col">
      <div className="flex flex-grow flex-wrap justify-center  py-[30px]  overflow-y-scroll">
        {documents &&
          documents.length !== 0 &&
          documents.reverse().map((messageId, i) => {
            return (
              <DocWrapper
                user={user}
                roomId={roomId}
                key={messageId}
                onClick={handleClick}
                messageId={messageId}
              />
            );
          })}
      </div>
    </div>
  );
}
