import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";
import { ReactComponent as MenuIcon } from "../../assets/menu.svg";
import { ChatTitle } from "../ChatItem";
import { HeaderItem } from "./Header";

const ChatHeader = ({ title, details, typing, onClick = () => {} }) => {
  const handleClick = () => {
    console.log('clicked')
    onClick?.();
  };
  return (
    <div className="header border-l z-[100] border-solid border-border-header justify-start">
      <button className="flex justify-center flex-1 flex-shrink-0 " onClick={handleClick}>
        <div className="cursor-pointer pr-[15px]">
          <div className="h-[40px] w-[40px] ">
            <DefaultAvatar />
          </div>
        </div>
        <div className="flex flex-col basis-auto  justify-center min-w-0 flex-grow">
          <ChatTitle name={title} className='leading-[20px]' details={typing || details} />
          <div className="text-[12px]">{typing || details}</div>
        </div>
      </button>
      <div className="ml-[20px]">
        <HeaderItem>
          <MenuIcon />
        </HeaderItem>
      </div>
    </div>
  );
};

export default ChatHeader;
