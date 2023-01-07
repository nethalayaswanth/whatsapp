import { ChatTitle } from "../ChatItem";
import { ReactComponent as Close } from "../../assets/close.svg";
import { ReactComponent as Reply } from "../../assets/reply.svg";

import { ReactComponent as DefaultAvatar } from "../../assets/avatar.svg";

import { useMediaOfRoom, useMessage } from "../../queries.js/messages";
import { useUserDetails, useUserName } from "../../queries.js/user";
import { useUser } from "../../queries.js/useRequests";
import { formatDat, mergeRefs } from "../../utils";
import { useModalDispatch } from "../../contexts/modalContext";
import { Avatar } from "../Avatar";



const HeaderItem = ({ handleClick, children, style, className }) => {
  return (
    <div
      style={{ ...style }}
      className={`ml-2.5 first-of-type:ml-0 rounded-full h-full flex-none relative active:bg-icon-active ${className} `}
      onClick={handleClick}
    >
      <div className="p-2 flex items-center cursor-pointer">
        <span>{children}</span>
      </div>
    </div>
  );
};



  
export const HeaderView=({title,details,children,dp})=>{


  return (
    <div className="h-full w-full flex justify-between items-center text-primary-default ">
      <div className="flex-1 flex z-[1] mr-[15px] ml-[5px] ">
        <div className="cursor-pointer flex-none ">
          <div className="pr-[13px] pl-[15px] flex justify-center items-center">
            <div className="h-[40px] w-[40px]  ">
              <Avatar src={dp} />
            </div>
          </div>
        </div>
        <div className="flex flex-col basis-auto  justify-center min-w-0 flex-grow">
          <ChatTitle
            style={{ color: "inherit" }}
            name={title}
            className="leading-[20px]  "
          />
          <div className="text-[12px] mt-[2px]">{details}</div>
        </div>
      </div>

      <div className="justify-self-end flex items-center mr-[20px]">
        {children}
      </div>
    </div>
  );

}

export const MessageModalHeader=({roomId,messageId})=>{
  const messageQuery = useMessage({
    roomId,
    messageId,
  });

  const message = messageQuery?.data;

  const { data: userData } = useUserDetails({ userId: message?.from });
  const { data: user } = useUser();
  const modalDispatch = useModalDispatch();
  const isSenderUser = message?.from === user?.id;

  const title = isSenderUser ? "You" : userData?.name;
  const dp = userData?.dp?.url;

  const time = formatDat(message?.deliveredTime)?.date;

  const actions = [
    {
      Icon: <Reply style={{ transform: "rotateY(180deg)" }} />,
      handler: () => {},
    },
    {
      Icon: <Close />,
      handler: () => {
        modalDispatch({
          type: "set state",
          payload: { opened: false },
        });
      },
    },
  ];
  return <HeaderView title={title} details={time} dp={dp}>
{actions.map(({Icon,handler})=>{

  return <HeaderItem handleClick={handler}>
    {Icon}
  </HeaderItem>
})}
  </HeaderView>;
}


export const DpModalHeader = ({dp,close,name}) => {


  const actions = [
   
    {
      Icon: <Close />,
      handler:close,
    },
  ];
  return (
    <HeaderView title={name}  dp={dp}>
      {actions.map(({ Icon, handler }) => {
        return <HeaderItem handleClick={handler}>{Icon}</HeaderItem>;
      })}
    </HeaderView>
  );
};

