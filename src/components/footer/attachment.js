import { useRef } from "react";

import { ReactComponent as Camera } from "../../assets/camera.svg";
import { ReactComponent as Document } from "../../assets/document.svg";
import { ReactComponent as Photos } from "../../assets/photos.svg";

import { useFooterDispatch } from "../../contexts/footerContext";

const Attachment = () => {
  const photosInputRef = useRef();
  const documentInputRef = useRef();
  const fileRef = useRef();
  const handleClick = (input, type) => {
    input.current.click();
    fileRef.current = type;
  };

  const setFooterState = useFooterDispatch();

  const onSelectFile = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > 1024 * 1024 * 15) {
        //console.log("file size is larger than 15MB");
        return;
      }
      setFooterState({
        type: "set state",
        payload: {
          file: file,
          fileType: fileRef.current,
          previewDialogOpened: true,
        },
      });
    }
  };

  return (
    <div className="rounded-t-[6px]  relative overflow-hidden">
      <div className="pt-[7px] pr-[12px] pb-[10px] pl-[11px] m-[6px] bg-white rounded-[6px]  flex flex-grow flex-row flex-wrap justify-center min-h-[42px] overflow-hidden ">
        <div className="flex flex-col  justify-center items-center mr-[10px] w-[min-content]">
          <Camera className="w-[40px] h-[40px]" />
          <span className="text-[12px] leading-[18px] text-center break-words">
            Camera
          </span>
        </div>
        <button
          onClick={() => handleClick(photosInputRef, "media")}
          className="flex flex-col justify-center items-center  mr-[10px] w-[min-content]"
        >
          <Photos className="w-[40px] h-[40px]" />
          <span className="text-[12px] leading-[18px]  text-center break-words">
            {" "}
            Photos&Videos
          </span>
          <input
            ref={photosInputRef}
            onChange={onSelectFile}
            className="hidden"
            type="file"
            accept="video/*,image/*"
          />
        </button>
        <div className="flex flex-col justify-center items-center mr-[10px] w-[min-content]">
          <button
            onClick={() => handleClick(documentInputRef, "doc")}
            className="flex flex-col justify-center items-center  mr-[10px] w-[min-content]"
          >
            <Document className="w-[40px] h-[40px]" />
            <span className="text-[12px] leading-[18px] text-center break-words">
              Document
            </span>
            <input
              ref={documentInputRef}
              onChange={onSelectFile}
              className="hidden"
              type="file"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attachment;
