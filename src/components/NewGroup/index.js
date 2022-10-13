import { useSidebar } from "../../contexts/sidebarContext";

import DrawerHeader from "../header/drawer";

const NewGroup = () => {
  const [sideBar, dispatch] = useSidebar();

  const isFromHeader = sideBar.from === "header";
  const isFromNewChat = sideBar.from === "new chat";
  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <DrawerHeader
          onClick={() => {
            dispatch(
              isFromNewChat
                ? {
                    type: "set state",
                    payload: {
                      active: "new chat",
                      from: "new group",
                    },
                  }
                : { type: "toggle" }
            );
          }}
          name={"New Group"}
        />
      </div>
    </span>
  );
};

export default NewGroup;
