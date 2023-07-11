import {
  useLayoutEffect
} from "react";

import data from "@emoji-mart/data/sets/14/facebook.json";
import Chat from "../components/chat/chat";
import QueryErrorBoundary from "../components/errorBoundary";
import Verification from "../components/login/verification";
import SideBar from "../components/sideBar/SideBar";
import { AppProvider, useAppState } from "../contexts/appStore";
import {
  SidebarProvider,
  useSidebarDispatch,
  useSidebarState,
} from "../contexts/sidebarContext";
import { SocketProvider } from "../contexts/socketContext";
import { useUser } from "../queries.js/useRequests";

import { init } from "emoji-mart";
import Disclosure from "../components/Disclosure";
import MutationProvider from "../contexts/mutationContext";

init({ data });

const SideBarWrapper = ({ children }) => {
  const { detailsOpened } = useSidebarState();
  return (
    <div
      style={{
        transform: "translateZ(0px)",
      }}
      className={`sidebar flex-shrink-0 flex-grow-0 basis-[40%] lg:basis-[35%] xl:basis-[30%] mobile:basis-auto mobile:flex-grow mobile:z-1 ${
        detailsOpened ? "basis-[30%] max-w-[30%]" : ""
      } `}
    >
      {children}
    </div>
  );
};


const ChatWrapper = () => {
  const { preview, roomId } = useAppState();

  return (
    <Disclosure
      isExpanded={preview}
      direction="right"
      duration={500}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        style={{
          transform: "translateZ(0px)",
        }}
        className={`relative w-full  h-full overflow-hidden flex-grow z-2 mobile:absolute mobile:pointer-events-none mobile:basis-auto   `}
      >
        <QueryErrorBoundary>
          {preview && <Chat key={roomId} />}
        </QueryErrorBoundary>
      </div>
    </Disclosure>
  );
};
const DetailsWrapper = () => {
  const { detailsOpened } = useSidebarState();
  return (
    <div
      style={{
        transform: "translateZ(0px)",
      }}
      className={`relative h-full flex-shrink-0 flex-grow-0 z-5 mobile:absolute mobile:pointer-events-none mobile:flex-grow mobile:basis-auto mobile:max-w-full    ${
        detailsOpened ? "basis-[30%] max-w-[30%]" : ""
      } z-[100]`}
    >
      <span
        id="drawer-right"
        className="absolute top-0 right-0 left-0 bottom-0"
      ></span>
    </div>
  );
};

export const Main = () => {
  const { data: user } = useUser();

  const dispatch = useSidebarDispatch();

  useLayoutEffect(() => {
    if (!user?.name || !user?.about) {
      dispatch({
        type: "set state",
        payload: { open: true, active: "profile", from: "header" },
      });
    }
  }, [user, dispatch]);

  return (
    <>
      <SideBarWrapper>
        <QueryErrorBoundary>
          <SideBar />
        </QueryErrorBoundary>
      </SideBarWrapper>
      <ChatWrapper/>
      <DetailsWrapper />
    </>
  );
};

const App = () => {
  const { data: user } = useUser();

  const {detailsOpened}= useSidebarState()

  const verified = user.verification === "VERIFIED";
  const success = user.verification === "SUCCESS";
  const pending = user.verification?.pending;

  return (
    <>
      <span id="image-overlay" className="w-full"></span>
      <span id="globalmodal" className="w-full"></span>
      <div
        
        className="animate-zoomIn relative top-0 w-full h-full overflow-hidden flex max-w-[1300px] xl:m-auto xl:shadow-lg xl:w-[calc(100%-60x)]  xl:h-[calc(100%-60px)] xl:top-[15px] bg-panel-bg-lighter  "
      >
        <div
          className={`absolute top-0 left-0 z-[200] w-full pointer-events-none h-full flex  overflow-hidden `}
        >
          <div
            style={{
              transform: "translateZ(0px)",
            }}
            className={`sidebar flex-shrink-0 flex-grow-0  z-[200] basis-[40%] lg:basis-[35%] xl:basis-[30%] mobile:basis-auto mobile:flex-grow mobile:z-1   ${
              detailsOpened ? "basis-[30%] max-w-[30%]" : ""
            } `}
          >
            <span
              id="side-overlay"
              className="absolute top-0 left-0 right-0 bottom-0 h-full w-full "
            >
              {pending && <Verification user={user} />}
            </span>
          </div>
          <div
            style={{
              transform: "translateZ(0px)",
            }}
            className={`relative w-full  h-full overflow-hidden flex-grow z-2 mobile:absolute mobile:pointer-events-none mobile:basis-auto   `}
          >
            <span
              id="main-overlay"
              className="absolute top-0 left-0 right-0 bottom-0"
            ></span>
          </div>
        </div>
        {(verified || success) && <Main />}
      </div>
    </>
  );
};

const Messenger = () => {
  return (
    <SocketProvider>
      <MutationProvider>
        <AppProvider>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </AppProvider>
      </MutationProvider>
    </SocketProvider>
  );
};

export default Messenger;
