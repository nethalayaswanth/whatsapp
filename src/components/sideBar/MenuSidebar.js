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
import CreateNewGroup from "../NewGroup/createGroup";
import useTransition from "../../hooks/useTransition";

import Login from "../login";

const MenuSideBar = () => {
  const [sideBar, dispatch] = useSidebar();

  const newChatActive = sideBar.open && sideBar.active === "new chat";
  const newGroupActive = sideBar.open && sideBar.active === "new group";
  const profileActive = sideBar.open && sideBar.active === "profile";
    const createGroupActive = sideBar.open && sideBar.active === "create group";
  const fromGroupChat = sideBar.from === "new group";
    const fromNewChat = sideBar.from === "new chat";

 
console.log({ fromGroupChat, fromNewChat });
  return (
    <>
      <Disclosure
        key="New chat"
        isExpanded={newChatActive}
        direction="left"
        duration={300}
        style={{ height: "100%", width: "100%", position: "absolute" }}
        {...(newGroupActive && { duration: 800 })}
      >
        <div
          className="h-full w-full bg-panel-header "
          style={{ position: "absolute" }}
        >
          <NewChat name="New chat" to="new group" />
        </div>
      </Disclosure>
      <Disclosure
        key="New group"
        isExpanded={newGroupActive}
        direction={fromNewChat ? "right":"left" }
        duration={300}
        style={{ height: "100%", width: "100%", position: "absolute" }}
        {...(newChatActive && fromGroupChat && { duration: 500 })}
      >
        <div
          className="h-full w-full bg-panel-header"
          style={{ position: "absolute" }}
        >
          <NewGroup name="New group" to="new chat" />
        </div>
      </Disclosure>
      <Disclosure
        key="Create group"
        isExpanded={createGroupActive}
        direction={fromGroupChat ? "right" : "left"}
        duration={300}
        style={{ height: "100%", width: "100%", position: "absolute" }}
        {...(newGroupActive && { duration: 500 })}
      >
        <div
          className="h-full w-full bg-panel-header"
          style={{ position: "absolute" }}
        >
          <CreateNewGroup name="Create group" />
        </div>
      </Disclosure>
      <Disclosure
        key="Profile"
        isExpanded={profileActive}
        direction="left"
        style={{ height: "100%", width: "100%", position: "absolute" }}
        duration={300}
      >
        <div
          className="h-full w-full bg-panel-header "
          style={{ position: "absolute" }}
        >
          <Profile name="Profile" />
        </div>
      </Disclosure>
    </>
  );
};
export default MenuSideBar;
