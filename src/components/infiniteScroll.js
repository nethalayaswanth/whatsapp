import { cloneElement } from "react";
import { useState } from "react";
import { useEffect, useRef, useLayoutEffect, memo } from "react";
import { useInView } from "react-intersection-observer";
import flattenChildren from "react-keyed-flatten-children";



const InfiniteScroll=({itemsLength,children,hasMore,Loader,EndOfMessages,loadMore,scrollElement,threshold=0.2})=>{

    const prevScrollTop=useRef(0)
    const prevscrollheight=useRef(0)
    const actionTriggered=useRef(false)
    const loadMoreRef=useRef()
    const ref=useRef()
   
    const [inView,setInView]=useState(false)

 const scroll = scrollElement.current;


 useLayoutEffect(()=>{loadMoreRef.current = loadMore;},[loadMore])
 
 
  useLayoutEffect(() => {
  
 
  if (!scroll) return;
 

     const handleScroll=(e)=>{


    const loaderTop=ref.current.getBoundingClientRect().top
    const scrollerTop= scroll.getBoundingClientRect().top
    const threshold=200
    const inView = loaderTop > scrollerTop - 200;
    
    // console.log("inview", inView, actionTriggered.current);
    if (inView && !actionTriggered.current) {
      actionTriggered.current = true;
      loadMoreRef.current?.();
    }
 
    // console.log("scroll", scroll.scrollTop, scroll.scrollHeight);
      prevScrollTop.current = scroll.scrollTop;
      prevscrollheight.current = scroll.scrollHeight;

     }
     handleScroll()
   
      scroll.addEventListener("scroll", handleScroll, {
        passive: true,
      })
    

    return () => {
      if (scroll) {
        scroll.removeEventListener("scroll", handleScroll);
     
    };
  }}, [loadMore, scroll])


useLayoutEffect(() => {

  let timeout;



  if (!scroll) return;

    console.log(scroll.scrollHeight, scroll.scrollTop, prevscrollheight.current);

   const scrollTop =
     scroll.scrollHeight + scroll.scrollTop - prevscrollheight.current;
   scroll.scroll({
     top: scrollTop,
   });

   prevScrollTop.current = scrollTop;
   prevscrollheight.current = scroll.scrollHeight;
   actionTriggered.current = false;

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };

}, [itemsLength, scroll]);

    return (
      <>
        {
           cloneElement(children, { ref: ref })
          }
       
      </>
    );

}

export default memo(InfiniteScroll)