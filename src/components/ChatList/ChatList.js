import React from 'react'
import ChatItem from '../ChatItem'
const ChatList = ({list,onClick}) => {
  return (
    <div className='flex-grow bg-white flex flex-col z-[1] relative scrollbar'>{list && list.map((room,index)=>{

const last=list.length-1===index
      return <ChatItem onClick={onClick} key={index} data={room} last={last} />;
    })}</div>
  )
}

export default ChatList