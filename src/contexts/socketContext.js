import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useUser } from "../queries.js/useRequests";
import { endpoint } from "../queries.js/endpoint";
const SocketContext = createContext();

export const SocketProvider = ({ children, ...props }) => {
  const engine = useRef(
    io(endpoint, {
      withCredentials: true,
    })
  );
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useUser();

  useEffect(() => {
    const socket = engine.current;
    if (user.verification === null) {
      if (socket !== null && socket.connected) {
        socket.disconnect();
        setConnected(false);
      }
    } else {
      if (socket !== null) {
        //console.log("connec socket");
        socket.connect();
      } else {
        engine.current = io(endpoint, {
          withCredentials: true,
        });
      }
      setConnected(true);
    }
  }, [user.verification]);

  useEffect(() => {
    if (connected) {
      const socket = engine.current;
      socket.on("verification", (user) => {
        console.log(user)
        queryClient.setQueryData(["user"], (old) => ({
          ...old,
          ...user,
        }));
      });
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

      socket.on("user update", (payload) => {
        queryClient.setQueryData(["user", payload.id], (old) => ({
          ...old,
          ...payload,
        }));
      });

      socket.on("newRoom", (data) => {
        //console.log(data, "newroom");
        const { room, messages } = data;

        if (room) {
          const { roomId, type, pinned } = room;
          socket.emit("joinRoom", room.roomId);

          queryClient.setQueryData(["rooms"], (old) => ({
            ...(old && old),
            [room.roomId]: {
              ...(old[room.roomId] && old[room.roomId]),
              roomId,
              type,
              pinned,
            },
          }));
          queryClient.setQueryData(["room", room.roomId], (old) => ({
            ...(old && old),
            ...room,
          }));
        }

        queryClient.setQueryData([room.roomId, "messages"], (old) => ({
          ...old,
          messages: {
            ...old.messages,
            ...messages,
          },
          latestUpdate: "MESSAGEBYREMOTEUSER",
        }));
      });

      socket.on("deleteMessage", (message) => {
        const { messageId, roomId, everyone } = message;

        console.log(message)
        if (everyone) {
          queryClient.setQueryData([roomId, "messages"], (old) => {
            if (!old.messages) return old;
            let message=old.messages[messageId]
            if(message){
               return {
                 ...old,
                 messages: {
                   ...old.messages,
                   [messageId]: {
                     ...message,
                     message: { text: "", type: "deleted" },
                   },
                 },
                 latestUpdate: "MESSAGEDELETEDBYREMOTEUSER",
               };
            }else {
              return old
            };
          
          });
        } else {
          queryClient.setQueryData([roomId, "messages"], (old) => {
            if (!old.messages) return old;
            const { [messageId]: removed, ...rest } = old.messages;
            return {
              ...old,
              messages: {
                ...rest,
              },
              latestUpdate: "MESSAGEDELETEDBYUSER",
            };
          });
        }
        queryClient.setQueryData([roomId, "media"], (old) => {
          if (!old) return old;
          const index = old.indexOf(messageId);

          if (index !== -1) {
            return old;
          } else {
            old.splice(index, 1);
            return [...old];
          }
        });
        queryClient.setQueryData([roomId, "documents"], (old) => {
          if (!old) return old;
          const index = old.indexOf(messageId);
          if (index !== -1) {
            return old;
          } else {
            old.splice(index, 1);
            return [...old];
          }
        });
      });

      socket.on("message", (data) => {
        const { room, message } = data;

        //console.log(room, message);

        queryClient.setQueryData(["rooms"], (old) => {
          return {
            ...(old && old),
            [message.roomId]: {
              ...(old && old[message.roomId]),
              ...(room && room),
              unread: old[message.roomId].unread
                ? old[message.roomId].unread + 1
                : 1,
            },
          };
        });

        queryClient.setQueryData([message.roomId, "messages"], (old) => ({
          ...old,
          messages: {
            ...old.messages,
            [message.id]: {
              ...message,
            },
          },
          latestUpdate: "MESSAGEBYREMOTEUSER",
        }));
      });

      socket.on("typing", (payload) => {
        queryClient.setQueryData(["room", payload.roomId], (old) => {
          return {
            ...(old && old),

            notification: { ...payload, action: "TYPING" },
          };
        });
      });

      socket.on("connect", () => {
        console.log(socket.id, "socket connected");
        setConnected(true);
      });

      socket.on("disconnect", () => {
        //console.log(socket.id,'disconnected'); // undefined
        setConnected(false);
      });
    }
    //  else {
    //   if (socket) {
    //     socket.off();
    //   }
    // }
  }, [connected, queryClient]);



  const socket = engine.current;
  const value = [socket, connected];

  value.socket = socket;
  value.connected = true;
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
