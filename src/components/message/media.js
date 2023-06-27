import { useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Play } from "../../assets/play.svg";
import { ReactComponent as Upload } from "../../assets/upload.svg";
import { ReactComponent as Video } from "../../assets/video.svg";
import { useModalDispatch } from "../../contexts/modalContext";
import { useMessageMutation } from "../../contexts/mutationContext";
import useMediaFetch from "../../hooks/useMediaFetch";
import { ErrorBoundary } from "../errorBoundary";
import { Progress } from "./loading";

import { timeFormat } from "../../utils";
import  { MEDIA_DEFAULT_DIMENSIONS,MEDIA_MAX_HEIGHT,MEDIA_MIN_HEIGHT} from './defaults'

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
    dimensions = MEDIA_DEFAULT_DIMENSIONS,
    children,
  } = props;

  const image = type.includes("image");
  const gif = type.includes("gif");
  const video = type.includes("video");

  const ModalDispatch = useModalDispatch();

  const mediaRectRef = useRef();
  const imageRectRef = useRef();

  const queryclient = useQueryClient();

  const cacheMedia = useCallback(
    ({ type, data }) => {
      queryclient.setQueryData([roomId, "messages"], (old) => {
        old.messages[messageId].message[type].raw = data;
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

  const width = dimensions.width;
  const height = dimensions.height;
  const aspectRatio = width / height;

  const potrait = aspectRatio <= 1;

  const newWidth = aspectRatio > 1 ? 330 : 240;
  const intrinsicHeight = newWidth / aspectRatio;
  const newHeight =
    aspectRatio < 1
      ? Math.max(MEDIA_MIN_HEIGHT, Math.min(MEDIA_MAX_HEIGHT, intrinsicHeight))
      : intrinsicHeight;
  const newAspectRatio = newWidth / newHeight;

  const newInverseAspectRatio = 1 / newAspectRatio;

  const handleClick = () => {
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
  };

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
              {video && (
                <div
                  className={`absolute   top-0 left-0 w-full h-full flex justify-center pointer-events-none items-center z-[100]`}
                >
                  <div
                    className={`w-[${50}px] h-[${50}px] aspect-square  pointer-events-auto flex justify-center items-center  rounded-[50%]   text-[white]   absolute bg-[rgba(11,20,26,0.7)]`}
                  >
                    <span className="ml-[2px]">
                      <Play />
                    </span>
                  </div>
                </div>
              )}
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
        {video && fileDuration && (
          <span className="text-white left-[6px] bottom-[3px] h-[15px] leading-[15px] absolute z-[100] text-[0.6875rem]">
            <div className="inline-block mr-[3px] mb-[2px] align-top">
              <span>
                <Video viewBox="0 0 16 14" height={14} width={16} />
              </span>
            </div>
            {timeFormat(fileDuration)}
          </span>
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

const Media = (props) => {
  return (
    <ErrorBoundary>
      <MediaMessage {...props} />
    </ErrorBoundary>
  );
};
export default Media;
