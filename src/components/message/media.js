import { useLayoutEffect, useState, useEffect, useRef } from "react";

import { ReactComponent as Close } from "../../assets/close.svg";
import { Loading } from "./loading";
import { useChat } from "../../contexts/chatContext";
import { useCallback } from "react";
import useMediaFetch from "../../hooks/useMediaFetch";

const MAX_HEIGHT = 338.028;
const MIN_HEIGHT = 248;

const MediaMessage = ({
  src,
  id,
  sending,
  dimensions = { width: 240, height: (240 * 4) / 3 },
  children,
  loading,url
}) => {
  const [chatState, chatDispatch] = useChat();

  const blobUrl = useRef();
  const mediaRectRef = useRef();
  const imageRectRef = useRef();

  const width = dimensions.width;
  const height = dimensions.height;
  const aspectRatio = width / height;

  const potrait = aspectRatio <= 1;

  const newWidth = aspectRatio > 1 ? 330 : 240;
  const intrinsicHeight = newWidth / aspectRatio;
  const newHeight =
    aspectRatio < 1
      ? Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, intrinsicHeight))
      : intrinsicHeight;
const newAspectRatio = newWidth / newHeight;
  
  const newInverseAspectRatio = newHeight / newWidth;

  const gif = src.type.includes("gif");


  const handleClick = useCallback(() => {
    chatDispatch({
      type: "set state",
      payload: {
        imageModalOpened: true,
        imageModal: {
          previewBlob: url,
          src,
          potrait,
          aspectRatio:newAspectRatio,
          width,height,
          activeId: id,
          mediaRect: mediaRectRef.current,
        },
      },
    });
  }, [chatDispatch, url, src, potrait, newAspectRatio, width, height, id]);

  return (
    <div className="z-[1] rounded-[6px] overflow-hidden  relative max-w-[336px] ">
      <div
        style={{ width: `${newWidth}px` }}
        className=" cursor-pointer overflow-hidden items-center max-w-[100%]  m-0 flex justify-center"
      >
        <div
          style={{ paddingTop: `${newInverseAspectRatio * 100}%` }}
          className="h-full w-full relative"
        >
          <button
            ref={mediaRectRef}
            onClick={handleClick}
            className="h-full w-full absolute top-0 items-center justify-center flex "
          >
            <img
              ref={imageRectRef}
              style={{ ...(loading && { filter: "blur(10px)" }) }}
              className="w-full  flex-shrink-0 flex-grow-0 basis-auto"
              alt=""
              src={url}
            />
            {(sending || loading) && !gif && <Loading />}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default MediaMessage;
