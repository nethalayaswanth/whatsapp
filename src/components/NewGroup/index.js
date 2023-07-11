import { Suspense, useCallback } from "react";
import {
  useSidebarDispatch,
  useSidebarState,
} from "../../contexts/sidebarContext";

import { ReactComponent as Arrow } from "../../assets/arrow.svg";
import Discover from "../discover";
import DrawerHeader from "../header/drawer";
import Spinner from "../spinner";
import Selected from "./selected";

const NewGroup = () => {
  const { selected, from } = useSidebarState();
  const dispatch = useSidebarDispatch();

  const isFromNewChat = from === "new chat";

  const handleClick = useCallback(
    (user) => {
      //console.log(user);
      dispatch({ type: "select", user });
    },
    [dispatch]
  );

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
        <div className="flex-grow bg-white flex flex-col z-[1] relative scrollbar">
          {selected && selected.length !== 0 && (
            <div className="px-[27px] flex text-text-secondary  pt-[26px] pb-[12px]">
              <div className="flex-1   border-solid border-border-list pl-[2px] pb-[2px] pt-[6px]">
                <ul className="list-none">
                  {selected.map((user, index) => {
                    return (
                      <Selected
                        key={index}
                        id={user?.id}
                        name={user?.name}
                        dp={user.dp?.previewUrl}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "deselect", id: user.id });
                        }}
                      />
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          <Suspense fallback={<Spinner />}>
            <Discover selected={selected} handleClick={handleClick} />
          </Suspense>
        </div>
        {selected.length !== 0 && (
          <span className="pb-[40px] pt-[24px] flex flex-col justify-center items-center">
            <div
              onClick={() => {
                dispatch({
                  type: "set state",
                  payload: {
                    active: "create group",
                    from: "new group",
                  },
                });
              }}
              className="rounded-full cursor-pointer h-[46px] w-[46px] flex justify-center items-center bg-panel-header-coloured shadow-lg text-white"
            >
              <span>
                <Arrow style={{ transform: "rotateY(180deg)" }} />
              </span>
            </div>
          </span>
        )}
      </div>
    </span>
  );
};

export default NewGroup;
