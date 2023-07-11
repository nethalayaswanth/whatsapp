import { useRef } from "react";

import chatbg from "../../assets/chatbg.png";
import { useAppState } from "../../contexts/appStore";
import { ChatProvider } from "../../contexts/chatContext";

import { Details, DetailsPortal } from "../details";

import Footer from "../footer";
import ImageModal from "../mediaModal/mediaModal";
import Conversation from "./conversation";
import ChatHeader from "./Header";

import { RoomProvider } from "../../contexts/roomContext";
import Stack from "./stack";

import { FooterProvider } from "../../contexts/footerContext";
import { ModalProvider } from "../../contexts/modalContext";
import { ReplyProvider } from "../../contexts/replyContext";
import { ErrorBoundary } from "../errorBoundary";
import DeleteModal from "../modal/deleteModal";
import { MessageHandlerProvider } from "./messageHandlerProvider";
import { RefProvider } from "./refProvider";
import { ScrollToBottom } from "./scrollToBottom";



const Chat = () => {
 

  return (
    <RefProvider>
      <RoomProvider>
        <ChatProvider>
          <ReplyProvider>
            <FooterProvider>
              <ModalProvider>
                <DeleteModal>
                  <ScrollToBottom>
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
                          <Stack>
                            <ErrorBoundary>
                              <Conversation />
                            </ErrorBoundary>
                            <ErrorBoundary>
                              <Footer />
                            </ErrorBoundary>
                          </Stack>
                        </div>
                      </div>
                    </MessageHandlerProvider>
                  </ScrollToBottom>
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
    </RefProvider>
  );
};
export default Chat;
