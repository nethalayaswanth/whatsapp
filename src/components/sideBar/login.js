import React from "react";
import Header from "../header/Header";
import ChatList from "../ChatList/ChatList";
import Login from "../login";

const LoginSideBar = () => {
  return (
    <div
      className="sidebar xl:flex-[30%] z-[100]"
      style={{ transform: "translateZ(0px)" }}
    >
      <div className="flex-col flex h-full ">
        <Login />
      </div>
    </div>
  );
};
export default LoginSideBar;
