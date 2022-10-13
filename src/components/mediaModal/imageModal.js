import {
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import raf from "raf";

import useMount from "../../hooks/useMount";
import usePrevious from "../../hooks/usePrevious";
import { ReactComponent as Close } from "../../assets/close.svg";

const ImageModal = ({ show, mount, unMount, root }) => {
  const miniRef = useRef();
  const ExpandRef = useRef();
  const imgRef = useRef();

  const [miniStyles, setMiniStyles] = useState({});

  const [overlayOpacity, setOverlayOpacity] = useState(0);

  const getStyles = useCallback(() => {
    // const expanded = ExpandRef.current.getBoundingClientRect();
    // const collapsed = chatState.mediaRect.getBoundingClientRect();
    // const img = chatState.mediaRect.children[0].getBoundingClientRect();

    // const fx = collapsed.left;
    // const fy = img.top + collapsed.height / 2;
    // const tx = expanded.left;
    // const ty = expanded.top;
    // const sx = collapsed.width / expanded.width;
    // const sy = collapsed.height / expanded.height;

    // const scale = sx;

    // return {
    //   fx,
    //   fy,
    //   tx,
    //   ty,
    //   scale,
    //   width: expanded.width,
    //   height: expanded.height,
    // };
  }, []);

  const [prevShow] = usePrevious(show);

  useEffect(() => {
    if (show) {
      const styles = getStyles();
      raf(() => {
        setMiniStyles({
          transform: `translate(${styles.fx}px,${styles.fy}px) scale(${styles.scale})`,
          width: `${styles.width}px`,
          height: `${styles.height}px`,
          transformOrigin: "top left",
        });

        setOverlayOpacity(0);

        raf(() => {
          const styles = getStyles();

          console.log(styles);
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
      setOverlayOpacity(0);
    }
  }, [getStyles, prevShow, show]);

  const [visible, setVisible] = useState(false);

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

  return (
    <div>
      {root &&
        createPortal(
          <div className="image-swiper z-[1002] top-0 left-0 w-full h-full absolute">
            <div className=" left-0 z-[500]  relative top-0 w-full h-full">
              <div className="pb-[100px]   left-0 z-[500] flex flex-col fixed items-center top-0 w-full h-full">
                <div className="flex z-[500] h-[60px] w-full items-center justify-end flex-none ">
                  <div className="justify-self-end mr-[20px]">
                    <button
                      //   onClick={() => {
                      //     chatDispatch({
                      //       type: "set state",
                      //       payload: { imageModalOpened: false },
                      //     });
                      //   }}
                      className="flex items-center "
                    >
                      <Close />
                    </button>
                  </div>
                </div>

                {/* <SlideItem
                  ref={activeIndex === i ? ExpandRef : null}
                  visible={activeIndex === i ? visible : true}
                  src={media.message}
                /> */}
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
                          //src={previewBlob}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div
                  style={{
                    opacity: overlayOpacity,
                    transition:
                      "opacity 300ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
                  }}
                  className=" bg-white left-0 z-[400]  fixed  top-0 w-full h-full"
                ></div>
              </div>
            </div>
          </div>,
          root
        )}
    </div>
  );
};

const MediaModal = (show) => {
  const modalRoot = document.getElementById("image-overlay");

  const [mount, unMount] = useMount(show);

  return (
    <>
      {mount && <ImageModal mount={mount} unMount={unMount} root={modalRoot} />}
    </>
  );
};

export default MediaModal;
