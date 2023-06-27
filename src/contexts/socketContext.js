import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useUser } from "../queries.js/useRequests";

const SocketContext = createContext();

export const SocketProvider = ({ children, ...props }) => {
  const engine = useRef(
    io("http://localhost:4000", {
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
        console.log("connec socket");
        socket.connect()
      }else{
   engine.current = io("http://localhost:4000", {
     withCredentials: true,
   });
      }
      setConnected(true)
    }
  }, [user.verification]);

  useEffect(() => {

    if (connected ) {
      const socket = engine.current;

      socket.on("verification", (user) => {
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
        // console.log(data,'newroom')
        const { room, message } = data;

        socket.emit("joinRoom", room.roomId);

        queryClient.setQueryData(["rooms"], (old) => ({
          ...(old && old),
          [room.roomId]: {
            ...(old[room.roomId] && old[room.roomId]),
            ...room,
            lastMessage: message,
            unread: old[message.roomId].unread
              ? old[message.roomId].unread + 1
              : 1,
          },
        }));

        queryClient.setQueryData([message.roomId, "messages"], (old) => ({
          ...old,
          [message.id]: {
            ...message,
          },
        }));
      });

      socket.on("deleteMessage", (message) => {
        console.log(message);
        const { messageId, roomId, everyone } = message;

        if (everyone) {
          queryClient.setQueryData([roomId, "messages"], (old) => {
             if (!old.messages) return old;
             const { [messageId]: deleted, ...rest } = old.messages;
            return {
              ...old,
              messages: {
                ...rest,
                [messageId]: {
                  ...deleted,
                  message: { text: "", type: "deleted" },
                },
              },
            };
          });
          return;
        }

        queryClient.setQueryData([roomId, "messages"], (old) => {
          if(!old.messages) return old
          const { [messageId]: removed, ...rest } = old.messages;

         
          return {
            ...old,
            messages: {
              ...rest,  
            },
          };
        });
      });

      socket.on("message", (data) => {
    
        const { room, message } = data;

        console.log(room, message);

        const lastMessagetime = message?.deliveredTime || message?.sendTime;

        queryClient.setQueryData(["rooms"], (old) => {
          return {
            ...(old && old),
            [message.roomId]: {
              ...(old && old[message.roomId]),
              ...(room &&  room ),
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
        }));
      });

      socket.on("typing", (payload) => {
        console.log(payload);
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
         console.log(socket.id,'disconnected'); // undefined
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
