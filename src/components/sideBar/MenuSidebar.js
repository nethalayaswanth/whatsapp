import React, { useContext, useState } from "react";
import Header from "../header/Header";
import ChatList from "../ChatList/ChatList";

import { OpenContext } from "../../pages/messenger";
import Disclosure, { useDisclosure } from "../Disclosure";
import { useSidebar } from "../../contexts/sidebarContext";
import DrawerHeader from "../header/drawer";
import Profile from "../profile";
import NewChat from "../NewChat";
import NewGroup from "../NewGroup";
import useTransition from "../../hooks/useTransition";

import Login from "../login";

const MenuSideBar = () => {
  const [sideBar, dispatch] = useSidebar();

  const newChatActive = sideBar.open && sideBar.active === "new chat";
  const newGroupActive = sideBar.open && sideBar.active === "new group";
  const profileActive = sideBar.open && sideBar.active === "profile";
  const fromGroupChat = sideBar.from === "new group";

  // const { mount, getDisclosureProps, getParentProps } = useTransition({
  //   //isExpanded: detailsOpened,
  //   direction: "right",
  // });

console.log(newChatActive, newGroupActive);
  return (
    <div className="relative flex  top-0 bottom-0 left-0 right-0 h-full w-full  ">
      <Disclosure
        isExpanded={newChatActive}
        direction="left"
        duration={300}
        style={{ height: "100%", width: "100%", position: "absolute" }}
        {...(newGroupActive && { duration: 800 })}
      >
        <div className="h-full w-full  " style={{ position: "absolute" }}>
          <NewChat name="New chat" to="new group" />
        </div>
      </Disclosure>
      <Disclosure
        isExpanded={newGroupActive}
        direction="right"
        duration={300}
        style={{ height: "100%", width: "100%", position: "absolute" }}
        {...(newChatActive && fromGroupChat && { duration: 500 })}
      >
        <div className="h-full w-full " style={{ position: "absolute" }}>
          <NewGroup name="New group" to="new chat" />
        </div>
      </Disclosure>
      <Disclosure
        isExpanded={profileActive}
        direction="left"
        style={{ height: "100%", width: "100%", position: "absolute" }}
        duration={300}
      >
        <div className="h-full w-full " style={{ position: "absolute" }}>
          <Profile name="Profile" />
        </div>
      </Disclosure>
    </div>
  );
};
export default MenuSideBar;
