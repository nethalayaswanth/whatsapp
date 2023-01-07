import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  forwardRef,
  Fragment,
  useLayoutEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import useDisclosure from "../../hooks/useDisclosure";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { useUser } from "../../queries.js/useRequests";
import { formatDate, mergeRefs } from "../../utils";
import InfiniteScroll from "../infiniteScroll";
import Message from "../message";
import { StrokeSpinner } from "../spinner";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useRoomMessages } from "../../queries.js/messages";
import { RoomProvider, useChatRoom, useUserAndRoom } from "../../contexts/roomContext";
import { createPortal } from "react-dom";
import { useScroller } from "./stack";
import DateModal from "./dateModal";
import DateHeader from "./dateHeader";
import { DateModalProvider } from "../../contexts/dateModalContext";

const Notification = ({ children }) => {
  return (
    <div className="px-[6.5%] mb-[12px] first:mt-[8px] flex justify-center relative flex-row select-text">
      <div className=" pt-[5px] pb-[6px] px-[12px] text-center  bg-white text-primary-default rounded-[7.5px] inline-block text-[12.5px] leading-[21px] shadow-sm  flex-none ">
        {children}
      </div>
    </div>
  );
};

export const Loading = forwardRef(({ inView }, ref) => {
  return (
    <div
      ref={ref}
      className="mb-[12px]  first:mt-[8px] flex justify-center pointer-events-none items-center z-[100]"
    >
      {
        <div className="h-[32px] w-[32px] relative  flex justify-center pointer-events-none items-center rounded-full bg-white">
          <StrokeSpinner stroke="#008069" width="21" height="21" />
        </div>
      }
    </div>
  );
});

const lerp = (a, b, t) => a + (b - a) * t;
const easeIn = (t) => t * t;

const easeOut = (t) => t * (2 - t);



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

const Conversation = forwardRef(({ scroller }, ref) => {
  const { data: user } = useUser();

  const { newRoom, ...room } = useChatRoom();
 
  const roomId = room?.roomId;
  const lastSeenAt=room?.lastSeenAt
  const unread=room?.unread
  

  const { data, fetchNextPage } = useRoomMessages({
    roomId,
    lastSeenAt,
    unread,
    userId: user.id,
    queryOptions: { enabled: !!roomId && !newRoom },
  });




  const containerRef = useRef();
  const ScrollerRef=useRef()

  useLayoutEffect(() => {
    if (!scroller.current) return;

    scroller.current.scrollTo({
      top: scroller.current.scrollHeight,
    });
  }, [room.roomId, scroller]);

  const loadMore = useCallback(
   () => fetchNextPage(data?.currentCursor),
    [data?.currentCursor, fetchNextPage]
  );


  if (!user) {
    return null;
  }

  let unreadShown
  return (
    <DateModalProvider boundingElement={ScrollerRef.current}>
      <DateModal  />
      <div
        ref={mergeRefs(scroller, ScrollerRef)}
        className="flex z-1  flex-col relative overflow-x-auto overflow-y-auto"
      >
        <div
          ref={containerRef}
          className="pb-[8px]  flex-grow-0 flex-shrink-0 basis-auto  "
        >
          {data && (
            <>
              <InfiniteScroll
                loadMore={loadMore}
                itemsLength={data.messages?.length ?? 0}
                scrollElement={ScrollerRef}
              >
                <div>
                  {data.hasMore ? (
                    <Loading />
                  ) : (
                    <Notification>
                      There are no more messages to show
                    </Notification>
                  )}
                </div>
              </InfiniteScroll>
              {data.messages &&
                data.messages.length !== 0 &&
                data.messages.map((message, i) => {
                  const { prevDate, date, dateChanged, ...metaData } = message;

                  const { id, time } = metaData;

                  let showUnread;
                  if (time > lastSeenAt && !unreadShown) {
                    unreadShown = true;
                    showUnread = true;
                  }

                  return (
                    <Fragment key={id}>
                      {dateChanged && (
                        <DateHeader
                          key={`${date}-${date}`}
                         
                          date={date}
                        
                        />
                      )}
                      {showUnread && (
                        <UnreadMessages key={"unreadmessage"} unread={unread} />
                      )}
                      {
                        <Message
                          key={id}
                          user={user}
                          metaData={metaData}
                          roomId={room?.roomId}
                        />
                      }
                    </Fragment>
                  );
                })}
            </>
          )}
        </div>
      </div>
    </DateModalProvider>
  );
});

export default Conversation;
