import React from "react";
import MenuSideBar from "../sideBar/MenuSidebar";
import { useSidebar } from "../../contexts/sidebarContext";

const OverLay = () => {

  const [sideBar, dispatch] = useSidebar();
  return (
    <div
      className={`absolute top-0 left-0 z-[200] w-full pointer-events-none h-full flex  overflow-hidden `}
    >
      <div className="sidebar z-[200] xl:flex-[30%]">
        <MenuSideBar />
      </div>
      <div className="main xl:flex-[70%]">
        <span
          id="main-overlay"
          className="absolute top-0 left-0 right-0 bottom-0"
        ></span>
      </div>
    </div>
  );
};

export default OverLay;
