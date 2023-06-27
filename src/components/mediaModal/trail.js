import raf from "raf";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import usePrevious from "../../hooks/usePrevious";
import { mergeRefs } from "../../utils";
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
    overlay: {
      opacity: 0,
      transition: "opacity 300ms cubic-bezier(0.1, 0.82, 0.25, 1) ",
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
    overlay: {
      opacity: 0,
      transition: "opacity 300ms cubic-bezier(0.1, 0.82, 0.25, 1) ",
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
    overlay: {
      opacity: 1,
      transition: "opacity 300ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
    },
  },
};

const setAttributes = (node, styles) => {
  Object.entries(styles).forEach(([key, value]) => {
    node.style[key] = value;
  });
};

const setStyles = (styles, nodes) => {
  Object.entries(styles).forEach(([key, value]) => {
    const node = nodes[key];
    if (node) {
      setAttributes(node, value);
    }
  });
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
  const [mainMounted, mountMain] = useState(!swiper);
  const [miniMounted, mountMini] = useState(true);
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

  const refs = useRef({});

  const refCb = useCallback((node, name) => {
    if (node) {
      refs.current[name] = node;
    }
  }, []);

  const getInitialStyles = (name) => {
    switch (name) {
      case "mini": {
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
      }

      case "header": {
        return sectionsStyle.initial["header"];
      }
      case "footer": {
        return sectionsStyle.initial["footer"];
      }
      case "main": {
        return sectionsStyle.initial["main"];
      }
      case "overlay": {
        return sectionsStyle.initial["overlay"];
      }
      default: {
        return {};
      }
    }
  };

  function register({ style = {}, refKey = "ref", name, ...rest }) {
    const theirRef = rest[refKey];
    return {
      ...rest,
      [refKey]: mergeRefs((node) => {
        refCb(node, name);
      }, theirRef),
      style: {
        ...style,
        ...getInitialStyles(name),
      },
    };
  }

  const [imageStyles, setImageStyles] = useState({});

  const containerRef = useRef();

  useLayoutEffect(() => {
    if (show) {
      raf(() => {
        const styles = getStyles();
        const currentStyles = {
          image: {
            transform: ` scale(${1 / styles.invScaleX},${
              1 / styles.invScaleY
            }) `,
          },
          mini: {
            transform: `translate(${styles.sx}px,${styles.sy}px) scale(${styles.scaleX},${styles.scaleY}) `,
            width: `${styles.width}px`,
            height: `${styles.height}px`,
            borderRadius: styles.borderRadius,
            overflow: "hidden",
          },
          ...sectionsStyle.initial,
        };

        setStyles(currentStyles, refs.current);

        raf(() => {
          const currentStyles = {
            image: {
              transform: ` scale(1) `,
              transition: "all  400ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
            },
            mini: {
              transform: `translate(${styles.fx}px,${styles.fy}px) scale(1) `,
              width: `${styles.width}px`,
              height: `${styles.height}px`,
              visibility: "visible",
              borderRadius: 0,
              transition: "  all 400ms  cubic-bezier(0.1, 0.82, 0.25, 1)  0s",
            },
            ...sectionsStyle.visible,
          };
          setStyles(currentStyles, refs.current);
          raf(() => {
            if (swiper) {
              mountMain(true);
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

          const styles = getStyles();
          const mini = refs.current['mini'];
          console.log(mini);
          const currentStyles = {
            mini: {
              transform: `translate(${styles.fx}px,${styles.fy}px) scale(1) `,
              transition: "none",
              width: `${styles.width}px`,
              height: `${styles.height}px`,
              overflow: "hidden",
              borderRadius: 0,
            },
          };
          mediaRect.style.opacity = 0;
          setStyles(currentStyles, refs.current);

            raf(() => {
              const styles = getStyles();
              const currentStyles = {
                mini: {
                  transform: `translate(${styles.sx}px,${styles.sy}px) scale(${styles.scaleX},${styles.scaleY}) `,
                  width: `${styles.width}px`,
                  height: `${styles.height}px`,
                  borderRadius: styles.borderRadius,
                  transition:"all 400ms cubic-bezier(0.1, 0.82, 0.25, 1) 0s",
                },
                image: {
                  transform: ` scale(${1 / styles.invScaleX},${
                    1 / styles.invScaleY
                  }) `,
                },
                ...sectionsStyle.hidden,
              };
              setStyles(currentStyles, refs.current);
            });
        });

        return;
      }
      mediaRect.style.opacity = 1;
      const currentStyles = {
        ...sectionsStyle.hidden,
      };
      setStyles(currentStyles, refs.current);
    }
  }, [mediaRect.style, getStyles, prevShow, show, enableMinimize]);

  const onTransitionEnd = (e) => {
    if (e.propertyName !== "transform") {
      return;
    }
    if (show) {
      mountMini(false);
      setOpened(true)
    
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

  const showMini = miniMounted || (!show && prevShow) ;
  return {
    showMini,
    opened,
    containerRef,
    mainMounted,
    onTransitionEnd,
    onClosed,
    register,
  };
};
