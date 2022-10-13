import { forwardRef,useRef } from "react";
import { useSwiperSlide } from "swiper/react";
import { useSwiper } from "swiper/react";
import { mergeRefs } from "../../utils";

import useMediaFetch from "../../hooks/useMediaFetch";

const breakPoints = [390];
const breakPointValues = ["sm"];
const defaultValue = "xs";

export const ThumbView = forwardRef(({ src,id, active, onClick,className ,style}, ref) => {
  const [original, preview, loading] = useMediaFetch({ src });

  const imgRect=useRef()

  const video = src.type.includes("video");


  const url = video ? preview : original || preview;

  
  
    // const media = useMedia({ breakPoints, breakPointValues, defaultValue });

    // const sm = media === "sm";
    // const xs = media === "xs";

   const width = src.dimensions?.width;
   const height = src.dimensions?.height;
   const aspectRatio = width / height;

   const potrait = aspectRatio <= 1;

  const handleClick = () => {
    onClick?.({ preview: url, src: src, id: id, potrait,aspectRatio,width,height, imgRect: imgRect.current });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        ...style,
        transform: active ? `scale(0.87)` : `scale(1)`,
        transition: " transform .075s ease-out,opacity .25s ease-in-out",
      }}
      className={` rounded-[4px] border-y-[4px] border-x-[4px] border-border-thumb-active overflow-hidden flex w-[14%] lg:w-[5%] flex-grow-0 flex-shrink-0 m-0 basis-auto items-center cursor-pointer justify-center bg-media-thumb-bg min-w-[78px] h-[78px] border-solid mr-[6px] mb-[6px] relative ${className} `}
    >
      <div
        ref={mergeRefs(ref, imgRect)}
        className="overflow-hidden z-[2] h-full w-full absolute top-0 left-0  thumb-gradient"
      >
        <div className="h-full w-full relative ">
          <div
            style={{
              ...(loading && { filter: "blur(10px)" }),
              backgroundImage: `url(${url})`,
            }}
            className={`absolute h-full w-full flex items-center justify-center bg-center bg-cover cursor-pointer `}
          ></div>
        </div>
      </div>
    </div>
  );
});

const Thumb = forwardRef(({ src, index }, ref) => {
  const swiperSlide = useSwiperSlide();
  const active = swiperSlide.isActive;
  const swiper = useSwiper();
  const handleClick = () => {
    swiper.slideTo(index);
  };

  return <ThumbView active={active} ref={ref} onClick={handleClick} src={src} />;
});

export default Thumb;
