import { useRef } from "react";

import chatbg from "../../assets/chatbg.png";
import { useAppState } from "../../contexts/appStore";
import { ChatProvider } from "../../contexts/chatContext";

import { Details, DetailsPortal } from "../details";
import Disclosure from "../Disclosure";
import Footer from "../footer";
import ImageModal from "../mediaModal/mediaModal";
import Conversation from "./conversation";
import ChatHeader from "./Header";

import { RoomProvider } from "../../contexts/roomContext";
import Stack from "./stack";

import { FooterProvider } from "../../contexts/footerContext";
import { ModalProvider } from "../../contexts/modalContext";
import { ErrorBoundary } from "../errorBoundary";
import { MessageHandlerProvider } from "./messageHandlerProvider";
import DeleteModal from "../modal/deleteModal";
import { ReplyProvider } from "../../contexts/replyContext";

const ChatDisclosure = ({ children }) => {
  const { preview } = useAppState();

  console.log(`%cpreview`, "color:blue;font-size:32px");

  return (
    <Disclosure
      isExpanded={preview}
      direction="right"
      duration={500}
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </Disclosure>
  );
};

const Chat = () => {
  const scroller = useRef();

  const footer = useRef();

  return (
    <RoomProvider>
      <ChatProvider>
        <ReplyProvider>
          <FooterProvider>
            <ModalProvider>
              <DeleteModal>
                <ChatDisclosure>
                  <MessageHandlerProvider>
                    <div
                      className="h-full w-full bg-app-conversation pointer-events-auto   "
                      style={{ position: "relative" }}
                    >
                      <div
                        style={{ backgroundImage: `url(${chatbg})` }}
                        className={`absolute z-[0] h-full w-full top-0 bg-repeat left-0 opacity-[0.5] `}
                      />
                      <div className="flex flex-col z-[1] h-full ">
                        <ChatHeader />

                        <Stack {...{ scroller, footer }}>
                          <ErrorBoundary>
                            <Conversation {...{ scroller, footer }} />
                          </ErrorBoundary>
                          <ErrorBoundary>
                            <Footer {...{ scroller, footer }} />
                          </ErrorBoundary>
                        </Stack>
                      </div>
                    </div>
                  </MessageHandlerProvider>
                </ChatDisclosure>
                <DetailsPortal>
                  <Details />
                </DetailsPortal>
                <ImageModal />
              </DeleteModal>
            </ModalProvider>
          </FooterProvider>
        </ReplyProvider>
      </ChatProvider>
    </RoomProvider>
  );
};
export default Chat;
