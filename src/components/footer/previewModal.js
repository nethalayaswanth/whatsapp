import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Crop } from "../../assets/crop.svg";
import { ReactComponent as Done } from "../../assets/done.svg";
import { ReactComponent as Document } from "../../assets/page.svg";
import useDisclosure from "../../hooks/useDisclosure";
import { PropTextInput } from "./input";

import {
  useFooterDispatch,
  useFooterState,
} from "../../contexts/footerContext";

import { useMemo } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import useResizeObserver from "use-resize-observer";
import { createImage, createVideo, generatecroppedImage } from "../../utils";
import Spinner from "../spinner";

const Cropper = ({ onCropComplete, children, editMode, src }) => {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 96,
    height: 96,
    x: 2,
    y: 2,
  });

  return (
    <>
      {editMode ? (
        <div className="edit flex flex-col items-center h-full max-h-full max-w-full justify-center">
          <div className="flex justify-center h-full relative">
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              keepSelection={true}
              onComplete={onCropComplete}
              style={{
                maxHeight: "100%",
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
              minHeight="220px"
              minWidth="220px"
            >
              <div className="w-full h-full flex justify-center">
                <img src={src} alt="" />
              </div>
            </ReactCrop>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
};

const PreviewModalWrapper = forwardRef(({}, ref) => {
  const footer = useFooterState();
  const setFooterState = useFooterDispatch();

  const file = footer.file;

  const image = file.type.includes("image");
  const video = file.type.includes("video");
  const gif = file.type.includes("gif");
  const doc = footer.fileType === "doc";

  const blobUrl = useRef();

  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState();

  const [videoDetails, setvideoDetails] = useState();

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

  const payload = useRef();

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCroppedAreaPixels(percentCrop);
  }, []);

  const setInputRef = useCallback(
    (node) => {
      setFooterState({ type: "set state", payload: { propInputRef: node } });
    },
    [setFooterState]
  );

  const closeBottomSheet = () => {
    setFooterState({
      type: "set state",
      payload: {
        text: "",
        bottomSheetOpened: false,
        previewDialogOpened: false,
      },
    });
  };

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
      //console.log(e);
    }
  };

  const handleSubmit = async () => {
    try {
      let files = payload.current;
      let _dimensions = croppedDimensions || dimensions;
      if (gif) {
        closeBottomSheet();
        // onSubmit?.({
        //   text: footer.propInputRef.value,
        //   type: "gif",
        //   original: { url: file?.original },
        //   preview: { url: file?.preview },
        //   fileSize: formatFileSize(file.size),
        //   dimensions: _dimensions,
        // });

        return;
      }

      if (doc) {
        closeBottomSheet();
        // onSubmit?.({
        //   text: footer.text,
        //   type: footer.fileType,
        //   original: { raw: file },
        //   fileName: file.name,
        //   fileSize: formatFileSize(file.size),
        //   fileType: file.name.split(".").pop(),
        // });

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
      // onSubmit?.({
      //   text: footer.propInputRef.value,
      //   type: file.type,
      //   ...files,
      //   fileSize: formatFileSize(files.original.raw.size),
      //   fileType: file.name.split(".").pop(),
      //   ...(video && { fileDuration: videoDetails.duration }),
      //   dimensions: _dimensions,
      // });
    } catch (e) {
      //console.log(e);
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
          const image = await createImage(blobUrl.current);
          setPreview(blobUrl.current);
        }
      } catch (e) {
        //console.log(e);
      }
    })();
  }, [gif, image, video]);

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

  const {
    ref: containerRef,
    width: containerWidth,
    height: containerHeight,
  } = useResizeObserver();

  const getContainerStyles = () => {
    if (!containerWidth || !containerHeight) return { width: 0, height: 0 };
    const padding = containerWidth > 630 ? 58 : 0;
    const maxHeight = containerHeight - padding;
    const maxWidth = containerWidth - padding;
    const containerAspectRatio = containerWidth / containerHeight;

    const aspectRatio = currentDimensions.aspectRatio;
    const intrinsicHeight = currentDimensions.height;
    const intrinsicWidth = currentDimensions.width;

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
  };

  const containerStyles = getContainerStyles();

  return (
    <>
      <div className="flex  item-center justify-between px-[18px] py-[8px] min-h-[44px] bg-panel-bg-deeper">
        <button
          className="p-[8px] rounded-full active:bg-icon-active justify-self-start text-panel-header-icon "
          onClick={() => {
            setFooterState({ type: "toggle previewDialog" });
          }}
        >
          <Close />
        </button>
        <div className="flex">
          {image && (
            <button
              className={`p-[8px] rounded-full active:bg-icon-active justify-self-start  text-panel-header-icon ${
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
              className={`p-[8px] ml-[8px]  rounded-full bg-icon-active  active:bg-icon-active hover:bg-icon-active  text-panel-header-icon `}
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
        <div
          ref={containerRef}
          className="relative justify-center my-[16px] flex flex-1 flex-col max-h-full items-center  max-w-full"
        >
          <div
            style={{
              width: containerStyles.width,
              height: containerStyles.height,
            }}
            className="relative  "
          >
            <div
              className={` overflow-hidden  z-[2] flex  h-full w-full items-center justify-center`}
            >
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
                <Cropper
                  editMode={editMode}
                  src={preview}
                  onCropComplete={onCropComplete}
                >
                  <img
                    className={`h-full w-full`}
                    alt=""
                    src={croppedImage || preview}
                  />
                </Cropper>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex z-[100]   px-[16px] py-[8px] min-h-[56px] items-center justify-center text-input-placeHolder">
        <div className="w-[full] flex items-center flex-1 justify-center max-w-[650px] relative ">
          <PropTextInput handleSubmit={handleSubmit} ref={setInputRef} />
        </div>
      </div>
    </>
  );
});

const Doc = ({ size, extension }) => {
  return (
    <div className="relative justify-center px-[20px] py-[20px] flex-1 items-center flex max-h-full max-w-full">
      <div className="w-[80%] aspect-[1] max-w-[280px] flex justify-center flex-col items-center p-[30px] rounded-[10px] bg-panel-header ">
        <div className="mb-[10px]">
          <Document />
        </div>
        <div className="my-[10px]">
          <span>No Preview Available</span>
        </div>
        <div className="text-[0.875rem]">
          {`${size} - ${extension.toUpperCase()}`}
        </div>
      </div>
    </div>
  );
};

const PreviewModal = ({ ...props }, ref) => {
  const gifOverlay = useMemo(() => document.getElementById("main-overlay"), []);
  const footer = useFooterState();
  const setFooterState = useFooterDispatch();

  const open = footer.previewDialogOpened;

  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: open,
    direction: "bottom",
    onCollapseEnd: () => {
      setFooterState({ type: "reset previewDialog" });
    },
  });

  const doc = footer.fileType === "doc";

  return (
    <>
      {mount &&
        createPortal(
          <div className="w-full h-full overflow-hidden pointer-events-auto border-l  border-solid border-border-header absolute top-0 left-0 ">
            <div
              {...getParentProps({
                style: { width: "100%", height: "100%", overflow: "hidden" },
              })}
            >
              <div
                {...getDisclosureProps()}
                className="h-[calc(100%-var(--panel-header))] flex flex-grow flex-col  bg-white w-full"
              >
                <PreviewModalWrapper {...props} ref={ref} />
              </div>
            </div>
          </div>,
          gifOverlay
        )}
    </>
  );
};

export default forwardRef(PreviewModal);
