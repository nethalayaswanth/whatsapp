import React, { useCallback } from "react";
import { ReactComponent as ChatIcon } from "../../assets/chat.svg";
import { ReactComponent as MenuIcon } from "../../assets/menu.svg";
import { useSidebarDispatch } from "../../contexts/sidebarContext";
import { useLogout } from "../../queries.js/useRequests";
import { callAll } from "../../utils";
import { Avatar } from "../Avatar";
import { MenuContainer } from "../Menu";
import ToolTip from "../tooltip";

const items = ["New Group", "New Chat", "Log Out"];

export const HeaderItem = ({ children, name, style, className, onClick }) => {
  const handleClick = useCallback(
    (e) => {
      onClick?.(name);
    },
    [onClick, name]
  );
  return (
    <div
      style={{ ...style }}
      className={`ml-2.5 first-of-type:ml-0 rounded-full h-full flex-none relative active:bg-icon-active ${className} `}
      onClick={handleClick}
    >
      <div className="p-2 flex items-center cursor-pointer">
        <span>{children}</span>
      </div>
    </div>
  );
};

const Header = ({ user }) => {
  const dispatch = useSidebarDispatch();

  const logout = useLogout();

  const handleClick = useCallback(
    (name) => {
      dispatch({
        type: "set state",
        payload: { open: true, active: name, from: "header" },
      });
    },
    [dispatch]
  );

  const handleMenuAction = (name) => {
   
    switch (name) {
      case "New Group": {
        dispatch({
          type: "set state",
          payload: { open: true, active: "new group" },
        });
        break;
      }
      case "New Chat": {
        dispatch({
          type: "set state",
          payload: { open: true, active: "new chat" },
        });
        break;
      }
      case "Log Out": {
        console.log('Log out')
        logout.mutate();
        break;
      }

      default: {
      }
    }
  };

  return (
    <div className="header z-[1000] ">
      <div className="flex-grow ">
        <div
          className="h-[40px] w-[40px]  rounded-full relative overflow-hidden cursor-pointer"
          onClick={() => {
            handleClick("profile");
          }}
        >
          <Avatar src={user?.dp?.previewUrl} />
        </div>
      </div>
      <div className="text-panel-header-icon flex-none flex items-center"></div>
      <span className="flex-row flex items-center text-panel-header-icon">
        <HeaderItem name="new chat" onClick={handleClick}>
          <ChatIcon />
        </HeaderItem>
        <ToolTip
          align="left"
          Button={
            <HeaderItem name="menu">
              <MenuIcon />
            </HeaderItem>
          }
        >
          {({ closeToolTip }) => (
            <MenuContainer
              items={items}
              onClick={callAll(handleMenuAction, closeToolTip)}
            />
          )}
        </ToolTip>
      </span>
    </div>
  );
};

export default Header;
