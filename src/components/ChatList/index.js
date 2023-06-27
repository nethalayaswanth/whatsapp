import React from "react";
import { useReorderedRooms } from "../../queries.js/rooms";

import List from "../orderAnimation";
import { ChatRoom } from "../listItem";

const ChatList = ({ rooms, user }) => {
  const reOrderedRooms = useReorderedRooms({ user, rooms });

  return (
    <div className="flex-grow bg-white flex  z-[1] relative scrollbar">
      <div className="relative flex-1 scrollbar">
        {reOrderedRooms && reOrderedRooms.length !== 0 ? (
          <List order={reOrderedRooms} getKey={(item) => item.props.roomId}>
            {reOrderedRooms.map((roomId, index) => {
              return <ChatRoom key={roomId} roomId={roomId} />;
            })}
          </List>
        ) : null}
      </div>
    </div>
  );
};

export default ChatList;
