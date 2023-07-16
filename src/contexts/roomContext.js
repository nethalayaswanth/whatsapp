import * as React from "react";

import { useRoom } from "../queries.js/rooms";
import { useAppState } from "./appStore";

const RoomContext = React.createContext();

function RoomProvider({ children }) {
  const { roomId, roomType, member } = useAppState();

  const room = useRoom({ roomId, type: roomType, member });

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
