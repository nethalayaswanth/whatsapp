
import * as React from "react";
import { useRoom } from "../queries.js/rooms";
import { useAppState } from "./appStateContext";

const RoomContext = React.createContext();



function RoomProvider({ children, ...props }) {

   const [state, dispatch] = useAppState();



   const roomMeta = state.currentRoom;

 
       const room =   useRoom({ roomMeta });


       console.log(room)

  return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>;
}

function useChatRoom() {
  const context = React.useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useChatRoom must be used within a RoomProvider");
  }
  return context;
}

export { RoomProvider, useChatRoom };
