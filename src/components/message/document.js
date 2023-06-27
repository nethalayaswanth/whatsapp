import { useEffect, useState, useRef } from "react";
import document from "../../assets/document.png";
import { ReactComponent as Download } from "../../assets/download.svg";
import { ReactComponent as Upload } from "../../assets/uploadOutline.svg";
import { useMessageMutation } from "../../contexts/mutationContext";
import { Progress } from "./loading";

import { ReactComponent as Close } from "../../assets/closeThin.svg";
import useMediaFetch from "../../hooks/useMediaFetch";

export default function DocMessage({
  fileSize,
  type,
  messageId,
  fileName,
  className,
  sending,
  error,
  original,
  preview,
}) {
  const [originalUrl, previewUrl, loading] = useMediaFetch({original,preview,type})


  const { cancelMessage, sendMessage } = useMessageMutation();

  return (
    <div
      className={`z-[1] rounded-[6px] overflow-hidden  relative  max-w-full ${
        className && className
      }`}
    >
      <div className=" cursor-pointer overflow-hidden   w-full  m-0 flex flex-col justify-center">
        <div className=" w-full flex-col relative flex overflow-hidden">
          <div className="bg-[color:var(--deeper)] rounded-[7.5px]  py-[13px] px-[19px]  flex flex-1 flex-col justify-center min-h-0 min-w-0">
            <div className="h-[34px]  flex  items-center">
              <div className="min-w-0 flex-grow-0 flex-shrink-0 basis-auto ">
                <div
                  style={{
                    backgroundImage: `url(${document})`,
                  }}
                  className="h-[30px] w-[26px] bg-cover "
                ></div>
              </div>
              <div className="mx-[10px] flex-1 text-ellipsis overflow-hidden whitespace-nowrap top-[-2px] relative ">
                <span>{fileName && fileName}</span>
              </div>
              <div className="min-w-0 min-h-0 flex-0  text-panel-header-icon  text-opacity-[0.5] ">
                <div className="h-[34px] w-[34px] flex justify-center items-center relative">
                  {sending ? (
                    <Progress
                      onClick={() => {
                        cancelMessage(messageId);
                      }}
                      id={messageId}
                      bg="transparent"
                      width={34}
                    >
                      <Close />
                    </Progress>
                  ) : error ? (
                    <Upload
                      onClick={() => {
                        sendMessage();
                      }}
                    />
                  ) : (
                    <a
                      href={originalUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <Download />
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="cursor-pointer whitespace-nowrap text-[0.6875rem] h-[15px] text-message-timestamp-read leading-[15px]  pl-[6px] pr-[4px]">
            <span>{fileSize && fileSize}</span>
            <span className=" mx-[4px] text-opacity-[0.5] text-message-timestamp-read">
              •
            </span>
            <span> {type && type.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
