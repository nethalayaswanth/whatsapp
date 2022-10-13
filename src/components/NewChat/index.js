import DrawerHeader from "../header/drawer";
import { useSidebar } from "../../contexts/sidebarContext";
import { useOnlineUsers } from "../../requests.js/useRequests";
import ChatList from "../ChatList/ChatList";
import { useAppState } from "../../contexts/appStateContext";
import { useCallback, useMemo } from "react";
import { createRoomId } from "../../utils";
import { uploadTos3 } from "../../requests.js/api";
import { useUser, useRooms } from "../../requests.js/useRequests";
import { useQueryClient } from "@tanstack/react-query";

const NewChat = () => {
  const [sidebarState, sideBarDispatch] = useSidebar();

  const { data } = useOnlineUsers();

  
  const app = useAppState();
  const { data:{ user} } = useUser();
  const { data: rooms } = useRooms({
    refetchOnMount: false,
  });
  const draft = app.state.draftRooms;

  const list = useMemo(() => {
    let list = [];
    if (data) {
      Object.entries(data).forEach(([id, item], index) => {
        list.push({
          targetUserId: item.id,
          name: item.username,
          details: item.about,
        });
      });
      return list;
    }

    return null;
  }, [data]);

   const queryClient = useQueryClient();

  const handleRoom = useCallback(
    (preview) => {
      const roomId = createRoomId([preview.targetUserId, user.id]);
       

      app.dispatch({
        type: "set current room",
        payload: {
          ...preview,
          roomId: roomId,
          name: preview.name,
        },
      });
      // if (rooms && rooms[roomId]) {
      //   app.dispatch({
      //     type: "set current room",
      //     payload: {
      //       ...preview,
      //       id: roomId,
      //       name: preview.name,
      //       targetUserId: preview.id,
      //     },
      //   });
      //   return;
      // }
      // app.dispatch({
      //   type: "new room",
      //   payload: {
      //     ...preview,
      //     id: roomId,
      //     name: preview.name,
      //     targetUserId: preview.id,
      //   },
      // });
    },
    [app, user.id]
  );

  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <DrawerHeader
          onClick={() => {
            sideBarDispatch({ type: "toggle" });
          }}
          name={"New Chat"}
        />
        <div
          onClick={() => {
            sideBarDispatch({
              type: "set state",
              payload: {
                active: "new group",
                from: "new chat",
              },
            });
          }}
          className="w-full h-[64px] bg-slate-50  "
        ></div>
        <ChatList list={list} onClick={handleRoom} />
      </div>
    </span>
  );
};

export default NewChat;
