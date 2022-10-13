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
import useDisclosure from "../../hooks/useDisclosure";

import { useFooter } from "../../contexts/footerContext";

const GifMessageWrapper = forwardRef(({...props}, ref) => {
 
  

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
       text: footer.text,
       type: "image/gif",
       url: gif?.original?.url,
       previewUrl: gif?.preview?.url,
       dimensions:{width,height}
     });


     setFooterState({
       type: "set state",
       payload: { bottomSheetOpened: false, gifDialogOpened: false,propInputRef:null },
     });
     
   }, [footer.text, gif?.original?.url, gif?.preview?.url, onSubmit, setFooterState, url]);

  const handleSubmit = () => {
    onSubmit?.();
  };

  const handleInputChange = (e) => {
    setFooterState({ type: "set text", text: e.target.value });
  };

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
          <Textarea
            className="flex-1 min-h-[20px] min-w-0 text-[15px] font-normal outline-none leading-[20px] will-change-[width] rounded-[8px] my-[5px] mx-[10px] px-[12px] pt-[9px] pb-[11px] bg-panel w-[inherit]"
            placeholder="Type a Message"
            id="message"
            name="message"
            maxRows={3}
            ref={setInputRef}
            value={footer.text}
            onChange={handleInputChange}
            style={{
              resize: "none",
              border: 0,
              boxSizing: "border-box",
            }}
          />
          <div className="py-[5px] px-[10px] w-[37px] flex items-center justify-center min-h-[52px]">
            <button
              onClick={handleGifSubmit}
              className="flex-shrink-0 basis-auto flex-grow-0 text text-panel-header-icon"
            >
              <Send />
            </button>
          </div>
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
