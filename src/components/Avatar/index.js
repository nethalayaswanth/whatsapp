



import { useState } from "react";
import { useRef, useMemo } from "react";
import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";


export const Avatar=({src,children,width=40})=>{

const mountPlaceHolder=useRef(true)
const [_,render]=useState()
const prevSrc=useRef()

// const prev=useMemo(()=>{

// const prev = prevSrc.current;

// prevSrc.current = src;
// const changed = prev !== src;
// if (changed && src){
//   mountPlaceHolder.current=true
//   const img=new Image()
//   img.src=src
//   img.onload=()=>{
// mountPlaceHolder.current=false
// render()
//   }

//   return prev };

//  return null;
// },[src]) 
  
// const onLoad=()=>{


// }


    return (
      <div className=" z-0 h-full w-full rounded-full overflow-hidden ">
        {src ? (
          <img src={src} alt="animate-fadeIn" />
        ) : children ? (
          children
        ) : (
          <DefaultAvatar />
        )}
      </div>
    );
}