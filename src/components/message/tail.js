
import { ReactComponent as TailIn } from "../../assets/tail.svg";
import { ReactComponent as TailOut } from "../../assets/tailOut.svg";

const Tail = ({ incoming }) => {
  return (
    <span
      className={`w-[8px]   absolute top-0 z-[100] block h-[13px] ${
        !incoming
          ? "text-message-outgoing right-[-8px]"
          : "text-message-incoming left-[-8px]"
      }`}
    >
      {incoming ? <TailIn /> : <TailOut />}
    </span>
  );
};

export default Tail