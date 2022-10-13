import {
  useEffect,
  useLayoutEffect,
  useRef,
  createContext,
  useState,
} from "react";

import SideBar from "../components/sideBar/SideBar";
import Chat from "../components/chat/chat";
import OverLay from "../components/overlay";
import { SidebarProvider } from "../contexts/sidebarContext";
import { AppStateProvider, useAppState } from "../contexts/appStateContext";
import useSocket from "../contexts/socketContext";
import { useUser } from "../requests.js/useRequests";
import { useSidebar } from "../contexts/sidebarContext";
import { SocketProvider } from "../contexts/socketContext";
import data from "@emoji-mart/data/sets/14/facebook.json";
import useAnimationFrame from "../hooks/useAnimationFrame";
import { Details } from "../components/details";
import MenuSideBar from "../components/sideBar/MenuSidebar";
import useMedia from "../hooks/useMedia";
import Disclosure from "../components/Disclosure";

import { init } from "emoji-mart";

init({ data });

const App = () => {
  const { data:{user} } = useUser();
  const [sideBar, dispatch] = useSidebar();
  const [appState, appDispatch] = useAppState();

 

  useLayoutEffect(() => {
    if (!user?.name || !user?.about) {
      dispatch({
        type: "set state",
        payload: { open: true, active: "profile", from: "header" },
      });
    }
  }, [user, dispatch]);

  useLayoutEffect(() => {}, []);

  const detailsOpened = sideBar.detailsOpened;

  const device = useMedia({ breakPoints: [740, 540, 420],breakPointValues:['xl','l','sm'],defaultValue:'xs' });
  const mobile = device === "xs";

  

  const countRef = useRef(0);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const mainRef = useRef();

  const [scale, setScale] = useState();

  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIn = (x) => x * x;
  const initial = 0;

  const scaleRef = useRef(initial);

  const [showDetails, setShowDetails] = useState();

  // useLayoutEffect(() => {
  //   if (detailsOpened) {
  //     setShouldAnimate(true);
  //   }
  // }, [detailsOpened]);

  // useAnimationFrame(
  //   (progress) => {
  //     const x = lerp(100, 0, progress);

     
  //     mainRef.current.style.transform = `translateX(${x}px)`;
  //     mainRef.current.style.transformOrigin = `center left`;

  //     if (progress === 1) {
  //       setShouldAnimate(false);
  //     }
  //   },
  //   { shouldAnimate: shouldAnimate, duration: 150 }
  // );
  

  return (
    <>
      <span id="image-overlay"></span>
      <span id="globalmodal"></span>
      <div className="animate-zoomIn relative top-0 w-full h-full overflow-hidden flex xl:m-auto xl:shadow-lg xl:w-[calc(100%-30x)] max-w-[1356px] xl:h-[calc(100%-30px)] xl:top-[15px] bg-panel-bg-lighter  ">
        <div
          className={`absolute top-0 left-0 z-[200] w-full pointer-events-none h-full flex  overflow-hidden `}
        >
          <div
            style={{
              transform: "translateZ(0px)",
              ...(mobile && { flexGrow: 1, zIndex: 1, flexBasis: "auto" }),
            }}
            className="sidebar  z-[200] xl:flex-[30%]"
          >
            <MenuSideBar />
          </div>
          <div
            style={{
              transform: "translateZ(0px)",
              ...(mobile && {
                position: "absolute",
                zIndex: 2,
                pointerEvents: "none",
                flexGrow: 1,
                flexBasis: "auto",
              }),
            }}
            className="main xl:flex-[70%]"
          >
            <span
              id="main-overlay"
              className="absolute top-0 left-0 right-0 bottom-0"
            ></span>
          </div>
        </div>
        <div
          className=" relative h-full bg-blue overflow-hidden flex-shrink-0 flex-grow-0 basis-[40%] lg:basis-[35%] xl:flex-[30%] z-[100]"
          style={{
            transform: "translateZ(0px)",
            ...(mobile && { flexGrow: 1, zIndex: 1, flexBasis: "auto" }),
          }}
        >
          <SideBar />
        </div>
        <div
          style={{
            transform: "translateZ(0px)",
            ...(mobile && {
              position: "absolute",
              zIndex: 2,
              pointerEvents: "none",
              flexGrow: 1,
              flexBasis: "auto",
            }),
          }}
          className={`relative w-full  h-full overflow-hidden flex-grow  bg-[#efeae2] `}
        >
          <Chat />
        </div>
       
        <div
          style={{
            transform: "translateZ(0px)",
            ...(mobile && {
              position: "absolute",
              pointerEvents: "none",
              flexGrow: 1,
              flexBasis: "auto",
              zIndex: 5,
              maxWidth:"100%",
              width:"100%"
            }),
          }}
          className={`relative h-full flex-shrink-0 flex-grow-0  ${
            detailsOpened ? "basis-[30%] max-w-[30%]" : ""
          } z-[100]`}
        >
          <span
            id="drawer-right"
            className="absolute top-0 right-0 left-0 bottom-0"
          ></span>
        </div>
      </div>
    </>
  );
};
const Messenger = () => {
  return (
    <AppStateProvider>
      <SocketProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </SocketProvider>
    </AppStateProvider>
  );
};

export default Messenger;
