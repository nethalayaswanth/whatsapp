import { forwardRef, useRef } from "react";
import { useSwiper, useSwiperSlide } from "swiper/react";
import { mergeRefs } from "../../utils";

import useMediaFetch from "../../hooks/useMediaFetch";
import { useMessage } from "../../queries.js/messages";

const breakPoints = [390];
const breakPointValues = ["sm"];
const defaultValue = "xs";

export const ThumbView = forwardRef(
  ({ src, messageId, roomId, active, onClick, className, style }, ref) => {
    const { data } = useMessage({ messageId, roomId });

    const message = data?.message;
    const type = message?.type;

    const gif = type?.includes("gif");
    const _original = message?.original;
    const _preview = message?.preview;

   
    const [original, preview, loading] = useMediaFetch({
      original: _original,
      preview: _preview,
      type: type,
    });

    const mediaRect = useRef();

    const video = message?.type.includes("video");

    const width = message?.dimensions?.width;
    const height = message?.dimensions?.height;
    const aspectRatio = width / height;

    const potrait = aspectRatio <= 1;

    const styles = potrait
      ? { width: "100%", aspectRatio: aspectRatio }
      : { width: `${aspectRatio * 100}% `, maxWidth: "none" };

    const handleClick = () => {
      onClick?.({
        preview: original,
        src: src,
        id: messageId,
        potrait,
        aspectRatio,
        width,
        height,
        gif,
        mediaRect: mediaRect?.current,
      });
    };

    return (
      <div
        onClick={handleClick}
        style={{
          ...style,
          transform: active ? `scale(0.87)` : `scale(1)`,
          transition: " transform .075s ease-out,opacity .25s ease-in-out",
        }}
        className={`${className}  rounded-[4px] border-y-[4px] border-x-[4px] border-border-thumb-active overflow-hidden flex  flex-grow-0 flex-shrink-0 m-0 basis-auto items-center cursor-pointer justify-center bg-media-thumb-bg  border-solid mr-[6px] mb-[6px] relative `}
      >
        <div
          ref={mergeRefs(ref, mediaRect)}
          className={`overflow-hidden z-[2] h-full w-full absolute top-0 left-0  thumb-gradient items-center justify-center flex  ${
            potrait ? "flex-row" : "flex-col"
          }`}
        >
          <img
            style={{
              ...styles,
            }}
            className="block flex-shrink-0 flex-grow-0 basis-auto"
            alt=""
            src={preview}
          />
        </div>
      </div>
    );
  }
);

const Thumb = forwardRef(
  ({ messageId, roomId, index, mobile, className }, ref) => {
    const swiperSlide = useSwiperSlide();
    const active = swiperSlide.isActive;
    const swiper = useSwiper();
    const handleClick = () => {
      swiper.slideTo(index);
    };

    return (
      <ThumbView
        mobile={mobile}
        className={className}
        active={active}
        ref={ref}
        onClick={handleClick}
        messageId={messageId}
        roomId={roomId}
      />
    );
  }
);

export default Thumb;
