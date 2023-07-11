import { memo, useCallback, useRef, useState } from "react";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Done } from "../../assets/done.svg";

import { useEffect } from "react";
import ReactCrop from "react-image-crop";

import useResizeObserver from "use-resize-observer";
import useHover from "../../hooks/useHover";
import { generatecroppedImage } from "../../utils";
import Spinner from "../spinner";

const getContainerStyles = ({ container, dimensions }) => {
  if (!container.width || !container.height) return { width: 0, height: 0 };
  const padding = container.width > 630 ? 58 : 0;
  const maxHeight = container.height - padding;
  const maxWidth = container.width - padding;
  const containerAspectRatio = container.width / container.height;
  const aspectRatio = dimensions.aspectRatio;
  const intrinsicHeight = dimensions.height;
  const intrinsicWidth = dimensions.width;

  const landscape = aspectRatio > 1;
  const containerInPotrait = containerAspectRatio <= 1;

  const clampedWidth = Math.min(intrinsicWidth, maxWidth);
  const clampedHeight = Math.min(intrinsicHeight, maxHeight);
  const reducedHeight = clampedWidth / aspectRatio;
  const reducedWidth = clampedHeight * aspectRatio;

  if (containerInPotrait) {
    if (landscape) {
      return { width: clampedWidth, height: reducedHeight };
    } else {
      if (reducedWidth > maxWidth)
        return { width: clampedWidth, height: reducedHeight };
      return { width: reducedWidth, height: clampedHeight };
    }
  } else {
    if (landscape) {
      if (reducedHeight > maxHeight)
        return { width: reducedWidth, height: clampedHeight };
      return { width: clampedWidth, height: reducedHeight };
    } else {
      return { width: reducedWidth, height: clampedHeight };
    }
  }
};

export const ImageCropper = memo(({ file, onSubmit, close }) => {
  const fileRef = useRef(file);
  const blobUrl = useRef(URL.createObjectURL(fileRef.current));

  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
    aspectRatio: 1,
  });

  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });

  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: 400,
    height: 400,
    aspectRatio: 1,
  });

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCroppedAreaPixels(percentCrop);
  }, []);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;

    setDimensions({ width, height, aspectRatio: width / height });

    const x = width > height ? height / 2 : width / 2;

    setLoading(false);
    setCrop({
      unit: "px",
      width: x,
      height: x,
      x: width / 2 - x / 2,
      y: height / 2 - x / 2,
    });
  }, []);

  const handleSubmit = async (event) => {
    try {
      setUploading(true);
      const [original, preview] = await generatecroppedImage({
        src: blobUrl.current,
        crop: croppedAreaPixels,
        quality: 0.66,
      });

      await onSubmit({ original, preview });

      setUploading(false);
    } catch (e) {
      //console.log(e);
    }
  };

  useEffect(() => {
    let url = blobUrl.current;
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const {
    ref: containerRef,
    width: containerWidth,
    height: containerHeight,
  } = useResizeObserver();

  const containerStyles = getContainerStyles({
    container: { width: containerWidth, height: containerHeight },
    dimensions,
  });

  return (
    <div className=" top-0 left-0 right-0 bottom-0 h-full w-full flex flex-col justify-center bg-panel-bg-deeper ">
      <header className="py-0 pr-[20px] pl-[25px] flex flex-none items-center h-[49px] text-white bg-primary-green">
        <button
          onClick={() => {
            close();
          }}
        >
          <Close />
        </button>
      </header>
      <div ref={containerRef} className="edit relative flex-1 flex ">
        <div className="  flex justify-center items-center flex-1  min-h-[520px] max-h-[620px] max-w-full ">
          <div
            style={{
              width: containerStyles.width,
              height: containerStyles.height,
            }}
            className="flex justify-center items-center relative max-h-full"
          >
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={onCropComplete}
              keepSelection={true}
              aspect={1}
              circularCrop={true}
              style={{
                position: "relative",
                display: "flex",

                height: "100%",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
              minHeight={120}
              minWidth={120}
            >
              <img
                className="max-h-full max-w-full w-full"
                onLoad={onImageLoad}
                src={blobUrl.current}
                alt=""
              />
            </ReactCrop>
          </div>
          <div
            style={{ opacity: loading ? 1 : 0 }}
            className="absolute top-0 left-0 pointer-events-none w-full h-full justify-center items-center flex"
          >
            <Spinner />
          </div>
        </div>
      </div>
      <div className="pt-0 px-[20px] pb-[6px] relative justify-center items-center z-[3] bg-panel flex min-h-[49px]">
        <span>
          <div className=" top-0 left-[auto] right-[40px] mt-[-30px] absolute">
            <button
              onClick={handleSubmit}
              className="w-[60px] h-[60px] rounded-full p-0 flex items-center justify-center text-[14px] font-normal text-[white] bg-primary-green"
            >
              <span className="flex justify-center items-center ">
                {uploading ? <Spinner /> : <Done />}
              </span>
            </button>
          </div>
        </span>
      </div>
    </div>
  );
});

export const DpUpload = ({
  children,
  src,
  onFileSelect,
  text = " Change Profile Picture",
}) => {
  const [ref, isHovering] = useHover();

  const inputRef = useRef();
  const handleClick = () => {
    inputRef.current.click();
  };
  
  
console.log(isHovering);
  return (
    <div className="flex-none my-[28px] flex justify-center ">
      <div
        ref={ref}
        className="mx-[auto] animate-pop  w-[200px] h-[200px] relative "
      >
        <div className="cursor-pointer mx-[auto] bg-center rounded-full relative overflow-hidden h-full w-full">
          <div className="absolute z-[500] flex object-contain justify-center  top-0 left-0 h-full w-full">
            {src ? <img src={src} alt="" /> : children}
          </div>
          <span>
            {(isHovering || !src) && (
              <div
                onClick={handleClick}
                className="absolute t-0 l-0 w-full h-full flex uppercase flex-col justify-center items-center pt-[15px] rounded-full leading-[1.2] text-[0.8125rem] bg-[rgba(84,101,111,0.7)] text-[rgba(255,255,255,0.8)] z-[1000]"
              >
                <div className="w-[100px] break-words text-center">{text}</div>
              </div>
            )}
          </span>
          <input
            ref={inputRef}
            onChange={onFileSelect}
            type="file"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
