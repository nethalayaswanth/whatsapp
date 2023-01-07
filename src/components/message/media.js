import { useLayoutEffect, useState, useEffect, useRef } from "react";

import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Upload } from "../../assets/upload.svg";
import { Loading, Progress } from "./loading";
import { useChat } from "../../contexts/chatContext";
import { useCallback } from "react";
import useMediaFetch from "../../hooks/useMediaFetch";
import { useMessageMutation } from "../../contexts/mutationContext";
import { useModalDispatch } from "../../contexts/modalContext";
import useHover from "../../hooks/useHover";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

const MAX_HEIGHT = 338.028;
const MIN_HEIGHT = 248;
const DEFAULT_DIMENSIONS = { width: 240, height: (240 * 4) / 3 };

const MediaMessage = (props) => {

  const {
    messageId,
    sending,
    error,
    original: _original,
    preview: _preview,
    fileDuration,
    fileSize,
    fileName,
    text,
    type,
    roomId,
    dimensions = DEFAULT_DIMENSIONS,
    children,
  } = props;
 
 const ModalDispatch= useModalDispatch()

  const mediaRectRef = useRef();
  const imageRectRef = useRef();


  const queryclient = useQueryClient()
  const cacheMedia = useCallback(
    ({ original, preview }) => {

      console.log(roomId)
      queryclient.setQueryData([roomId, "messages"], (old) => {
        if (original) {
          old.messages[messageId].message.original.raw = original;
        }
        if (preview) {
          old.messages[messageId].message.preview.raw = preview;
        }

        return { ...old };
      });
    },
    [messageId, queryclient, roomId]
  );

  const [original, preview, loading] = useMediaFetch({
    original: _original,
    preview: _preview,
    type: type,
    cacheMedia,
  });

  const gif = type?.includes("gif"); 

   
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

  const newInverseAspectRatio = 1/newAspectRatio;

  


  const handleClick =() => {
    ModalDispatch({
      type: "set state",
      payload: {
        opened: true,
        preview: original,
        gif,
        potrait,
        aspectRatio,
        width,
        height,
        activeId: messageId,
        mediaRect: mediaRectRef.current,
      },
    });
  }

  const { cancelMessage, sendMessage } = useMessageMutation();

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
            onClick={handleClick}
            className="h-full w-full absolute top-0 items-center justify-center flex "
          >
            <div
              ref={mediaRectRef}
              className="h-full w-full overflow-hidden relative top-0 items-center justify-center flex "
            >
              <img
                ref={imageRectRef}
                className="w-full z-[2] absolute flex-shrink-0 flex-grow-0 basis-auto"
                alt=""
                src={original}
              />
              <img
                ref={imageRectRef}
                style={{ filter: "blur(10px)" }}
                className="w-full  flex-shrink-0 flex-grow-0 basis-auto"
                alt=""
                src={preview}
              />
            </div>
            {error && (
              <Retry
                fileSize={fileSize}
                onClick={() => {
                  sendMessage();
                }}
              />
            )}
            {sending && (
              <Progress
                onClick={() => {
                  cancelMessage(messageId);
                }}
                id={messageId}
              >
                <Close />
              </Progress>
            )}
          </button>
        </div>
        {!text && (
          <div
            id="image overlay shadow"
            className="absolute bottom-0 w-full z-[100] h-[28px] image-b-gradient text-white"
          ></div>
        )}
      </div>
    </div>
  );
};

const Retry = ({ onClick, fileSize }) => {
  return (
    <div
      onClick={onClick}
      className="flex justify-center items-center absolute h-full w-full top-0 left-0 z-[1000]"
    >
      <div className="rounded-[25px] py-0 pl-[13px] pr-[18px] inline-flex items-center text-white h-[50px] bg-[rgba(11,20,26,0.7)]">
        <Upload />
        <div className="px-[6px]">{fileSize}</div>
      </div>
    </div>
  );
};
export default MediaMessage;

