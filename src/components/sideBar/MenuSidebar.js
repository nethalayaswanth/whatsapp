import React from "react";

import { useSidebarState } from "../../contexts/sidebarContext";
import Disclosure from "../Disclosure";
import NewChat from "../NewChat";
import NewGroup from "../NewGroup";
import CreateNewGroup from "../NewGroup/createGroup";
import Profile from "../profile";

const MenuSideBar = () => {
  const {open,active,from} = useSidebarState();

  const newChatActive = open && active === "new chat";
  const newGroupActive = open && active === "new group";
  const profileActive = open && active === "profile";
  const createGroupActive = open && active === "create group";
  const fromGroupChat = from === "new group";
  const fromNewChat = from === "new chat";

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
        direction={fromNewChat ? "right" : "left"}
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
