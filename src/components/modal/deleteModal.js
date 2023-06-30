import { useCallback } from "react";
import { createContext, useContext, useState } from "react";
import createStore from "../../contexts/exStore";
import useSocket from "../../contexts/socketContext";
import { Modal } from "../modal";

const deleteActions = ["Delete for everyone", "Delete for me", "Cancel"];

function DeleteDialog() {
  
  
  const {isSenderUser, deleted, roomId, messageId } =
    useDeleteState();
  const dispatch=useDeleteDispatch()
  const [socket, socketConnected] = useSocket();

  console.log(isSenderUser, deleted, roomId, messageId);
  const handleDeleteAction = useCallback(
    async (action) => {
      switch (action) {
        case "Delete for everyone": {
          socket.emit(
            "deleteMessage",
            {
              roomId,
              messageId,
              everyone: true,
            },
            (res) => {}
          );
          dispatch({type:'reset'})
          break;
        }
        case "Delete for me": {
          socket.emit("deleteMessage", {
            roomId,
            messageId,
            everyone: false,
          });
          dispatch({ type: "reset" });
          break;
        }
        case "Cancel": {
          dispatch({ type: "reset" });
          break;
        }
        default: {
        }
      }
    },
    [messageId, roomId,dispatch, socket]
  );
  return (
    <div className="flex h-full w-full p-[24px] justify-center items-center ">
      <div className="px-[24px] pt-[22px] pb-[20px] bg-white rounded-[3px] shadow-lg flex  flex-col flex-1 basis-[100%] ">
        <div className="leading-[20px] text-[14.2px]">Delete message</div>
        <div className="text-right pt-[50px] px-[5px] flex justify-end overflow-hidden whitespace-nowrap  flex-wrap-reverse">
          <div className="flex flex-col">
            {deleteActions.map((label) => {
              if (
                label === "Delete for everyone" &&
                (!isSenderUser || (isSenderUser && deleted))
              ) {
                return null;
              }
              return (
                <div key={label} className="mt-[12px] first:mt-[0px]">
                  <div
                    onClick={() => {
                      handleDeleteAction(label);
                    }}
                    className="mb-[5px] rounded-[3px] cursor-pointer px-[24px] py-[10px] border border-solid inline-block whitespace-pre-wrap font-[500] border-border-list hover:shadow-sm"
                  >
                    <div className="flex min-w-0 min-h-0 justify-center items-center text-[14px] tracking-[1.25px]  leading-normal text-spa text-primary-teal ">
                      {label.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


const DeleteContext = createContext();

const initialState = {
  show: false,
  isSenderUser: null,
  deleted: null,
  roomId: null,
  messageId: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "set state":
      return { ...state, ...action.payload };
    case "reset":
      return { ...initialState};
    default:
      return state;
  }
};

export default function DeleteModal({children}) {
  const [store] = useState(() => createStore(initialState));

  const {show}=store
  return (
    <DeleteContext.Provider value={store}>
      {children}
      <Modal show={show}>
        <DeleteDialog />
      </Modal>
    </DeleteContext.Provider>
  );
}

function useDeleteState() {
  const context = useContext(DeleteContext);
  if (context === undefined) {
    throw new Error("useDeleteState must be used within a DeleteModal");
  }
  return context;
}

export function useDeleteDispatch() {
  const context = useContext(DeleteContext);
  if (context === undefined) {
    throw new Error("useDeleteDispatch must be used within a DeleteModal");
  }

  const dispatch = useCallback(
    (action) => {
      context((state) => reducer(state, action));
    },
    [context]
  );
  return dispatch;
}


