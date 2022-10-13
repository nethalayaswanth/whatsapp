import { useRef, useCallback } from "react";
import { ThumbView } from "../carousel/thumb";
import { useChat } from "../../contexts/chatContext";
import DocContainer from "../message/document";
import { useUser } from "../../requests.js/useRequests";

const DocWrapper = ({ data, user }) => {
  const message = data?.message;
  const fileName = message?.fileName;
  const fileSize = message?.fileSize;
  const fileType = message?.fileType;
  const url = message?.url;

  const incoming = data?.from !== user?.id;


  console.log(fileName, fileSize, fileType,url);
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
              url={url}
              name={fileName}
              size={fileSize}
              type={fileType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default function Documents({ documents }) {
  const [chatState, chatDispatch] = useChat();

  const { data: {user} } = useUser();

  const handleClick = useCallback(() => {}, []);

  return (
    <div className="w-full  flex flex-col">
      <div className="flex flex-grow flex-wrap justify-center  py-[30px]  overflow-y-scroll">
        {documents &&
          Object.keys(documents).length !== 0 &&
          Object.keys(documents)
            .reverse()
            .map((messageId, i) => {
               
              return <DocWrapper user={user} data={documents[messageId]} />;
            })}
      </div>
    </div>
  );
}
