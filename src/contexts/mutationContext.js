import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { uploadMessage } from "../queries.js/api.js";
import useSocket from "./socketContext";

const MutationContext = createContext();

export default function MutationProvider({ children }) {


    const queryClient = useQueryClient();

    const abortRefs=useRef({})


    const progressCb=useCallback(({ progress, id, roomId }) => {
         console.log({ progress, id, roomId });

         const circle = document.getElementById(`${id}-progress-circle`);

         if (!circle) return;
         const radius = circle.r.baseVal.value;
         const circumference = radius * 2 * Math.PI;
         const offset = circumference - (progress / 100) * circumference;
         circle.style.strokeDashoffset = offset;
       },[])

    const cancelMessage = useCallback((id) => {

const AbortController = abortRefs.current[id]

AbortController.abort()

       }, []);

     useEffect(() => {
      
       queryClient.setMutationDefaults(["rooms", "messages"], {
         mutationFn: async ({ ...args }) => {
           console.log("signal");
           await queryClient.cancelQueries(["messages", args.roomId]);
           const controller = new AbortController();
           const signal = controller.signal;
           abortRefs.current[args.id] = controller;
           return uploadMessage({
              signal,
             ...args,
             progressCb: (progress) => {
               progressCb({ progress, ...args });
             },
           });
         },
       });
       queryClient.resumePausedMutations();
     }, [progressCb, queryClient]);


     const [socket, socketConnected] = useSocket();

     const postMessage = useMutation({
       
       mutationKey: ["rooms", "messages"],
       retry:0,
       onMutate: async (message) => {

        const roomId=message.roomId
         await queryClient.cancelQueries([roomId, "messages"]);
         const previousData = queryClient.getQueryData([roomId, "messages"]);

         console.log(message)

         queryClient.setQueryData([roomId, "messages"], {
           ...(previousData && previousData),
           messages: {
             ...(previousData.messages && previousData.messages),
             [message.id]: {
               ...message,
               status: { sending: true, error: false },
             },
           },
         });

         
          queryClient.setQueryData(["rooms"], (old) => ({
            ...(old && old),
            [roomId]: {
              ...(old && old[roomId]),
              lastSeenAt: message.sendTime,
            },
          }));

          console.log('setdata')

         return { previousData };
       },

       onError: async (error, variables, context) => {

        if (error.name==='CanceledError'){
         const roomId = variables.roomId;
         queryClient.setQueryData([roomId, "messages"], (old) => ({
           ...old,
           messages:{
 
            ...old.messages,
           [variables.id]: {
             ...old.messages[variables.id],
             status: { sending: false, error: true },
           },
         }}));}
       },
       onSuccess: async (data) => {


        
         console.log(data,'success');

         if (!socket) {
           console.error("Couldn't send message");
         }

         const roomId = data.roomId;
         await queryClient.cancelQueries([roomId, "messages"]);

          abortRefs[data.id] =null ;

         if (data) {
           console.log("emiting");

           const {original,preview,...rest}=data.message
           const messagePayload = {
             ...data,
             message: {
               ...rest,
               ...(original && { original: { url: original.url } }),
               ...(preview && { preview: { url: preview.url } }),
             },
           };

           console.log(messagePayload)
           
           socket.emit("message", messagePayload, (res) => {
             console.log("success");

             const message = {
               ...data,
               ...res,
               status: { sending: false, error: false },
             };

             queryClient.setQueryData([roomId, "messages"], (old) => ({
               ...old,

               messages: {
                 ...old.messages,
                 [message.id]: {
                   ...data,
                   ...res,
                   status: { sending: false, error: false },
                 },
               },
             }));
           });
         }
       },
       
     });


     const {mutate:sendMessage}=postMessage


   

  //    useEffect(() => {
  // console.log("%cheha", "color:red;font-size:32px");
  //    }, [postMessage]);
     
  return (
    <MutationContext.Provider value={{ sendMessage, cancelMessage }}>
      {children}
    </MutationContext.Provider>
  );
}

export function useMessageMutation() {

   
  const context = useContext(MutationContext);

  if (context === undefined) {
    throw new Error(
      "useMessageMutation must be used within a MutationProvider "
    );
  }
  return context;
}


