import { useMemo, useState } from "react";
import { Controller, Mousewheel, Thumbs, Virtual } from "swiper";

import { Swiper, SwiperSlide } from "swiper/react";

import MainItem from "../carousel";
import Thumb from "../carousel/thumb";

import useMount from "../../hooks/useMount";

import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/virtual";

import { useModalDispatch, useModalState } from "../../contexts/modalContext";
import { useChatRoom } from "../../contexts/roomContext";
import { useMediaOfRoom } from "../../queries.js/messages";
import { ErrorBoundary } from "../errorBoundary";
import { MessageModalHeader } from "./Header";

import ModalWrapper, { useModal } from "./modalWrapper";

const ThumbNails = ({ setThumbsSwiper, swiper, media, roomId }) => {
  const { containerHeight, containerWidth, opened } = useModal();
  const slidesPerView = useMemo(() => {
    const bp = [420, 630];
    const values = [54, 78];
    if (!containerWidth) return 20;
    const value = bp.findIndex((tw) => containerWidth < tw);

    const thumbWidth =
      value === -1 ? containerWidth / 84 : containerWidth / values[value];

    return thumbWidth;
  }, [containerWidth]);

  return (
    <div className="py-[8px]  w-full h-full flex">
      <ErrorBoundary>
        <Swiper
          slidesPerView={slidesPerView}
          modules={[Controller, Virtual, Mousewheel, Thumbs]}
          freeMode
          mousewheel
          virtual
          onSwiper={setThumbsSwiper}
          centeredSlides
          controller={{ control: swiper }}
        >
          {media.map((mediaId, index) => {
            return (
              <SwiperSlide key={`${mediaId}-thumb`} virtualIndex={index}>
                <Thumb
                  index={index}
                  messageId={mediaId}
                  roomId={roomId}
                  className={`aspect-square w-full pr-[10px] mr-0`}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </ErrorBoundary>
    </div>
  );
};

const GalleryModal = ({ media, roomId, mount, unMount, root }) => {
  const modalState = useModalState();
  const modalDispatch = useModalDispatch();
  const { activeId } = modalState;
  const activeIndex = media.findIndex((id) => id === activeId);

  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  const [swiper, setSwiper] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const messageId = media[currentIndex];

  const enableMinimize = activeIndex === currentIndex;


  return (
    <ModalWrapper
      {...{ modalState, root, unMount, swiper: true, enableMinimize }}
    >
      <MessageModalHeader roomId={roomId} messageId={messageId} />

      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        freeMode
        onSlideChange={(e) => {
          setCurrentIndex(e.activeIndex);
        }}
        onSwiper={setSwiper}
        modules={[Mousewheel, Controller, Virtual, Thumbs]}
        mousewheel
        virtual
        controller={{ control: thumbsSwiper }}
        initialSlide={activeIndex}
      >
        {media.map((messageId, index) => {
          return (
            <SwiperSlide key={messageId} virtualIndex={index}>
              <MainItem messageId={messageId} roomId={roomId} />
            </SwiperSlide>
          );
        })}
      </Swiper>
      <ThumbNails
        setThumbsSwiper={setThumbsSwiper}
        roomId={roomId}
        swiper={swiper}
        media={media}
      />
    </ModalWrapper>
  );
};

const GifModal = ({ roomId, unMount, root }) => {
  const modalState = useModalState();

  const { activeId: messageId } = modalState;

  return (
    <ModalWrapper {...{ modalState, root, unMount, enableMinimize:true }}>
      <MessageModalHeader roomId={roomId} messageId={messageId} />
      <MainItem messageId={messageId} roomId={roomId} />
    </ModalWrapper>
  );
};

const MediaModal = () => {
  const modalState = useModalState();
  const modalRoot = document.getElementById("image-overlay");
  const show = modalState.opened;
  const gif = modalState.gif;
  const [mount, unMount] = useMount(show);

  const { roomId } = useChatRoom();

  const { data: media } = useMediaOfRoom({ roomId });

  return (
    <>
      {mount &&
        (gif ? (
          <GifModal
            roomId={roomId}
            mount={mount}
            unMount={unMount}
            root={modalRoot}
          />
        ) : (
          <GalleryModal
            media={media}
            roomId={roomId}
            mount={mount}
            unMount={unMount}
            root={modalRoot}
          />
        ))}
    </>
  );
};

export default MediaModal;
