import { useSenderDetails } from "../../queries.js/users";

const AddedToGroup = ({
  receiverId,
  isSenderUser,
  roomId,
  isReceiverUser,
  sender,
}) => {
  const receiver = useSenderDetails({ userId: receiverId, roomId });
  const senderName = sender?.name || sender.id;
  const receiverName = receiver?.name || receiver.id;
  const senderDp = sender?.dp?.previewUrl;
  return `${isSenderUser ? "you" : senderName} added ${
    isReceiverUser ? "you" : receiverName
  }`;
};

export default AddedToGroup;
