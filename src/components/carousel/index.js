import { useQueryClient } from "@tanstack/react-query";
import { forwardRef, useCallback, useRef } from "react";
import { useModalDispatch } from "../../contexts/modalContext";
import useMediaFetch from "../../hooks/useMediaFetch";
import { useMessage } from "../../queries.js/messages";
import { useModal } from "../mediaModal/modalWrapper";
import { getDimensions } from "../mediaModal/utils";

export const MainView = forwardRef(
  (
    {
      video,
      videoRef,
      preview,
      original,
      aspectRatio,
      mediaWidth,
      mediaHeight,
      onOutSideClick,
    },
    ref
  ) => {
    const refCb = (node) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
        return;
      }
      ref.current = node;
    };

    const { containerHeight, containerWidth, opened } = useModal();

    const { width, height } = (() => {
      if (!containerWidth || !containerHeight) return { width: 0, height: 0 };

      return getDimensions({
        containerWidth,
        containerHeight,
        aspectRatio,
        height: mediaHeight,
        width: mediaWidth,
        paddingLeft: 92,
      });
    })()


    return (
      <div
        className="main-container h-full w-full flex justify-center items-center"
        onClick={onOutSideClick}
      >
        <div
          ref={refCb}
          style={{ width, height, opacity: opened ? 1 : 0 }}
          className="   main-target relative flex overflow-hidden  flex-shrink-0 flex-col  justify-center   "
        >
          {video ? (
            <div
              className={` relative h-full  justify-center items-center flex`}
            >
              <img
                style={{
                  filter: "blur(10px)",
                }}
                className={`h-full w-full`}
                alt=""
                src={preview}
              />

              <video
                className="absolute z-[1] top-0 left-0 h-full w-full "
                controls={true} 
                ref={videoRef}
                src={original}
              />
            </div>
          ) : (
            <>
              <img
                // onLoad={(e) => {
                //   //console.log("loaded", e.target.height);
                // }}
                style={{
                  filter: "blur(10px)",
                }}
                className={`h-full w-full swiper-zoom-target`}
                alt=""
                src={preview}
              />
              <img
                className={`absolute h-full w-full swiper-zoom-target`}
                alt=""
                src={original}
              />
            </>
          )}
        </div>
      </div>
    );
  }
);

const MainItem = forwardRef(({ messageId, roomId }, ref) => {

  const videoRef=useRef()
  const getVideo=useCallback(()=>{
    return videoRef.current
  },[])
  const { data } = useMessage({ messageId, roomId });

  const message = data?.message;

  const type = message?.type;
  const _original = message?.original;
  const _preview = message?.preview;
  const mediaWidth = message?.dimensions?.width;
  const mediaHeight = message?.dimensions?.height;
  const aspectRatio = message?.dimensions?.aspectRatio;

  const modalDispatch = useModalDispatch();

  const onOutSideClick = () => {
    modalDispatch({
      type: "set state",
      payload: { opened: false },
    });
  };

  const queryclient = useQueryClient();
 const cacheMedia = useCallback(
   ({type,data}) => {
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
    getVideo,
  });

  const video = message?.type.includes("video");

  return (
    <MainView
      {...{
        video,
        videoRef,
        original,
        preview,
        mediaWidth,
        mediaHeight,
        aspectRatio,
        ref,
        onOutSideClick,
      }}
    />
  );
});

export default MainItem;
