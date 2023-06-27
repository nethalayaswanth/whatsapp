import { useRef, useCallback } from "react";
import { ThumbView } from "../carousel/thumb";
import { useChat } from "../../contexts/chatContext";
import { useModalDispatch } from "../../contexts/modalContext";

export default function Gallery({ media, roomId,length }) {
  const modalDispatch=useModalDispatch()

  const handleClick = useCallback(
    ({ id, preview, width,gif, height, aspectRatio, mediaRect }) => {
      modalDispatch({
        type: "set state",
        payload: {
          opened: true,
          preview,
          aspectRatio,
          width,
          height,
          gif,
          activeId: id,
          mediaRect
        },
      });
    },
    [modalDispatch]
  );

  const items = length?media.slice(0, length):media
  
  return (
    <>
      {items && items.length!==0 &&
        items.map((messageId, i) => {
          return (
            <ThumbView
              roomId={roomId}
              key={messageId}
              onClick={handleClick}
              messageId={messageId}
              className="min-w-[0px] w-[29%] xs:w-[29%]  aspect-[1] h-[auto] xs:h-[auto]  "
            />
          );
        })}
      {Array(6)
        .fill(0)
        .map((_, i) => {
          return <div key={i} className="w-[29%] lg:w-[29%] mr-[6px]"></div>;
        })}
    </>
  );
}
