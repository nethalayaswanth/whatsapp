import {
  Fragment,
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { DateModalProvider } from "../../contexts/dateModalContext";
import { useChatRoom } from "../../contexts/roomContext";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { useRoomMessages } from "../../queries.js/messages";
import { useUser } from "../../queries.js/user";
import { mergeRefs } from "../../utils";
import { ErrorBoundary } from "../errorBoundary";
import Message from "../message";
import { StrokeSpinner } from "../spinner";
import DateHeader from "./dateHeader";
import DateModal from "./dateModal";
import { useRefs } from "./refProvider";

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
  useLayoutEffect(() => {
    //console.log('loading')
  }, []);
  return (
    <div
      ref={ref}
      className="mb-[2px]  first:mt-[8px] flex justify-center pointer-events-none items-center z-[100]"
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

const Conversation = forwardRef((props, ref) => {
  const room = useChatRoom();

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <MessageList key={room.roomId} room={room} />
      </Suspense>
    </ErrorBoundary>
  );
});
const MessageList = forwardRef(({ room }, ref) => {
  const { data: user } = useUser();

  const newRoom = room?.newRoom;
  const roomId = room?.roomId;
  const lastSeenAt = room?.lastSeenAt;
  const unread = room?.unread;

  const { data, fetchNextPage } = useRoomMessages({
    roomId,
    queryOptions: { enabled: !!roomId && !newRoom },
  });


  const containerRef = useRef();
  const { scroller } = useRefs();
  const scrollerCb = (node) => {
   
    if (node) scroller.current = node;
  };

  const containerCb = (node) => {
    if (node) containerRef.current = node;
  };
  const getScroller = useCallback(() => {
    return scroller.current;
  }, [scroller]);

 

  const loadMore = useCallback(() => {
 
    fetchNextPage(data?.currentCursor);
  }, [data?.currentCursor, fetchNextPage]);



  const { ref: loaderRef } = useInfiniteScroll({
    loadMore,
    getScroller,
  });
 

  if (!user) {
    return null;
  }

  let unreadShown;


  return (
    <DateModalProvider >
      <DateModal />
      <div
        id="chat-scroller"
        ref={mergeRefs(scrollerCb)}
        className="flex z-[1] h-full flex-col relative overflow-x-auto overflow-y-auto"
      >
        <div className="flex-1"></div>
        <div
          ref={containerCb}
          className="pb-[8px]  flex-grow-0 flex-shrink-0 basis-auto  "
        >
          {data && (
            <>
              <div>
                {data.hasMore ? (
                  <Loading ref={loaderRef} />
                ) : (
                  <Notification>
                    There are no more messages to show
                  </Notification>
                )}
              </div>

              {data.messages &&
                data.messages.length !== 0 &&
                data.messages.map((message, i) => {
                  
                  const { date, dateChanged, types, ...metaData } = message;
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
                          key={`$date-${date}`}
                          type={["date"]}
                          date={date}
                          time={time}
                        />
                      )}
                      {showUnread && (
                        <UnreadMessages
                          key={"unreadmessage"}
                          type={["unread"]}
                          unread={unread}
                        />
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
