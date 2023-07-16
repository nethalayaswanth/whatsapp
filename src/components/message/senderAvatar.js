import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "../../contexts/appStore";
import { createRoomId } from "../../utils";
import { useCallback } from "react";
import { Avatar } from "../Avatar";

export default function SenderAvatar({ senderDp, senderId }) {
  const appDispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const handleClick = useCallback(() => {
    const user = queryClient.getQueryData(["user"]);

    const roomId = createRoomId([senderId, user.id]);
    appDispatch({
      type: "set current room",
      payload: {
        roomId: roomId,
        member: senderId,
        type: "private",
      },
    });
  }, [appDispatch, queryClient, senderId]);

  return (
    <div>
      <button
        onClick={handleClick}
        className="absolute w-[28px] h-[28px] rounded-full cursor-pointer left-[-38px]"
      >
        <Avatar src={senderDp} />
      </button>
    </div>
  );
}