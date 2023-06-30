import raf from "raf";
import { useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import useMedia from "../../hooks/useMedia";
import useMount from "../../hooks/useMount";

 function ModalWrapper({
   width = "500px",
   height = "500px",
   style,
   show,
   children,
   animate = true,
   unMount,
 }) {
   const initialStyles = animate
     ? {
         ...style,
         transform: "scaleX(0) scaleY(0)",
         opacity: 0,
       }
     : {
         ...style,
         transform: "scaleX(1) scaleY(1)",
         opacity: 1,
       };

   const [styles, setStyles] = useState(initialStyles);

   console.log('modal');
   if (!animate && !show) {
     unMount();
   }

   useLayoutEffect(() => {
     if (!animate) return;

     if (show) {
       raf(() => {
         setStyles((old) => {
           return {
             ...old,
             transform: "scaleX(0) scaleY(0)",
             opacity: 0,
           };
         });

         raf(() => {
           setStyles((old) => ({
             ...old,
             transform: "scaleX(1) scaleY(1)",
             opacity: 1,
             transition: "all ease-out 0.3s ",
           }));
         });
       });
       return;
     }
     if (!show) {
       raf(() => {
         setStyles((old) => ({
           ...old,
           transform: "scaleX(0) scaleY(0)",
           opacity: 0,
         }));
       });
     }
   }, [animate, show]);

   const handleTransitionEnd = () => {
     if (!show) {
       unMount(false);
     }
   };

   const device = useMedia();
   const mobile = device === "mobile";

   return (
     <>
       <div className="absolute t-0 l-0 b-0 r-0 z-[1000]">
         <div className="fixed  flex items-center  justify-center  top-0 l-0 w-full h-full bg-[hsla(0,0%,100%,0.85)]">
           <div className="flex items-center justify-center  w-full h-full ">
             <div
               style={{
                 ...(mobile ? { width: "100%", height: "100%" } : { width }),
                 ...styles,
               }}
               onTransitionEnd={handleTransitionEnd}
               className=" bg-white relative"
             >
               {children}
             </div>
           </div>
         </div>
       </div>
       ,
     </>
   );
 }

export const Modal = (props) => {
  const {show}=props
  const [mount, unMount] = useMount(show);
  const root = useMemo(() => document.getElementById("globalmodal"), []);

  return (
    <>
      {mount &&
        createPortal(<ModalWrapper {...props} unMount={unMount} />, root)}
    </>
  );
};
