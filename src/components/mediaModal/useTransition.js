import raf from "raf";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal, flushSync } from "react-dom";
import usePrevious from "../../hooks/usePrevious";
import { getMiniStyles } from "./utils";

const transition = {
  visible: {
    transformOrigin: "top left",
    transition: "all 300ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
  },
  hidden: { transition: "" },
};
const sectionsStyle = {
  initial: {
    footer: {
      transform: `translateY(100%)`,
      ...transition.hidden,
    },
    header: {
      transform: `translateY(-100%)`,
      ...transition.hidden,
    },
    main: {
      opacity: 0,
      ...transition.hidden,
    },
  },
  hidden: {
    footer: {
      transform: `translateY(100%)`,
      ...transition.visible,
    },
    header: {
      transform: `translateY(-100%)`,
      ...transition.visible,
    },
    main: {
      opacity: 0,
      ...transition.visible,
    },
  },
  visible: {
    footer: {
      transform: `translateY(0%)`,
      ...transition.visible,
    },
    header: {
      transform: `translateY(0%)`,
      ...transition.visible,
    },
    main: {
      opacity: 1,
      ...transition.visible,
    },
  },
};

export const useTransition = ({
  modalState,
  enableMinimize = true,
  swiper,
  unMount,
  onOpened,
  onClosed: _onClosed,
}) => {
  const { opened: show, mediaRect } = modalState;

  // const [miniMounted,mountMini]=useState()
  const [mainMounted, setMainMount] = useState(!swiper);
  const [opened, setOpened] = useState(false);

  const getStyles = useCallback(() => {
    const container = containerRef.current?.getBoundingClientRect();
    const collapsed = mediaRect?.getBoundingClientRect();
    const mediaRectStyles = window.getComputedStyle(mediaRect);
    const borderRadius = mediaRectStyles.getPropertyValue("border-radius");
    const img = mediaRect?.children[0]?.getBoundingClientRect();
    const styles = getMiniStyles({
      container,
      collapsed,
      img,
      height: modalState.height,
      width: modalState.width,
      aspectRatio: modalState.aspectRatio,
      paddingLeft: 92,
    });

    return { ...styles, borderRadius };
  }, [mediaRect, modalState]);

  const prevShow = usePrevious(show);

  const [{ header, footer, main }, setSectionStyles] = useState(
    sectionsStyle.initial
  );

  const refs=useRef({})

  const register=useCallback((node,name)=>{
if(node){
  refs.current[name]=node
}
  },[])

  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [miniStyles, setMiniStyles] = useState(() => {
    const { width, height, top, left } = mediaRect.getBoundingClientRect();

    const mediaRectStyles = window.getComputedStyle(mediaRect);
    const borderRadius = mediaRectStyles.getPropertyValue("border-radius");

    return {
      width,
      height,
      overflow: "hidden",
      transform: `translate(${left}px,${top}px) `,
      borderRadius,
    };
  });
  const [imageStyles, setImageStyles] = useState({});

  const containerRef = useRef();

  useLayoutEffect(() => {
    if (show) {
      raf(() => {
        setOverlayOpacity(0);
        const styles = getStyles();
        setSectionStyles(sectionsStyle.initial);
        setImageStyles({
          transform: ` scale(${1 / styles.invScaleX},${1 / styles.invScaleY}) `,
        });
        setMiniStyles({
          transform: `translate(${styles.sx}px,${styles.sy}px) scale(${styles.scaleX},${styles.scaleY}) `,
          width: `${styles.width}px`,
          height: `${styles.height}px`,

          borderRadius: styles.borderRadius,
          overflow: "hidden",
        });

        raf(() => {
          setMiniStyles((old) => ({
            ...old,
            transform: `translate(${styles.fx}px,${styles.fy}px) scale(1) `,
            width: `${styles.width}px`,
            height: `${styles.height}px`,

            visibility: "visible",
            borderRadius: 0,
            transition: "all  400ms  cubic-bezier(0.1, 0.82, 0.25, 1)  0s",
          }));
          setImageStyles({
            transform: ` scale(1) `,
            transition: "all  400ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
          });
          setOverlayOpacity(1);
          setSectionStyles(sectionsStyle.visible);
          raf(() => {
            if (swiper) {
              setMainMount(true);
            }
          });
        });
      });
    }
  }, [getStyles, show, swiper]);

  useLayoutEffect(() => {
    if (!show && prevShow) {
      if (enableMinimize) {
        
        raf(() => {
          setOpened(false);
          const styles = getStyles();
          setMiniStyles({
            transform: `translate(${styles.fx}px,${styles.fy}px) scale(1) `,
            width: `${styles.width}px`,
            height: `${styles.height}px`,

            overflow: "hidden",
            borderRadius: 0,
          });
          mediaRect.style.opacity = 0;

          raf(() => {
            const styles = getStyles();

            setMiniStyles((x) => ({
              ...x,
              transform: `translate(${styles.sx}px,${styles.sy}px) scale(${styles.scaleX},${styles.scaleY}) `,
              width: `${styles.width}px`,
              height: `${styles.height}px`,
              borderRadius: styles.borderRadius,
              transition: "all 400ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
            }));

            setImageStyles({
              transform: ` scale(${1 / styles.invScaleX},${
                1 / styles.invScaleY
              }) `,
            });

            setSectionStyles(sectionsStyle.hidden);
            setOverlayOpacity(0);
          });
        });

        return;
      }
      mediaRect.style.opacity = 1;
      setSectionStyles(sectionsStyle.hidden);
      setOverlayOpacity(0);
    }
  }, [mediaRect.style, getStyles, prevShow, show, enableMinimize]);

  const onTransitionEnd = (e) => {
    if (e.propertyName !== "transform") {
      return;
    }
    if (show) {
      setOpened(true);

      // mountMini(false)
      onOpened?.();
      return;
    }
  };
  const onClosed = (e) => {
    if (!show) {
      mediaRect.style.opacity = 1;
      _onClosed?.();
      unMount();
    }
  };

  return {
    styles: { mini: miniStyles, image: imageStyles, header, main, footer },
    opened,
    containerRef,
    overlayOpacity,
    mainMounted,
    onTransitionEnd,
    onClosed,
  };
};
