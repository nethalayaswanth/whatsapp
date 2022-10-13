import Message, { Text } from "../message";
import { useUser } from "../../requests.js/useRequests";
import { formatDate, mergeRefs } from "../../utils";
import { useRef, useLayoutEffect, useState, Fragment, memo } from "react";
import { useInView } from "react-intersection-observer";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { useCallback } from "react";
import useDisclosure from "../../hooks/useDisclosure";
import { useFooter } from "../../contexts/footerContext";
import useCollapse from "../../hooks/useCollapse";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

const DateHeader = ({ prevDate, date, root, setDateModal }) => {
  const { ref, inView, entry } = useInView({
    threshold: 0,
    root,
    rootMargin: "-40px 0px 99999px 0px",
  });

  useLayoutEffect(() => {
    setDateModal(date);
  }, [date, setDateModal]);

  useLayoutEffect(() => {
    if (inView) {
      setDateModal(prevDate);
    }
    if (!inView) {
      setDateModal(date);
    }
  }, [date, prevDate, inView, setDateModal]);



  return (
    <div
      ref={ref}
      className="px-[6.5%] mb-[12px] first:mt-[8px] flex justify-center relative flex-row select-text"
    >
      <div className=" pt-[5px] pb-[6px] px-[12px] text-center  bg-white text-primary-default rounded-[7.5px] inline-block text-[12.5px] leading-[21px] shadow-sm  flex-none ">
        {date}
      </div>
    </div>
  );
};

const UnreadMessages = ({ unread }) => {
  const [mount, setMount] = useState(true);

  // useLayoutEffect(() => {
  //   let timeout;
  //   if (mount) {
  //     timeout = setTimeout(() => {
  //       setMount(false);
  //     }, 5000);
  //   }
  //   return () => {
  //     if (timeout) clearTimeout(timeout);
  //   };
  // }, [mount]);

  return (
    <>
      {mount && unread && (
        <div className="bg-[rgba(255,255,255,0.3)] mb-[12px] flex justify-center items-center rounded-md py-[3px] ">
          <div className="px-[6.5%]   flex justify-center relative flex-row select-text">
            <div className=" pt-[3px] pb-[3px] px-[12px] text-center  bg-white text-primary-default rounded-[7.5px] inline-block text-[12.5px] leading-[21px] shadow-sm  flex-none ">
              {`${unread} unread messages`}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
const Conversation = ({ messages: data, room }) => {
  const { data: {user} } = useUser();

  const messageContainerRef = useRef(null);

  const [dateModal, setDateModal] = useState();

  const queryClient = useQueryClient();

  const messages = useMemo(() => {
    if (data === undefined) return [];
    return Object.keys(data).map((messageId, i) => {
      const message = data[messageId];

      const type = message?.message?.type;
      const image = type?.includes("image");
      const gif = type?.includes("image/gif");
      const video = type?.includes("video");
      const doc = type?.includes("doc");
      const conatainMedia = (image || video) && !gif;

      if (conatainMedia) {
        queryClient.setQueryData([room.roomId, "media"], (old) => {
          return { ...(old && old), [message.id]: { ...message } };
        });
      }else if (doc) {
         queryClient.setQueryData([room.roomId, "documents"], (old) => {
           return { ...(old && old), [message.id]: { ...message } };
         });
      }

      return message;
    });
  }, [data, queryClient, room.roomId]);

  useLayoutEffect(() => {
    if (!messageContainerRef.current) return;
    const messageContainer = messageContainerRef.current;

    messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
    });
  }, [messages]);

  const [showOnScroll, setShowOnScroll] = useState(false);

  const [position, isScrolling, elRef, targerRef] = useScrollPosition();

  useLayoutEffect(() => {
    let timeout;
    if (isScrolling) {
      setShowOnScroll(true);
    }
    if (!isScrolling) {
      timeout = setTimeout(() => {
        setShowOnScroll(false);
      }, 1000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isScrolling]);

  const [footer] = useFooter();

  const [spacer, setSpacer] = useState(0);
  const [translateStyles, setTranslate] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState();

  const translateRef = useRef(0);
  const conversationContainerRef = useRef();

  useLayoutEffect(() => {
    const bottomSheet = document.getElementById("bottomSheet");

    let timeout;
    const messageContainer = messageContainerRef.current;
    const container = conversationContainerRef.current;

    timeout = setTimeout(() => {
      const { height } = bottomSheet.getBoundingClientRect();
      if (!footer.bottomSheetOpened) {
        setTranslate({
          style: {
            transform: `translateY(${0}px)`,
            transition: "transform 300ms",
          },
        });
        translateRef.current = 0;
        return;
      }
      translateRef.current = height;

      setTranslate({
        style: {
          transform: `translateY(${-height}px)`,

          transition: "transform 300ms",
        },
      });
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [footer.activeTab, footer.bottomSheetOpened]);

  useEffect(() => {}, []);

  const { Toggle, getCollapseProps } = useCollapse({
    variable: spacer,
  });

  const { mount, getDisclosureProps, getParentProps } = useDisclosure({
    isExpanded: !!showOnScroll,
    direction: "top",
    easing: "ease-in-out",
    duration: 50,
  });

  if (!user) {
    return null;
  }

  return (
    <>
      <div
        style={{
          height: `${spacer}px`,
        }}
        className={`flex-grow-0 flex-shrink-0 basis-auto order-3 `}
      ></div>
      <div
        ref={conversationContainerRef}
        {...(translateStyles && translateStyles)}
        className="relative z-[1] flex-auto basis-auto order-2"
        onTransitionEnd={() => {
          //setSpacer(footer.bottomSheetOpened?0:translateRef.current);
          //setTranslate({});
        }}
      >
        <div>
          {dateModal && mount && (
            <span>
              <div
                {...getParentProps({
                  style: {
                    position: "absolute",
                    zIndex: 100,
                    paddingTop: "8px",
                    paddingRight: "6px",
                    width: "100%",
                  },
                })}
              >
                <div
                  {...getDisclosureProps()}
                  className="px-[6.5%] mb-[12px]  flex justify-center relative flex-row select-text"
                >
                  <div className=" pt-[5px] pb-[6px] px-[12px] text-center  bg-white text-primary-default rounded-[7.5px] inline-block text-[12.5px] leading-[21px] shadow-sm  flex-none ">
                    {dateModal}
                  </div>
                </div>
              </div>
            </span>
          )}
          <div
            ref={mergeRefs(elRef, messageContainerRef)}
            className="absolute top-0 z-50 flex  flex-col w-full h-full overflow-x-hidden overflow-y-scroll "
          >
            <div
              ref={targerRef}
              className="pb-[8px]  flex-grow-0 flex-shrink-0 basis-auto  "
            >
              <MessageListContainer
                messages={messages}
                messageContainerRef={messageContainerRef}
                setDateModal={setDateModal}
                unread={room?.unread}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const MessageListContainer = memo(
  ({ messages, messageContainerRef, unread, setDateModal }) => {
    const dateRef = useRef(null);
    const prevFromRef = useRef(null);
    return (
      <>
        {messages &&
          messages.length !== 0 &&
          messages.map((message, i) => {
            const timestamp = message?.deliveredTime
              ? formatDate(message?.deliveredTime, true)
              : null;
            const prevDate = dateRef?.current;
            const prevFrom = prevFromRef.current;
            const tail = prevFrom !== message?.from || i === 0;
            prevFromRef.current = message?.from;

            let dateChanged = false;
            if (timestamp && prevDate !== timestamp?.day) {
              dateRef.current = timestamp?.day;
              dateChanged = true;
            }

            if (i === messages.length - 1) {
              dateRef.current = null;
            }

            let showUnread = false;

            if (unread && messages.length - unread === i) {
              showUnread = true;
            }
            return (
              <Fragment key={i}>
                {dateChanged && (
                  <DateHeader
                    key={dateRef.current}
                    prevDate={prevDate}
                    date={dateRef.current}
                    root={messageContainerRef?.current}
                    setDateModal={setDateModal}
                  />
                )}
                {showUnread && <UnreadMessages key={'unreadmessage'} unread={unread} />}
                {message && <Message key={message.id} message={message} tail={tail} />}
              </Fragment>
            );
          })}

      </>
    );
  }
);
export default Conversation;
