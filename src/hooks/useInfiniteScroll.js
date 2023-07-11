import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLatest } from "../hooks/useLatest";

const useInfiniteScroll = ({
  itemsLength,
  loadMore,
  getScroller: _getScroller,
}) => {
  const prevScrollTop = useRef(0);
  const prevscrollheight = useRef(0);
  const actionTriggered = useRef(false);

  const ref = useRef();

  const loadMoreRef = useLatest(loadMore);
  const getScroller = useLatest(_getScroller);

  const handleScroll = useCallback(
    (e) => {
      const scroll = getScroller.current?.();

      if (!scroll) return;
      if (!ref.current) return;
      const loaderTop = ref.current.getBoundingClientRect().top;
      const scrollerTop = scroll.getBoundingClientRect().top;
      const threshold = 200;
      const inView = loaderTop > scrollerTop - threshold;

      prevScrollTop.current = scroll.scrollTop;
      prevscrollheight.current = scroll.scrollHeight;

      // ////console.log(inView, actionTriggered.current, loadMoreRef.current);

      if (inView && !actionTriggered.current) {
        actionTriggered.current = true;
        loadMoreRef.current?.();
      }
    },
    [getScroller, loadMoreRef]
  );

  useEffect(() => {
    const scroll = getScroller.current?.();

    if (!scroll) return;

    handleScroll();

    scroll.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      if (scroll) {
        scroll.removeEventListener("scroll", handleScroll);
      }
    };
  }, [getScroller, handleScroll]);

  useLayoutEffect(() => {
    let timeout;
    const scroll = getScroller.current?.();

    ////console.log(scroll, "scroll");
    if (!scroll) return;

    const scrollTop =
      scroll.scrollHeight + prevScrollTop.current - prevscrollheight.current;
    scroll.scroll({
      top: scrollTop,
    });

    ////console.log('effect')
    prevScrollTop.current = scrollTop;
    prevscrollheight.current = scroll.scrollHeight;
    actionTriggered.current = false;
    handleScroll();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [getScroller, handleScroll, itemsLength]);

  return { ref };
};

export default useInfiniteScroll;
