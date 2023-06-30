import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactComponent as Close } from "../../../assets/close.svg";
import { ReactComponent as Crop } from "../../../assets/crop.svg";
import { ReactComponent as Done } from "../../../assets/done.svg";

import {
  useFooterDispatch,
  useFooterState,
} from "../../../contexts/footerContext";

import "react-image-crop/dist/ReactCrop.css";
import useResizeObserver from "use-resize-observer";
import {
  createImage,
  createVideo,
  formatFileSize,
  generatecroppedImage,
} from "../../../utils";
import { useMessageHandler } from "../../chat/messageHandlerProvider";
import Spinner from "../../spinner";
import { EmojiTextInput } from "../input";
import Cropper from "./cropper";
import Doc from "./docPreview";
import { useReplyDispatch } from "../../../contexts/replyContext";

const PreviewModalWrapper = forwardRef(({}, ref) => {
  const inputRef = useRef();
  const blobUrl = useRef();

  const payload = useRef();

  const footer = useFooterState();
  const setFooterState = useFooterDispatch();
  const replyDispatch=useReplyDispatch()

  const file = footer.file;

  const image = file.type.includes("image");
  const video = file.type.includes("video");
  const gif = file.type.includes("gif");
  const doc = footer.fileType === "doc";

  const [videoDetails, setvideoDetails] = useState();
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState();

  const [preview, setPreview] = useState(() => {
    if (gif) {
      blobUrl.current = file.original;
      return file.preview;
    }

    blobUrl.current = URL.createObjectURL(file);
    return blobUrl.current;
  });

  const [dimensions, setDimensions] = useState({
    width: file.dimensions?.width ?? 0,
    height: file.dimensions?.height ?? 0,
    aspectRatio: file.dimensions?.aspectRatio ?? 1,
  });

  const [croppedDimensions, setCroppedDimensions] = useState(
    video ? undefined : dimensions
  );

  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  const [croppedImage, setCroppedImage] = useState();


  const currentDimensions = editMode || !image ? dimensions : croppedDimensions;

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCroppedAreaPixels(percentCrop);
  }, []);

  const closeBottomSheet = () => {
    setFooterState({
      type: "set state",
      payload: {
        text: "",
        bottomSheetOpened: false,
        previewDialogOpened: false,
        attachmentDialogOpened:false
      },
    });
    replyDispatch({type:'reset'})
  };

  const { onSubmit, handleTyping } = useMessageHandler();
  const handleEdit = async (event) => {
    try {
      const [croppedFile, previewFile] = await generatecroppedImage({
        src: preview,
        crop: croppedAreaPixels,
      });

      payload.current = {
        original: { raw: croppedFile },
        preview: { raw: previewFile },
      };

      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
      const croppedUrl = URL.createObjectURL(croppedFile);

      const { width, height, aspectRatio } = await createImage(croppedUrl);

      setCroppedImage(croppedUrl);
      setCroppedDimensions({
        width,
        height,
        aspectRatio,
      });
      setEditMode(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async ({ text }) => {
    try {
      let files = payload.current;
      let _dimensions = croppedDimensions || dimensions;
      if (gif) {
        closeBottomSheet();
        onSubmit?.({
          text: text,
          type: "gif",
          original: { url: file?.original },
          preview: { url: file?.preview },
          fileSize: formatFileSize(file.size),
          dimensions: _dimensions,
        });

        return;
      }

      if (doc) {
        closeBottomSheet();
        onSubmit?.({
          text: text,
          type: footer.fileType,
          original: { raw: file },
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: file.name.split(".").pop(),
        });

        return;
      }

      if (!files && image) {
        const [croppedFile, previewFile] = await generatecroppedImage({
          src: preview,
          crop: croppedAreaPixels,
        });
        files = {
          original: { raw: croppedFile },
          preview: { raw: previewFile },
        };

        const croppedUrl = URL.createObjectURL(croppedFile);

        const { width, height, aspectRatio } = await createImage(croppedUrl);
        _dimensions = {
          width,
          height,
          aspectRatio,
        };
      }

      if (video) {
        files = {
          original: { raw: file },
          preview: { raw: videoDetails.thumbnail },
        };
      }
      closeBottomSheet();
      onSubmit?.({
        text: text,
        type: file.type,
        ...files,
        fileSize: formatFileSize(files.original.raw.size),
        fileType: file.name.split(".").pop(),
        ...(video && { fileDuration: videoDetails.duration }),
        dimensions: _dimensions,
      });
    } catch (e) {
      console.log(e);
    }
  };

  useLayoutEffect(() => {
    (async () => {
      try {
        if (video) {
          const { thumbnail, width, height, aspectRatio, duration } =
            await createVideo(blobUrl.current);

          setDimensions({
            width,
            height,
            aspectRatio,
          });
          setvideoDetails({ thumbnail, duration });
          setLoading(false);

          return;
        }

        if (image) {
          const image = await createImage(blobUrl.current);

          const { width, height, aspectRatio } = image;
          setDimensions({
            width,
            height,
            aspectRatio,
          });

          setCroppedDimensions({
            width,
            height,
            aspectRatio,
          });
          return;
        }

        if (gif) {
          setPreview(blobUrl.current);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [gif, image, video]);

  useLayoutEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.value = footer.text;
  }, [footer]);

  useLayoutEffect(() => {
    return () => {
      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
    };
  }, [croppedImage]);

  useLayoutEffect(() => {
    return () => {
      if (blobUrl.current) {
        URL.revokeObjectURL(blobUrl.current);
      }
    };
  }, []);

  return (
    <>
      <div className="flex  item-center justify-between px-[18px] py-[8px] min-h-[44px] bg-panel-bg-deeper">
        <button
          className="p-[8px]  rounded-full active:bg-icon-active justify-self-start text-panel-header-icon "
          onClick={() => {
            setFooterState({ type: "toggle previewDialog" });
          }}
        >
          <Close />
        </button>
        <div className="flex">
          {image && (
            <button
              className={`p-[8px] rounded-full active:bg-icon-active  justify-self-start  text-panel-header-icon ${
                editMode && "bg-icon-active"
              }`}
              onClick={() => {
                setEditMode((x) => !x);
              }}
            >
              <Crop />
            </button>
          )}
          {editMode && (
            <button
              className={`p-[8px] ml-[8px]  rounded-full  bg-icon-active  active:bg-icon-active   text-panel-header-icon `}
              onClick={handleEdit}
            >
              <Done />
            </button>
          )}
        </div>
      </div>

      {doc ? (
        <Doc size={file.size} extension={file.name.split(".").pop()}></Doc>
      ) : (
        <MediaContainer {...currentDimensions}>
          {video ? (
            <>
              <Spinner
                style={{
                  visibility: loading ? "visible" : "hidden",
                }}
                alt=""
              />
              {!loading && (
                <video
                  className="absolute z-[1] top-0 left-0 h-full w-full "
                  controls={true}
                  src={preview}
                />
              )}
            </>
          ) : (
            <>
              <Cropper
                editMode={editMode}
                src={preview}
                onCropComplete={onCropComplete}
              ></Cropper>
              <img
                className={`h-full w-full`}
                alt=""
                src={croppedImage || preview}
              />
            </>
          )}
        </MediaContainer>
      )}
      <div className="flex z-[100]   px-[16px] py-[8px] min-h-[56px] items-center justify-center text-input-placeHolder">
        <div className="w-[full] flex items-center flex-1 justify-center max-w-[650px] relative ">
          <EmojiTextInput
            onSubmit={handleSubmit}
            ref={inputRef}
            onKeyDown={handleTyping}
          />
        </div>
      </div>
    </>
  );
});

const MediaContainer = ({
  children,
  aspectRatio,
  height: intrinsicHeight,
  width: intrinsicWidth,
}) => {
  const {
    ref: containerRef,
    width: containerWidth,
    height: containerHeight,
  } = useResizeObserver();

  const { width, height } = useMemo(() => {
    if (!containerWidth || !containerHeight) return { width: 0, height: 0 };
    const padding = containerWidth > 630 ? 58 : 0;
    const maxHeight = containerHeight - padding;
    const maxWidth = containerWidth - padding;
    const containerAspectRatio = containerWidth / containerHeight;

    const landscape = aspectRatio > 1;
    const screenInPotrait = containerAspectRatio <= 1;

    const clampedWidth = Math.min(intrinsicWidth, maxWidth);
    const clampedHeight = Math.min(intrinsicHeight, maxHeight);
    const reducedHeight = clampedWidth / aspectRatio;
    const reducedWidth = clampedHeight * aspectRatio;

    if (screenInPotrait) {
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
  }, [
    aspectRatio,
    containerHeight,
    containerWidth,
    intrinsicHeight,
    intrinsicWidth,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative justify-center my-[16px] flex flex-1 flex-col max-h-full items-center  max-w-full"
    >
      <div
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={` overflow-hidden relative  z-[2] flex  h-full w-full items-center justify-center`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PreviewModalWrapper;
