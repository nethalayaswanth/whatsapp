import {
  useEffect,
  useMemo,
  useRef,
  useContext,
  createContext,
  useState,
} from "react";
import { useUser } from "../requests.js/useRequests";
import io from "socket.io-client";
import { useAppState } from "./appStateContext";
import { parseRoomName } from "../utils";
import { useQueryClient } from "@tanstack/react-query";

const SocketContext = createContext();

export const SocketProvider = ({ children, ...props }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  const { data: {user} } = useUser();

  const socket = socketRef.current;
  useEffect(() => {
    if (user === null) {
      if (socket !== null) {
        socket.disconnect();
      }
      setConnected(false);
    } else {
      if (socket !== null) {
        
        socket.connect();
      } else {
        socketRef.current = io("http://localhost:4000", {
          withCredentials: true,
        });
      }
      setConnected(true);
    }
  }, [socket, user]);

  useEffect(() => {
    if (socket && connected && user) {
      socket.on("user.connected", (recentlyConnectedUser) => {

        queryClient.setQueryData(["user", recentlyConnectedUser.id], (old) => ({
          ...old,
          username: recentlyConnectedUser.username,
          name: recentlyConnectedUser.name,
          isOnline: recentlyConnectedUser.isOnline,
        }));
      });
      socket.on("user.disconnected", (recentlyDisconnectedUser) => {
        queryClient.setQueryData(
          ["user", recentlyDisconnectedUser.id],
          (old) => ({
            ...old,
            isOnline: false,
          })
        );
      });

      socket.on("new.room", (newRoom) => {
        const room = {};
        socket.emit("room.join", newRoom.roomId);
        room[newRoom.roomId] = { ...newRoom, connected: true };

        queryClient.setQueryData(["rooms"], (old) => ({ ...old, ...room }));
      });
      socket.on("message", (message) => {
        queryClient.setQueryData(["messages", message.roomId], (old) => [
          ...old,
          message,
        ]);

        
        queryClient.setQueryData(["rooms"], (old) => ({
          ...old,
          [message.roomId]: {
            ...old[message.roomId],
            lastMessage: message.lastMessage,
            unread:message.unread 
          },
        }));
      });

       socket.on("typing", (message) => {
         queryClient.setQueryData(["rooms"], (old) => ({
           ...old,
           [message.roomId]: {
             ...old[message.roomId],
             typing:Date.now(),
           },
         }));
       });

    } else {
      if (socket) {
        socket.off();
      }
    }
  }, [socket, connected, user, queryClient]);

  const value = [socket, connected];

  value.socket = socket;
  value.connected = connected;
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export default useSocket;
