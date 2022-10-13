import { useRef, useCallback } from "react";
import { ThumbView } from "../carousel/thumb";
import { useChat } from "../../contexts/chatContext";

export default function Gallery({ media }) {
  const [chatState, chatDispatch] = useChat();

  const handleClick = useCallback(
    ({ id, preview, src, potrait,width,height, imgRect }) => {
      chatDispatch({
        type: "set state",
        payload: {
          imageModalOpened: true,
          imageModal: {
            previewBlob: preview,
            src,
            potrait,
            width,height,
            activeId: id,
            mediaRect: imgRect,
          },
        },
      });
    },
    [chatDispatch]
  );

  return (
    <>
      {media &&
        media.map((data, i) => {
          const src = data.message;
          return (
            <ThumbView
              key={data.id}
              onClick={handleClick}
              src={src}
              id={data.id}
              className="min-w-[0px] w-[29%] lg:w-[29%] aspect-[1] h-[auto]  "
            />
          );
        })}
      {Array(6)
        .fill(0)
        .map((_,i) => {
          return <div key={i} className="w-[29%] lg:w-[29%] mr-[6px]"></div>;
        })}
    </>
  );
}
