import { useQueryClient } from "@tanstack/react-query";
import { Suspense, useCallback } from "react";
import { ReactComponent as Group } from "../../assets/group.svg";
import { useAppDispatch } from "../../contexts/appStore";
import { useSidebarDispatch } from "../../contexts/sidebarContext";
import { createRoomId } from "../../utils";
import CardView from "../card/cardView";
import Discover from "../discover";
import DrawerHeader from "../header/drawer";
import Spinner from "../spinner";

export default function NewChat() {
  const sideBarDispatch = useSidebarDispatch();

  const dispatch = useAppDispatch();

  const queryClient = useQueryClient();

  const handleNewGroup = useCallback(() => {
    sideBarDispatch({
      type: "set state",
      payload: {
        active: "new group",
        from: "new chat",
      },
    });
  }, [sideBarDispatch]);

  const handleRoom = useCallback(
    (preview) => {
       
      const user = queryClient.getQueryData(["user"]);
      const roomId = createRoomId([preview.id, user.id]);
      dispatch({
        type: "set current room",
        payload: {
          roomId: roomId,
          member: preview.id,
          type: "private",
        },
      });
    },
    [dispatch, queryClient]
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
        <Suspense
          fallback={
            <div className="flex-grow bg-white flex justify-center items-center z-[1] relative ">
              <Spinner className={"fill-panel-header-coloured"} />
            </div>
          }
        >
          <Discover handleClick={handleRoom}>
            <CardView
              onClick={handleNewGroup}
              title={"New group"}
              className="border-b-[1px]"
              avatar={
                <div className="rounded-full text-white h-full w-full flex justify-center items-center bg-primary-teal">
                  <span className="text-[transparent]">
                    <Group />
                  </span>
                </div>
              }
            />
          </Discover>
        </Suspense>
      </div>
    </span>
  );
}
