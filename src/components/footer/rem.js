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
import { PropTextInput, TextInputView } from "./input";

import { useFooter } from "../../contexts/footerContext";

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  createImage,
  createVideo,
  formatFileSize,
  generatecroppedImage,
} from "../../utils";

const PreviewModalWrapper = forwardRef(({}, ref) => {
  const blobUrl = useRef();

  const thumbnail = useRef();

  const [footer, setFooterState, onSubmit, onKeyDown] = useFooter();

  const file = footer.file;

  const image = file.type.includes("image");
  const video = file.type.includes("video");
  const gif = file.type.includes("gif");
  const createPreview = () => {
    if (gif) {
      blobUrl.current = file.original;
      return file.preview;
    }

    blobUrl.current = URL.createObjectURL(file);
    return blobUrl.current;
  };

  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState();

  const [preview, setPreview] = useState(createPreview);

  //console.log(file, preview, blobUrl.current, file.dimensions?.aspectRatio);

  const [dimensions, setDimensions] = useState({
    width: file.dimensions?.width ?? 1,
    height: file.dimensions?.height ?? 1,
    ascpectRatio: file.dimensions?.aspectRatio ?? 1,
  });

  const [croppedDimensions, setCroppedDimensions] = useState(dimensions);

  const [crop, setCrop] = useState({
    unit: "%",
    width: 96,
    height: 96,
    x: 2,
    y: 2,
  });

  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  const [croppedImage, setCroppedImage] = useState();

  const currentDimensions = editMode ? dimensions : croppedDimensions;

  const potrait = currentDimensions.ascpectRatio <= 0.75;

  const payload = useRef();

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCroppedAreaPixels(percentCrop);
  }, []);

  const setInputRef = useCallback(
    (node) => {
      setFooterState({ type: "set propInputRef", propInputRef: node });
    },
    [setFooterState]
  );

  const handleEdit = async (event) => {
    try {
      const [croppedFile, previewFile] = await generatecroppedImage({
        imageSrc: { url: preview, ...dimensions },
        crop: croppedAreaPixels,
      });

      payload.current = { original: croppedFile, preview: previewFile };

      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
      const croppedUrl = URL.createObjectURL(croppedFile);

      //console.log(croppedUrl, URL.createObjectURL(previewFile));

      const { naturalWidth, naturalHeight, ascpectRatio } = await createImage(
        croppedUrl
      );
      const height = 320;
      const width = height * ascpectRatio;
      setCroppedImage(croppedUrl);
      setCroppedDimensions({ width, height, ascpectRatio });
      setEditMode(false);
    } catch (e) {
      //console.log(e);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!payload.current && file.type.includes("image")) {
        const [croppedFile, previewFile] = await generatecroppedImage({
          imageSrc: { preview, ...dimensions },
          crop: croppedAreaPixels,
        });

        payload.current = { original: croppedFile, preview: previewFile };
      }

      if (file.type.includes("video")) {
        payload.current = { original: file, preview: thumbnail.current };
      }

      const files = payload.current;
      onSubmit?.({
        text: footer.text,
        type: file.type,
        files,
        dimensions: {
          width: croppedDimensions.width,
          height: croppedDimensions.height,
        },
      });

      setFooterState({
        type: "set state",
        payload: {
          text: "",
          bottomSheetOpened: false,
          previewModalOpened: false,
        },
      });
    } catch (e) {
      //console.log(e);
    }
  };

  useLayoutEffect(() => {
    (async () => {
      try {
        if (video) {
          const { thumbnail, width, height, ascpectRatio } = await createVideo(
            blobUrl.current
          );
          setDimensions({
            width,
            height,
            ascpectRatio,
          });
          setCroppedDimensions({ width, height, ascpectRatio });

          thumbnail.current = thumbnail;
          return;
        }

        if (image) {
          const image = await createImage(blobUrl.current);

          const { naturalWidth, naturalHeight, ascpectRatio } = image;
          const height = 320;
          const width = height * ascpectRatio;
          setDimensions({ width, height, ascpectRatio });
          setCroppedDimensions({ width, height, ascpectRatio });
          return;
        }

        if (gif) {
          const image = await createImage(blobUrl.current);
          const { naturalWidth, naturalHeight, ascpectRatio } = image;
          const height = 320;
          const width = height * ascpectRatio;

          //console.log(width, height, ascpectRatio);
          setPreview(blobUrl.current);
          setDimensions({ width, height, ascpectRatio });
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

      <div className="relative justify-center px-[20px] py-[20px] flex-1 flex max-h-full max-w-full">
        <div className="absolute px-[20px] py-[20px] top-0 left-0 w-full h-full max-h-full max-w-full flex items-center justify-center ">
          <div
            style={{
              aspectRatio: currentDimensions.ascpectRatio,
            }}
            className={`relative max-h-full flex justify-center  max-w-full  ${
              potrait ? "h-full " : "w-full"
            } xs:w-full xs:h-auto `}
          >
            <div
              style={{
                height: "100%",
                aspectRatio: currentDimensions.ascpectRatio,
              }}
            >
              <div
                className={` overflow-hidden  z-[2] flex flex-1 flex-col h-full w-full items-center justify-center`}
              >
                {video ? (
                  <div
                    className={`relative flex h-full w-full max-h-full max-w-full justify-center`}
                  >
                    <img
                      style={{
                        ...(loading && { filter: "blur(10px)" }),
                      }}
                      className={`h-full w-full`}
                      alt=""
                      src={preview}
                    />
                    {!loading && (
                      <video
                        className="absolute z-[1] top-0 left-0 h-full w-full "
                        controls={true}
                        src={preview}
                      />
                    )}
                  </div>
                ) : editMode ? (
                  <div className="edit flex flex-col items-center h-full max-h-full max-w-full justify-center">
                    <div className="flex justify-center h-full relative">
                      <ReactCrop
                        crop={crop}
                        onChange={setCrop}
                        onComplete={onCropComplete}
                        keepSelection={true}
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
                          <img src={preview} alt="" />
                        </div>
                      </ReactCrop>
                    </div>
                  </div>
                ) : (
                  <img
                    className={`h-full w-full`}
                    alt=""
                    src={croppedImage || preview}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex   px-[16px] py-[8px] min-h-[56px] items-center justify-center text-input-placeHolder">
        <div className="w-[full] flex items-center flex-1 justify-center max-w-[650px] relative ">
          <PropTextInput handleSubmit={handleSubmit} inputRefCb={setInputRef} />
        </div>
      </div>
    </>
  );
});

const NoPreviewModal = () => {
  const [footer, setFooterState, onSubmit] = useFooter();

  const file = footer.file;

  const size = formatFileSize(file.size);
  const extension = file.name.split(".").pop();
  const name = file.name;

  const handleInputChange = (e) => {
    setFooterState({ type: "set text", text: e.target.value });
  };

  const setInputRef = useCallback(
    (node) => {
      setFooterState({ type: "set state", payload: { propInputRef: node } });
    },
    [setFooterState]
  );

  const handleSubmit = async () => {
    try {
      onSubmit?.({
        text: footer.text,
        type: footer.fileType,
        files: [file],
        fileName: name,
        fileSize: size,
        fileType: extension,
      });

      setFooterState({
        type: "set state",
        payload: {
          text: "",
          bottomSheetOpened: false,
          previewModalOpened: false,
        },
      });
    } catch (e) {
      //console.log(e);
    }
  };

  return (
    <>
      <div className="flex justify-between item-center px-[18px] py-[8px] min-h-[44px] bg-panel-bg-deeper">
        <button
          className="p-[8px] rounded-full active:bg-icon-active text-panel-header-icon "
          onClick={() => {
            setFooterState({ type: "toggle previewDialog" });
          }}
        >
          <Close />
        </button>
      </div>
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
      <div className="flex   px-[16px] py-[8px] min-h-[56px] items-center justify-center text-input-placeHolder">
        <div className="w-[full] flex items-center flex-1 justify-center max-w-[650px] relative mx-[80px]">
          <div className="absolute top-0 bg-panel-header  left-0 w-full">
            <div className="absolute   left-0 bottom-0 w-full">
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  // ref={ref}
                  className={` ${
                    footer.activeTab !== "attachment h-full"
                      ? "bg-panel-header"
                      : "bg-transparent"
                  } `}
                ></div>
              </div>
            </div>
          </div>

          <TextInputView
            ref={setInputRef}
            value={footer.text}
            onChange={handleInputChange}
            handleSubmit={handleSubmit}
          >
            <button className="mr-[8px] last:mr-0 p-0 outline-none border-0 cursor-pointer h-full absolute top-0 left-0 transition-all duration-300"></button>
          </TextInputView>
        </div>
      </div>
    </>
  );
};

const PreviewModal = ({ ...props }, ref) => {
  const gifOverlay = document.getElementById("main-overlay");
  const [footer, setFooterState] = useFooter();

  const open = footer.previewDialogOpened;

  //console.log(open);
  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: open,
    direction: "bottom",

    onCollapseEnd: () => {
      setFooterState({ type: "reset" });
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
                {doc ? (
                  <NoPreviewModal />
                ) : (
                  <PreviewModalWrapper {...props} ref={ref} />
                )}
              </div>
            </div>
          </div>,
          gifOverlay
        )}
    </>
  );
};

export default forwardRef(PreviewModal);
