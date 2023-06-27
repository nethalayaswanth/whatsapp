import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Emoji } from "../../assets/emoji.svg";
import useDisclosure from "../../hooks/useDisclosure";

import useResizeObserver from "use-resize-observer";
import { useFooter } from "../../contexts/footerContext";
import EmojiPicker from "../PropPickers/emojiPicker";
import { TextInputView } from "./input";

const GifMessageWrapper = forwardRef(({ ...props }, ref) => {
  const [footer, setFooterState, onSubmit] = useFooter();

  const gif = footer.gifSelected;
  const { height, width, url } = gif?.original;
  const ascpectRatio = width / height;
  const maxWidth = ascpectRatio > 1 ? 320 : 240;
  const [preview, setPreview] = useState(() => gif?.preview?.url);
  const [dimensions, setDimensions] = useState({
    width: `${width}px`,
    maxWidth: `${maxWidth}px`,
    ascpectRatio: ascpectRatio,
  });
  const blobUrl = useRef();

  const setInputRef = useCallback(
    (node) => {
      setFooterState({ type: "set state", payload: { propInputRef: node } });
    },
    [setFooterState]
  );

  const handleGifSubmit = useCallback(() => {
    if (!url) {
      return;
    }

    onSubmit?.({
      text: footer.propInputRef.value,
      type: "image/gif",
      original: gif?.original?.url,
      preview: gif?.preview?.url,
      dimensions: { width, height },
    });

    setFooterState({
      type: "set state",
      payload: {
        bottomSheetOpened: false,
        gifDialogOpened: false,
        propInputRef: null,
      },
    });
  }, [
    footer.propInputRef?.value,
    gif?.original?.url,
    gif?.preview?.url,
    height,
    onSubmit,
    setFooterState,
    url,
    width,
  ]);

  useLayoutEffect(() => {
    (async () => {
      try {
        const blob = await fetch(url).then(function (response) {
          return response.blob();
        });
        blobUrl.current = URL.createObjectURL(blob);

        const img = new Image();
        img.src = blobUrl.current;
        img.onload = () => {
          setPreview(blobUrl.current);
        };
      } catch (e) {
        console.log(e);
      }
    })();

    return () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, []);

  const [mountEmojiPicker, setEmojiPicker] = useState(false);
  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: mountEmojiPicker,
    direction: "bottom",
    onCollapseEnd: () => {
      // setFooterState({ type: "reset" });
    },
  });

  const handleEmojiSelect = useCallback(
    (value, emojiObject) => {
      const emoji = value.native;
      const input = footer.propInputRef;
      const start = input?.selectionStart;
      const end = input?.selectionEnd;
      input.setSelectionRange(start, start);

      const splitted = input.value.split("");

      splitted.splice(start, end - start, emoji);

      input.value = splitted.join("");
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    },
    [footer.propInputRef]
  );

  const {
    ref: resizeRef,
    width: resizeWidth,
    height: resizeHeight,
  } = useResizeObserver();

  return (
    <>
      <div className="flex justify-between item-center px-[18px] py-[8px] min-h-[44px] bg-panel-bg-deeper">
        <button
          onClick={() => {
            setFooterState({ type: "toggle gifDialog" });
          }}
        >
          <Close />
        </button>
      </div>
      <div className="relative  items-center justify-center px-[20px] py-[20px] flex-1 flex">
        <div className=" flex items-center justify-center">
          <div style={{ ...dimensions }}>
            <img className="h-full w-full " src={preview} alt="" />
          </div>
        </div>
      </div>
      <div className="flex   px-[16px] py-[8px] min-h-[56px] items-center justify-center text-input-placeHolder">
        <div className="w-[full] flex items-center flex-1 justify-center max-w-[650px] relative mx-[80px]">
          <div className="absolute top-0 bg-panel-header  left-0 w-full">
            <div ref={resizeRef} className="absolute   left-0 bottom-0 w-full">
              {mount && (
                <div
                  {...getParentProps({
                    style: {
                      height: "100%",
                      width: "100%",
                      overflow: "hidden",
                    },
                  })}
                >
                  <div
                    {...getDisclosureProps()}
                    // ref={ref}
                    className={`rounded-[8px] rounded-b-none ${
                      footer.activeTab !== "attachment"
                        ? "bg-panel-header"
                        : "bg-transparent"
                    } `}
                  >
                    <EmojiPicker
                      width={resizeWidth}
                      onSelect={handleEmojiSelect}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <TextInputView
            className={`bg-panel-header rounded-[8px] transition-[border-radius ] ${
              mount ? "rounded-tl-none rounded-t-none " : ""
            }`}
            ref={setInputRef}
            handleSubmit={handleGifSubmit}
          >
            <button
              onClick={() => {
                setEmojiPicker((x) => !x);
              }}
              setEmojiPicker
              className="mr-[8px] last:mr-0 p-0 outline-none border-0 cursor-pointer h-full  transition-all duration-300"
            >
              <Emoji />
            </button>
          </TextInputView>
        </div>
      </div>
    </>
  );
});

const GifMessage = ({ ...props }, ref) => {
  const gifOverlay = document.getElementById("main-overlay");
  const [footer, setFooterState] = useFooter();

  const open = footer.gifDialogOpened;

  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: open,
    direction: "bottom",
    onCollapseEnd: () => {
      setFooterState({ type: "reset" });
    },
  });

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
                <GifMessageWrapper {...props} ref={ref} />
              </div>
            </div>
          </div>,
          gifOverlay
        )}
    </>
  );
};

export default forwardRef(GifMessage);
