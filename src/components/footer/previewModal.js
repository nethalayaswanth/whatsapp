import {
  useRef,
  useState,
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import Textarea from "react-textarea-autosize";
import Disclosure from "../Disclosure";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Send } from "../../assets/send.svg";
import { ReactComponent as Crop } from "../../assets/crop.svg";
import { ReactComponent as Document } from "../../assets/page.svg";
import useDisclosure from "../../hooks/useDisclosure";

import { useFooter } from "../../contexts/footerContext";
import { TextInputView } from "./input";
import Spinner from "../spinner";

import {
  generatecroppedImage,
  generateThumbNail,
  createImage,
  formatFileSize,
} from "../../utils";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const PreviewModalWrapper = forwardRef(({}, ref) => {
  const [dimensions, setDimensions] = useState({
    width: `${0}px`,
    maxWidth: `${0}px`,
    ascpectRatio: 1,
  });

  const [croppedDimensions, setCroppedDimensions] = useState(dimensions);

  const blobUrl = useRef();
  const thumbnailRef = useRef();

  const [footer, setFooterState, onSubmit] = useFooter();

  const file = footer.fileSelected;

  const [preview, setPreview] = useState(() => ({
    url: URL.createObjectURL(file),
  }));

  const payloadFileRef = useRef();

  const handleInputChange = (e) => {
    setFooterState({ type: "set text", text: e.target.value });
  };

  const [loading, setLoading] = useState(true);

  const loadImage = useCallback(() => {}, []);

  const [editMode, setEditMode] = useState();
  const image = file.type.includes("image");
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

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCroppedAreaPixels(percentCrop);
  }, []);

  const setInputRef = useCallback(
    (node) => {
      setFooterState({ type: "set state", payload: { propInputRef: node } });
    },
    [setFooterState]
  );

  const handleEdit = async (event) => {
    try {
      const [croppedFile, previewFile] = await generatecroppedImage({
        imageSrc: preview,
        crop: croppedAreaPixels,
      });

      console.log(croppedFile);
      localStorage.setItem("nothing", JSON.stringify(croppedFile));

      payloadFileRef.current = [croppedFile, previewFile];

      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
      const croppedUrl = URL.createObjectURL(croppedFile);

      const { naturalWidth, naturalHeight, ascpectRatio } = await createImage(
        croppedUrl
      );
      const height = 320;
      const width = height * ascpectRatio;
      setCroppedImage(croppedUrl);
      setCroppedDimensions({ width, height, ascpectRatio });
      setEditMode(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!payloadFileRef.current && file.type.includes("image")) {
        const [croppedFile, previewFile] = await generatecroppedImage({
          imageSrc: preview,
          crop: croppedAreaPixels,
        });

        payloadFileRef.current = [croppedFile, previewFile];
      }
      const files = [...payloadFileRef.current];
      onSubmit?.({
        text: footer.text,
        type: file.type,
        files: files,
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
      console.log(e);
    }
  };
  useLayoutEffect(() => {
    (async () => {
      try {
        blobUrl.current = URL.createObjectURL(file);

        if (file.type.includes("video")) {
          var video = document.createElement("video");
          video.src = blobUrl.current;

          video.preload = "metadata";
          video.muted = true;
          video.playsInline = true;
          video.play();
          video.onloadedmetadata = async (event) => {
            const ascpectRatio = video.videoWidth / video.videoHeight;
            const height = 336;
            const width =
              ascpectRatio > 1 ? (height * 16) / 9 : (height * 9) / 16;

            setDimensions({
              width: width,
              height: height,
              ascpectRatio: width / height,
            });
            setCroppedDimensions({ width, height, ascpectRatio });
            setPreview({
              url: blobUrl.current,
            });
            const thumbnail = await generateThumbNail(video);
            payloadFileRef.current = [file, thumbnail];

            setLoading(false);
            video.pause();
          };

          return;
        }

        const image = await createImage(blobUrl.current);

        const { naturalWidth, naturalHeight, ascpectRatio } = image;
        const height = 320;
        const width = height * ascpectRatio;
        setPreview({ ...image, height, width });
        setDimensions({ width, height, ascpectRatio });
        setCroppedDimensions({ width, height, ascpectRatio });
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    })();

    return () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, []);

  useLayoutEffect(() => {
    return () => {
      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
      if (blobUrl.current) {
        URL.revokeObjectURL(blobUrl.current);
      }
    };
  }, []);

  const currentDimensions = editMode ? dimensions : croppedDimensions;

  const potrait = currentDimensions.ascpectRatio <= 0.75;

  const video = file.type.includes("video");

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
        {image && (
          <button
            className={`p-[8px] rounded-full active:bg-icon-active  text-panel-header-icon ${
              editMode && "bg-icon-active"
            }`}
            onClick={() => {
              setEditMode((x) => !x);
            }}
          >
            <Crop />
          </button>
        )}
        {
          <div className="w-[56px]">
            {editMode && (
              <button
                className={`p-[8px] rounded-xl  active:bg-icon-active hover:bg-icon-active  text-panel-header-icon `}
                onClick={handleEdit}
              >
                Done
              </button>
            )}
          </div>
        }
      </div>
      <div className="relative justify-center px-[20px] py-[20px] flex-1 flex max-h-full max-w-full">
        <div className="absolute px-[20px] py-[20px] top-0 left-0 w-full h-full max-h-full max-w-full flex items-center justify-center ">
          <div
            style={{
              aspectRatio: currentDimensions.ascpectRatio,
            }}
            className={`relative max-h-[80%] flex justify-center  max-w-full  ${
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
                      src={preview.url}
                    />
                    {!loading && (
                      <video
                        className="absolute z-[1] top-0 left-0 h-full w-full "
                        controls={true}
                        src={preview.url}
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
                        minHeight='220px'
                        minWidth='220px'
                      >
                        <div className="w-full h-full flex justify-center">
                          <img src={preview.url} alt="" />
                        </div>
                      </ReactCrop>
                    </div>
                  </div>
                ) : (
                  <img
                    className={`h-full w-full`}
                    alt=""
                    src={croppedImage || preview.url}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex   px-[16px] py-[8px] min-h-[56px] items-center justify-center text-input-placeHolder">
        <div className="w-[full] flex items-center flex-1 justify-center max-w-[650px] relative mx-[80px]">
          <TextInputView
            ref={setInputRef}
            value={footer.text}
            onChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
});

const NoPreviewModal = () => {
  const [footer, setFooterState, onSubmit] = useFooter();

  const file = footer.fileSelected;

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
      console.log(e);
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
            {" "}
            <span>No Preview Available</span>
          </div>
          <div className="text-[0.875rem]">
            {`${size} - ${extension.toUpperCase()}`}
          </div>
        </div>
      </div>
      <div className="flex   px-[16px] py-[8px] min-h-[56px] items-center justify-center text-input-placeHolder">
        <div className="w-[full] flex items-center flex-1 justify-center max-w-[650px] relative mx-[80px]">
          <TextInputView
            ref={setInputRef}
            value={footer.text}
            onChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
};

const PreviewModal = ({ ...props }, ref) => {
  const gifOverlay = document.getElementById("main-overlay");
  const [footer, setFooterState] = useFooter();

  const open = footer.previewModalOpened;

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
          <div className="w-full h-full overflow-hidden pointer-events-auto absolute top-0 left-0 ">
            <div
              {...getParentProps({
                style: { width: "100%", height: "100%", overflow: "hidden" },
              })}
            >
              <div
                {...getDisclosureProps()}
                className="h-[calc(100%-var(--panel-header))] flex flex-grow flex-col bg-white w-full"
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
