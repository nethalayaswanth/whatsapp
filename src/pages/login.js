import { useEffect, createContext, useState } from "react";

import LoginSideBar from "../components/sideBar/login";
import Chat from "../components/chat/chat";
import OverLay from "../components/overlay";
import { SidebarProvider } from "../contexts/sidebarContext";
import useMedia from "../hooks/useMedia";

const LoginPage = () => {

  const device = useMedia({
    breakPoints: [740, 540, 420],
    breakPointValues: ["xl", "l", "sm"],
    defaultValue: "xs",
  });
  const mobile = device === "xs";

  return (
    <SidebarProvider>
      <div className="relative top-0 w-full h-full overflow-hidden flex xl:m-auto xl:shadow-lg xl:w-[calc(100%-30x)] max-w-[1356px] xl:h-[calc(100%-30px)] xl:top-[15px] bg-panel-bg-lighter  ">
        <div
          style={{
            transform: "translateZ(0px)",
            ...(mobile && { flexGrow: 1, zIndex: 1, flexBasis: "auto" }),
          }}
          className="sidebar  z-[200] xl:flex-[30%]"
        >
          {" "}
          <LoginSideBar />
        </div>
         <div
          style={{
            transform: "translateZ(0px)",
            ...(mobile && {
              position: "absolute",
              zIndex: 0,
              // pointerEvents: "none",
              flexGrow: 1,
              flexBasis: "auto",
            }),
          }}
          className={`relative w-full  h-full overflow-hidden flex-grow  bg-[#efeae2] `}
        ></div>
      </div>
    </SidebarProvider>
  );
};

export default LoginPage;
