import raf from "raf";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Controller, Mousewheel, Thumbs } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Reply } from "../../assets/reply.svg";
import { useChat } from "../../contexts/chatContext";
import { useMediaOfRoom } from "../../requests.js/useRequests";
import SlideItem, { SlideView } from "../carousel";
import Thumb from "../carousel/thumb";
import { ChatTitle } from "../ChatItem";

import { useQueryClient } from "@tanstack/react-query";
import useMedia from "../../hooks/useMedia";
import useMount from "../../hooks/useMount";
import usePrevious from "../../hooks/usePrevious";
import { useUser } from "../../requests.js/useRequests";
import { formatDate } from "../../utils";
import { HeaderItem } from "../header/Header";

const MediaMessageDetails = ({ title, details }) => {
  return (
    <div className="flex-1 flex  mr-[15px] ml-[5px] ">
      <div className="cursor-pointer flex-none ">
        <div className="pr-[13px] pl-[15px] flex justify-center items-center">
          <div className="h-[40px] w-[40px] ">
            <DefaultAvatar />
          </div>
        </div>
      </div>
      <div className="flex flex-col basis-auto  justify-center min-w-0 flex-grow">
        <ChatTitle
          style={{ color: "inherit" }}
          name={title}
          className="leading-[20px]  "
        />
        <div className="text-[12px] mt-[2px]">{details}</div>
      </div>
    </div>
  );
};

const ImageModal = ({ media, activeIndex, mount, unMount, root }) => {
  const [chatState, chatDispatch] = useChat();

  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const ExpandRef = useRef();

  const show = chatState.imageModalOpened;
  const previewBlob = chatState.imageModal.previewBlob;

  const [miniStyles, setMiniStyles] = useState({});
  const [{ thumbTranslate, headerTranslate, centeFade }, setCollapseStyles] =
    useState({});
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  const [swiperRef, setSwiperRef] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const justMountRef = useRef(true);

  const getStyles = useCallback(() => {
    const expanded = ExpandRef.current?.getBoundingClientRect();
    const collapsed = chatState.imageModal.mediaRect?.getBoundingClientRect();
    const img =
      chatState.imageModal.mediaRect?.children[0]?.getBoundingClientRect();

    if (!expanded || !collapsed || !img) {
      return {
        fx: 0,
        fy: 0,
        tx: 0,
        ty: 0,
        scale: 1,
        width: 100,
        height: 100,
      };
    }
    const fx = collapsed.left;
    const fy = img.top;
    const tx = expanded.left;
    const ty = expanded.top;
    const sx = collapsed.width / expanded.width;
    const sy = collapsed.height / expanded.height;

    const scale = sx;

    return {
      fx,
      fy,
      tx,
      ty,
      scale,
      width: expanded.width,
      height: expanded.height,
    };
  }, [chatState.imageModal.mediaRect]);

  const [prevShow] = usePrevious(show);

  const [visible, setVisible] = useState(false);

  const device = useMedia();
  const mobile = device === "mobile";
  console.log(device);

  useEffect(() => {
    if (show) {
      raf(() => {
        const styles = getStyles();
        setMiniStyles({
          transform: `translate(${styles.fx}px,${styles.fy}px) scale(${styles.scale})`,
          width: `${styles.width}px`,
          height: `${styles.height}px`,
          transformOrigin: "top left",
        });

        setOverlayOpacity(0);

        raf(() => {
          const styles = getStyles();

          setMiniStyles((x) => ({
            ...x,
            transform: `translate(${styles.tx}px,${styles.ty}px) scale(1) `,
            width: `${styles.width}px`,
            height: `${styles.height}px`,
            transformOrigin: "top left",
            transition: "transform 300ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
          }));
          setOverlayOpacity(1);
        });
      });
      return;
    }
  }, [getStyles, show]);

  useEffect(() => {
    if (!show && prevShow) {
      const styles = getStyles();

      if (currentIndex === activeIndex) {
        setVisible(false);
        raf(() => {
          const styles = getStyles();
          setMiniStyles({
            transform: `translate(${styles.tx}px,${styles.ty}px) scale(1) `,
            width: `${styles.width}px`,
            height: `${styles.height}px`,
            transformOrigin: "top left",
          });

          raf(() => {
            const styles = getStyles();

            setMiniStyles((x) => ({
              ...x,
              transform: `translate(${styles.fx}px,${styles.fy}px) scale(${styles.scale})  `,
              width: `${styles.width}px`,
              height: `${styles.height}px`,
              transformOrigin: "top left",
              transition: "transform 150ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
            }));
          });
        });
      }
    }
  }, [activeIndex, currentIndex, getStyles, prevShow, show]);

  useEffect(() => {
    if (!show && prevShow) {
      setCollapseStyles({
        thumbTranslate: {
          transform: `translateY(100%)`,
          transformOrigin: "top left",
          transition: "all 150ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
        },
        headerTranslate: {
          transform: `translateY(-100%)`,
          transformOrigin: "top left",
          transition: "all 150ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
        },
        centeFade: {
          opacity: 0,
          transition: "all 150ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
        },
      });
      setOverlayOpacity(0);
    }
  }, [getStyles, prevShow, show]);

  const onOpenTransitionEnd = (e) => {
    if (e.propertyName !== "transform") {
      return;
    }

    if (show) {
      setVisible(true);
      return;
    }
  };

  const onClosed = (e) => {
    if (!show) {
      unMount();
    }
  };

  const { data:{ user} } = useUser();

  const queryClient = useQueryClient();

  const message = media[currentIndex];
  const isSenderUser = message?.from === user?.id;
  const otherUser = queryClient.getQueryData(["user", message?.from]);

  const title = isSenderUser ? "You" : otherUser.name;

  const time = formatDate(message.deliveredTime).dateWithTime;

  return (
    <>
      {root &&
        createPortal(
          <div
            className={`image-swiper z-[1002] top-0 left-0 w-full h-full absolute ${
              mobile && "dark text-white "
            }`}
          >
            <div className=" left-0 z-[500]  relative top-0 w-full h-full">
              <div className="pb-[100px]   left-0 z-[502] flex flex-col fixed items-center top-0 w-full h-full">
                <div
                  style={{ ...(headerTranslate && headerTranslate) }}
                  className="flex z-[502] h-[60px] w-full items-center justify-end flex-none "
                >
                  <MediaMessageDetails title={title} details={time} />
                  <div className="justify-self-end flex items-center mr-[20px]">
                    <HeaderItem style={{ transform: "rotateY(180deg)" }}>
                      <Reply />
                    </HeaderItem>
                    <HeaderItem
                      onClick={() => {
                        chatDispatch({
                          type: "set state",
                          payload: { imageModalOpened: false },
                        });
                      }}
                    >
                      <Close />
                    </HeaderItem>
                  </div>
                </div>
                <div
                  style={{ ...(centeFade && centeFade) }}
                  onTransitionEnd={onClosed}
                  className="relative px-0 z-[500] pt-[10px] pb-[15px] flex flex-auto flex-shrink-0 items-center justify-between h-[calc(100%-60px)]  w-full"
                >
                  <Swiper
                    spaceBetween={0}
                    slidesPerView={1}
                    freeMode
                    onSlideChange={(e) => {
                      setCurrentIndex(e.activeIndex);
                    }}
                    onSwiper={setSwiperRef}
                    modules={[Mousewheel, Controller, Thumbs]}
                    mousewheel
                    controller={{ control: thumbsSwiper }}
                    initialSlide={activeIndex}
                  >
                    {media.map((media, i) => {
                      return (
                        <SwiperSlide key={i}>
                          <SlideItem
                            mobile={mobile}
                            ref={activeIndex === i ? ExpandRef : null}
                            visible={activeIndex === i ? visible : true}
                            src={media.message}
                          />
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                  {!visible && (
                    <div className="absolute h-full w-full top-0 left-0 flex  justify-center pt-[10px] pb-[15px]">
                      <SlideView
                        ref={ExpandRef}
                        mobile={mobile}
                        visible={visible}
                        preview={previewBlob}
                        potrait={chatState.imageModal.potrait}
                        aspectRatio={chatState.imageModal.aspectRatio}
                        width={chatState.imageModal.width}
                        height={chatState.imageModal.height}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{ ...(thumbTranslate && thumbTranslate) }}
                className={`thumb  ${
                  mobile ? "" : "border-t"
                } border-border-panel  bottom-0 absolute flex z-[502] flex-col overflow-hidden h-[100px] w-full`}
              >
                <div className="py-[8px] animate-slide w-full h-full flex">
                  <Swiper
                    slidesPerView={"auto"}
                    freeMode
                    mousewheel
                    modules={[Controller, Mousewheel, Thumbs]}
                    onSwiper={setThumbsSwiper}
                    centeredSlides
                    controller={{ control: swiperRef }}
                  >
                    {media.map((media, i) => {
                      return (
                        <SwiperSlide key={i}>
                          <Thumb index={i} src={media.message} />
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              </div>
              {!visible && (
                <div
                  style={{ ...miniStyles }}
                  className="absolute z-[500] "
                  onTransitionEnd={onOpenTransitionEnd}
                >
                  <div className="h-full w-full relative items-start justify-center flex">
                    <div className="h-full w-full absolute top-0 items-center justify-center flex ">
                      <img
                        className="w-full flex-shrink-0 flex-grow-0 basis-auto"
                        alt=""
                        src={previewBlob}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  opacity: overlayOpacity,
                  transition:
                    "opacity backgroundColor  300ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
                }}
                className={` left-0 z-[400]  fixed  top-0 w-full h-full ${
                  mobile ? "bg-black " : "bg-white"
                }`}
              ></div>
            </div>
          </div>,
          root
        )}
    </>
  );
};

const MediaModal = ({ messages, roomId }) => {
  const [chatState, chatDispatch] = useChat();
  const modalRoot = document.getElementById("image-overlay");
  const show = chatState.imageModalOpened;
  const [mount, unMount] = useMount(show);

  const activeIndex = useRef(0);
  const activeId = chatState.imageModal?.activeId;
  const { data } = useMediaOfRoom([roomId]);

  const media = useMemo(() => {
    if (data === undefined) return [];
    return Object.keys(data).map((messageId, i) => {
      if (data[messageId].id === activeId) {
        activeIndex.current = i;
      }
      return data[messageId];
    });
  }, [activeId, data]);

  return (
    <>
      {mount && (
        <ImageModal
          media={media}
          activeIndex={activeIndex.current}
          activeId={activeId}
          mount={mount}
          unMount={unMount}
          root={modalRoot}
        />
      )}
    </>
  );
};

export default MediaModal;
